import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchIssues,
  fetchRepositoryDescription,
  githubGraphql,
  type PostNode,
} from "../src/lib/github";

const fetchMock = vi.fn<typeof fetch>();

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

const initOf = (call: number): RequestInit | undefined =>
  fetchMock.mock.calls[call][1];

const variablesOf = (call: number): Record<string, unknown> =>
  JSON.parse(String(initOf(call)?.body)).variables;

const node = (number: number): PostNode => ({
  __typename: "Issue",
  number,
  title: `post ${number}`,
  body: "body",
  createdAt: "2021-02-18T14:50:29Z",
  url: `https://github.com/zeikar/repozine/issues/${number}`,
  author: { login: "zeikar" },
  repository: { nameWithOwner: "zeikar/repozine" },
  labels: { nodes: [] },
  comments: { totalCount: 0 },
  lastEditedAt: null,
  state: "OPEN",
});

const issuesPage = (
  nodes: PostNode[],
  endCursor: string | null,
  nameWithOwner = "zeikar/repozine",
): Response =>
  json({
    data: {
      repository: {
        nameWithOwner,
        posts: {
          pageInfo: { hasNextPage: endCursor !== null, endCursor },
          nodes,
        },
      },
    },
  });

beforeEach(() => {
  vi.stubEnv("GITHUB_TOKEN", "test-token");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("githubGraphql", () => {
  it("names GITHUB_TOKEN when it is not set", async () => {
    vi.stubEnv("GITHUB_TOKEN", undefined);

    await expect(githubGraphql("{ viewer { login } }", {})).rejects.toThrow(
      /GITHUB_TOKEN/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the token and asks for next-generation global ids", async () => {
    fetchMock.mockResolvedValue(json({ data: {} }));

    await githubGraphql("{ viewer { login } }", {});

    const headers = new Headers(initOf(0)?.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
    expect(headers.get("X-Github-Next-Global-ID")).toBe("1");
  });

  it("includes the status of a non-200 response", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));

    await expect(githubGraphql("{ viewer { login } }", {})).rejects.toThrow(
      /502/,
    );
  });

  it("includes the type and message of each GraphQL error", async () => {
    fetchMock.mockResolvedValue(
      json({
        data: null,
        errors: [{ type: "RATE_LIMITED", message: "API rate limit exceeded" }],
      }),
    );

    await expect(githubGraphql("{ viewer { login } }", {})).rejects.toThrow(
      /RATE_LIMITED: API rate limit exceeded/,
    );
  });
});

describe("fetchIssues", () => {
  it("follows the cursor across pages and concatenates the nodes", async () => {
    fetchMock
      .mockResolvedValueOnce(issuesPage([node(1), node(2)], "cursor-1"))
      .mockResolvedValueOnce(issuesPage([node(3)], null));

    const nodes = await fetchIssues("zeikar", "repozine");

    expect(nodes.map(({ number }) => number)).toEqual([1, 2, 3]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(variablesOf(0)).toMatchObject({
      owner: "zeikar",
      repo: "repozine",
      cursor: null,
    });
    expect(variablesOf(1)).toMatchObject({
      owner: "zeikar",
      repo: "repozine",
      cursor: "cursor-1",
    });
  });

  it("throws when the repository now resolves to another name", async () => {
    fetchMock.mockResolvedValue(
      issuesPage([node(1)], null, "zeikar/renamed-repo"),
    );

    await expect(fetchIssues("zeikar", "repozine")).rejects.toThrow(
      /zeikar\/renamed-repo/,
    );
  });

  it("accepts the repository name in another letter case", async () => {
    fetchMock.mockResolvedValue(issuesPage([node(1)], null, "Zeikar/RepoZine"));

    await expect(fetchIssues("zeikar", "repozine")).resolves.toHaveLength(1);
  });
});

describe("fetchRepositoryDescription", () => {
  it.each([
    ["the description", "Turn issues into a blog", "Turn issues into a blog"],
    ["null for a blank description", "  ", null],
    ["null when there is none", null, null],
  ])("returns %s", async (_, description, expected) => {
    fetchMock.mockResolvedValue(
      json({ data: { repository: { description } } }),
    );

    await expect(
      fetchRepositoryDescription("zeikar", "repozine"),
    ).resolves.toBe(expected);
    expect(variablesOf(0)).toEqual({ owner: "zeikar", repo: "repozine" });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchIssues, githubGraphql, type PostNode } from "../src/lib/github";

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
  url: `https://github.com/zeikar/issueage/issues/${number}`,
  author: { login: "zeikar" },
  repository: { nameWithOwner: "zeikar/issueage" },
  labels: { nodes: [] },
  comments: { totalCount: 0 },
  state: "OPEN",
});

const issuesPage = (
  nodes: PostNode[],
  endCursor: string | null,
  nameWithOwner = "zeikar/issueage",
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

    const nodes = await fetchIssues("zeikar", "issueage");

    expect(nodes.map(({ number }) => number)).toEqual([1, 2, 3]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(variablesOf(0)).toMatchObject({
      owner: "zeikar",
      repo: "issueage",
      cursor: null,
    });
    expect(variablesOf(1)).toMatchObject({
      owner: "zeikar",
      repo: "issueage",
      cursor: "cursor-1",
    });
  });

  it("throws when the repository now resolves to another name", async () => {
    fetchMock.mockResolvedValue(issuesPage([node(1)], null, "zeikar/repozine"));

    await expect(fetchIssues("zeikar", "issueage")).rejects.toThrow(
      /zeikar\/repozine/,
    );
  });

  it("accepts the repository name in another letter case", async () => {
    fetchMock.mockResolvedValue(issuesPage([node(1)], null, "Zeikar/IssueAge"));

    await expect(fetchIssues("zeikar", "issueage")).resolves.toHaveLength(1);
  });
});

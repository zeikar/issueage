import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchDiscussionCategory,
  fetchDiscussions,
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
  vi.restoreAllMocks();
  vi.useRealTimers();
  fetchMock.mockReset();
});

// runs a request whose retry waits on a timer, and returns its settled outcome
const settle = async <T>(request: Promise<T>) => {
  const outcome = request.then(
    (value) => ({ value }),
    (error: Error) => ({ error }),
  );
  await vi.runAllTimersAsync();
  return outcome;
};

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
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    await expect(githubGraphql("{ viewer { login } }", {})).rejects.toThrow(
      /401/,
    );
  });

  it.each([
    ["a server error", () => new Response("Bad Gateway", { status: 502 })],
    [
      "a dropped connection",
      () => Promise.reject(new TypeError("fetch failed")),
    ],
    [
      // fetch resolves once the headers arrive, so the body can still fail
      "a connection dropped while the body streams in",
      () =>
        new Response(
          new ReadableStream({
            start: (controller) =>
              controller.error(new TypeError("terminated")),
          }),
        ),
    ],
  ])("tries once more after %s, following a pause", async (_, failure) => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock
      .mockImplementationOnce(async () => failure())
      .mockResolvedValueOnce(json({ data: { viewer: { login: "zeikar" } } }));

    const request = githubGraphql("{ viewer { login } }", {});
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchMock).toHaveBeenCalledOnce();
    const { value } = (await settle(request)) as { value: unknown };

    expect(value).toEqual({ viewer: { login: "zeikar" } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("reports the second failure when the retry fails too", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock
      .mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }))
      .mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));

    const { error } = (await settle(
      githubGraphql("{ viewer { login } }", {}),
    )) as { error: Error };

    expect(error.message).toMatch(/503/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403, 429])(
    "does not retry a %i, which would fail again",
    async (status) => {
      fetchMock.mockResolvedValue(new Response("", { status }));

      await expect(githubGraphql("{ viewer { login } }", {})).rejects.toThrow(
        String(status),
      );
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );

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

describe("fetchDiscussionCategory", () => {
  const categories = (nodes: { id: string; name: string; slug: string }[]) =>
    json({
      data: { repository: { id: "R_1", discussionCategories: { nodes } } },
    });

  it("finds the category by its slug", async () => {
    fetchMock.mockResolvedValue(
      categories([
        { id: "DIC_1", name: "General", slug: "general" },
        { id: "DIC_2", name: "Posts", slug: "posts" },
      ]),
    );

    await expect(
      fetchDiscussionCategory("zeikar", "repozine", "posts"),
    ).resolves.toEqual({
      repoId: "R_1",
      category: { id: "DIC_2", name: "Posts", slug: "posts" },
    });
  });

  it("lists the available slugs when the configured one is missing", async () => {
    fetchMock.mockResolvedValue(
      categories([{ id: "DIC_1", name: "General", slug: "general" }]),
    );

    await expect(
      fetchDiscussionCategory("zeikar", "repozine", "Posts"),
    ).rejects.toThrow(/"Posts".*available slugs: general/);
  });

  it("says so when the repository has no categories", async () => {
    fetchMock.mockResolvedValue(categories([]));

    await expect(
      fetchDiscussionCategory("zeikar", "repozine", "posts"),
    ).rejects.toThrow(/available slugs: none/);
  });
});

describe("fetchDiscussions", () => {
  it("lists the category's discussions across pages", async () => {
    fetchMock
      .mockResolvedValueOnce(issuesPage([node(1)], "cursor-1"))
      .mockResolvedValueOnce(issuesPage([node(2)], null));

    const nodes = await fetchDiscussions("zeikar", "repozine", "DIC_2");

    expect(nodes.map(({ number }) => number)).toEqual([1, 2]);
    expect(variablesOf(0)).toMatchObject({ categoryId: "DIC_2", cursor: null });
    expect(variablesOf(1)).toMatchObject({
      categoryId: "DIC_2",
      cursor: "cursor-1",
    });
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

import { beforeEach, describe, expect, it, vi } from "vitest";
import Config from "../config.json";
import Api from "../src/api/request";
import { getAllArticles, getIssue } from "../src/api";
import { generateIssueSearchQuery } from "../src/api/query";

vi.mock("../src/api/request", () => ({
  default: {
    getAllIssues: vi.fn(),
    getIssue: vi.fn(),
    getAllLabels: vi.fn(),
    getGithubProfile: vi.fn(),
  },
}));

const issue = (overrides = {}) => ({
  number: 1,
  title: "title",
  body: "body",
  user: { login: Config.repoOwner },
  repository_url: `https://api.github.com/repos/${Config.repoOwner}/${Config.repoName}`,
  ...overrides,
});
const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { status });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("generateIssueSearchQuery", () => {
  it("only searches issues opened by the repository owner", () => {
    expect(generateIssueSearchQuery([], "")).toContain(
      `author:${Config.repoOwner}`
    );
  });
});

describe("getAllArticles", () => {
  it("drops issues by other authors, from other repos and pull requests, even if the search matched them", async () => {
    // qualifiers typed into the search box, like "author:someone" or "repo:other/repo", are OR'ed with ours
    const own = issue({ number: 1 });
    vi.mocked(Api.getAllIssues).mockResolvedValue({
      data: {
        total_count: 4,
        items: [
          own,
          issue({ number: 2, user: { login: "someone-else" } }),
          issue({ number: 3, pull_request: {} }),
          issue({
            number: 4,
            repository_url: `https://api.github.com/repos/${Config.repoOwner}/other-repo`,
          }),
        ],
      },
    });

    const response = await getAllArticles([], "author:someone-else", 1);

    expect(response.data.items).toEqual([own]);
  });

  it("treats a missing body as empty", async () => {
    vi.mocked(Api.getAllIssues).mockResolvedValue({
      data: { total_count: 1, items: [issue({ body: null })] },
    });

    const response = await getAllArticles([], "", 1);

    expect(response.data.items[0].body).toBe("");
  });

  it("rejects when the request fails", async () => {
    vi.mocked(Api.getAllIssues).mockRejectedValue(httpError(403));

    await expect(getAllArticles([], "", 1)).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe("getIssue", () => {
  it("returns the owner's issue, matching the login case-insensitively", async () => {
    const own = issue({ user: { login: Config.repoOwner.toUpperCase() } });
    vi.mocked(Api.getIssue).mockResolvedValue({ data: own });

    const response = await getIssue(1);

    expect(response.data).toBe(own);
  });

  it.each([
    ["an issue by another author", issue({ user: { login: "someone-else" } })],
    ["a pull request", issue({ pull_request: {} })],
    [
      "an issue that now lives in another repo",
      issue({
        repository_url: `https://api.github.com/repos/${Config.repoOwner}/other-repo`,
      }),
    ],
  ])("resolves to null for %s", async (_, data) => {
    vi.mocked(Api.getIssue).mockResolvedValue({ data });

    expect(await getIssue(1)).toBeNull();
  });

  it("resolves to null when the issue does not exist", async () => {
    vi.mocked(Api.getIssue).mockRejectedValue(httpError(404));

    expect(await getIssue(1)).toBeNull();
  });

  it("rejects on other failures such as rate limiting", async () => {
    vi.mocked(Api.getIssue).mockRejectedValue(httpError(403));

    await expect(getIssue(1)).rejects.toMatchObject({ status: 403 });
  });

  it("treats a missing body as empty", async () => {
    vi.mocked(Api.getIssue).mockResolvedValue({ data: issue({ body: null }) });

    expect((await getIssue(1)).data.body).toBe("");
  });
});

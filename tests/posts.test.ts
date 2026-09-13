import { describe, expect, it } from "vitest";
import type { PostNode } from "../src/lib/github";
import {
  byNewest,
  isTrustedPost,
  toPost,
  type TrustedPostNode,
} from "../src/lib/posts";

const issuesConfig = {
  repoOwner: "zeikar",
  repoName: "issueage",
  source: "issues",
} as const;

const discussionsConfig = {
  repoOwner: "zeikar",
  repoName: "issueage",
  source: "discussions",
  discussionCategory: "general",
} as const;

// the shapes GitHub GraphQL returns for the issue and discussion selections in src/lib/github.ts
const issue = (overrides: Partial<TrustedPostNode> = {}): TrustedPostNode => ({
  __typename: "Issue",
  number: 1,
  title: "title",
  body: "body",
  createdAt: "2021-02-18T14:50:29Z",
  url: "https://github.com/zeikar/issueage/issues/1",
  author: { login: "zeikar" },
  repository: { nameWithOwner: "zeikar/issueage" },
  labels: { nodes: [{ name: "C++", color: "f29513" }] },
  comments: { totalCount: 2 },
  state: "OPEN",
  ...overrides,
});

const discussion = (
  overrides: Partial<TrustedPostNode> = {},
): TrustedPostNode => ({
  __typename: "Discussion",
  number: 27,
  title: "title",
  body: "body",
  createdAt: "2021-02-18T14:50:29Z",
  url: "https://github.com/zeikar/issueage/discussions/27",
  author: { login: "zeikar" },
  repository: { nameWithOwner: "zeikar/issueage" },
  labels: { nodes: [] },
  comments: { totalCount: 0 },
  closed: false,
  category: { slug: "general" },
  ...overrides,
});

describe("isTrustedPost in issues mode", () => {
  it("trusts an open issue by the owner in the repo", () => {
    expect(isTrustedPost(issue(), issuesConfig)).toBe(true);
  });

  it("matches the owner and repository case-insensitively", () => {
    const node = issue({
      author: { login: "ZEIKAR" },
      repository: { nameWithOwner: "Zeikar/IssueAge" },
    });
    expect(isTrustedPost(node, issuesConfig)).toBe(true);
  });

  // anyone can open an issue on a public repo
  it.each<[string, PostNode]>([
    ["another author", issue({ author: { login: "someone-else" } })],
    ["a deleted (ghost) author", { ...issue(), author: null }],
    ["another repo", issue({ repository: { nameWithOwner: "zeikar/other" } })],
    ["a pull request", issue({ __typename: "PullRequest" })],
    ["a closed issue", issue({ state: "CLOSED" })],
    ["a discussion", discussion()],
  ])("drops %s", (_name, node) => {
    expect(isTrustedPost(node, issuesConfig)).toBe(false);
  });
});

describe("isTrustedPost in discussions mode", () => {
  it("trusts an open discussion by the owner in the category", () => {
    expect(isTrustedPost(discussion(), discussionsConfig)).toBe(true);
  });

  it.each<[string, PostNode]>([
    ["a closed discussion", discussion({ closed: true })],
    ["another category", discussion({ category: { slug: "ideas" } })],
    ["a deleted (ghost) author", { ...discussion(), author: null }],
    ["an issue", issue()],
  ])("drops %s", (_name, node) => {
    expect(isTrustedPost(node, discussionsConfig)).toBe(false);
  });
});

describe("toPost", () => {
  it("normalizes an issue and a discussion to the same shape", () => {
    expect(toPost(issue())).toEqual({
      number: 1,
      title: "title",
      body: "body",
      createdAt: "2021-02-18T14:50:29Z",
      url: "https://github.com/zeikar/issueage/issues/1",
      author: "zeikar",
      tags: [{ name: "C++", color: "f29513" }],
      commentCount: 2,
    });
    expect(toPost(discussion())).toEqual({
      number: 27,
      title: "title",
      body: "body",
      createdAt: "2021-02-18T14:50:29Z",
      url: "https://github.com/zeikar/issueage/discussions/27",
      author: "zeikar",
      tags: [],
      commentCount: 0,
    });
  });

  it("turns a null body into an empty string", () => {
    expect(toPost(issue({ body: null })).body).toBe("");
  });
});

describe("byNewest", () => {
  it("sorts the most recently created post first", () => {
    const posts = [
      { createdAt: "2021-02-18T14:50:29Z" },
      { createdAt: "2023-01-01T00:00:00Z" },
      { createdAt: "2022-06-30T12:00:00Z" },
    ];
    expect(posts.sort(byNewest).map((post) => post.createdAt)).toEqual([
      "2023-01-01T00:00:00Z",
      "2022-06-30T12:00:00Z",
      "2021-02-18T14:50:29Z",
    ]);
  });
});

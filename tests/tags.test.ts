import { describe, expect, it } from "vitest";
import { collectTags, tagSlug } from "../src/lib/tags";

describe("tagSlug", () => {
  it.each([
    ["C++", "c++"],
    ["간단하게 알아보는", "간단하게-알아보는"],
    ["area/foo", "area-foo"],
    ["Not Rated", "not-rated"],
    ["a?b#c%d\\e", "a-b-c-d-e"],
    ["R&D", "r&d"],
    [".", "-"],
    ["..", "--"],
    ["...", "..."],
  ])("slugs %s as %s", (name, slug) => {
    expect(tagSlug(name)).toBe(slug);
  });
});

describe("collectTags", () => {
  it("counts each tag across posts, most used first, then by name", () => {
    const cpp = { name: "C++", color: "f29513" };
    const dp = { name: "DP", color: "0e8a16" };
    const graph = { name: "Graph", color: "1d76db" };
    const posts = [{ tags: [graph, cpp] }, { tags: [dp] }, { tags: [cpp] }];

    expect(collectTags(posts)).toEqual([
      { name: "C++", color: "f29513", slug: "c++", count: 2 },
      { name: "DP", color: "0e8a16", slug: "dp", count: 1 },
      { name: "Graph", color: "1d76db", slug: "graph", count: 1 },
    ]);
  });

  it("returns no tags for no posts", () => {
    expect(collectTags([])).toEqual([]);
  });

  it("throws when two different names share a slug", () => {
    const posts = [
      { tags: [{ name: "a/b", color: "ffffff" }] },
      { tags: [{ name: "a b", color: "000000" }] },
    ];
    expect(() => collectTags(posts)).toThrow(/"a\/b".*"a b".*"a-b"/);
  });
});

import { describe, expect, it } from "vitest";
import { collectTags, tagSlug } from "../src/lib/tags";

describe("tagSlug", () => {
  it.each([
    ["medium", "medium"],
    ["C++", "c++"],
    ["리뷰", "리뷰"],
    ["R&D", "r&d"],
  ])("keeps a readable label %s as %s", (name, slug) => {
    expect(tagSlug(name)).toBe(slug);
  });

  it.each([
    ["help wanted", "help-wanted"],
    ["간단하게 알아보는", "간단하게-알아보는"],
  ])(
    "turns the spaces in %s into hyphens, with nothing appended",
    (name, slug) => {
      expect(tagSlug(name)).toBe(slug);
    },
  );

  it("replaces characters that would end or escape a path segment", () => {
    expect(tagSlug("area/foo?a#b%c\\d")).toBe("area-foo-a-b-c-d");
  });

  it.each([
    [".", "-"],
    ["..", "--"],
  ])("turns the dot segment %s into %s, which URLs can reach", (name, slug) => {
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

  it("assigns tagSlug(name) to every tag, whatever other labels are present", () => {
    const tag = { name: "help wanted", color: "008672" };

    const alone = collectTags([{ tags: [tag] }]);
    const withOthers = collectTags([
      { tags: [tag, { name: "medium", color: "000000" }] },
    ]);

    expect(alone[0].slug).toBe("help-wanted");
    expect(withOthers.find((t) => t.name === tag.name)?.slug).toBe(
      "help-wanted",
    );
  });

  // one /tags/<slug>/ page can't belong to two labels, and quietly merging them or suffixing one would change a URL that already exists
  it("fails the build, naming both labels, when they share a slug", () => {
    const posts = [
      { tags: [{ name: "help wanted", color: "008672" }] },
      { tags: [{ name: "help-wanted", color: "008672" }] },
    ];

    expect(() => collectTags(posts)).toThrow(
      /"help wanted" and "help-wanted" share the tag slug "help-wanted"/,
    );
  });
});

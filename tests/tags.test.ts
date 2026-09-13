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

  it("hashes labels whose base slug loses information", () => {
    expect(tagSlug("not rated")).toMatch(/^not-rated-[0-9a-f]{8}$/);
    expect(tagSlug("간단하게 알아보는")).toMatch(
      /^간단하게-알아보는-[0-9a-f]{8}$/,
    );
  });

  it.each([".", ".."])(
    "hashes the dot segment %s instead of leaving a navigable slug",
    (name) => {
      const slug = tagSlug(name);
      expect(slug).not.toBe(".");
      expect(slug).not.toBe("..");
      expect(slug).toMatch(/-[0-9a-f]{8}$/);
    },
  );

  it("hashes a name that already looks like a hashed slug", () => {
    expect(tagSlug("foo-deadbeef")).toMatch(/^foo-deadbeef-[0-9a-f]{8}$/);
  });

  it("gives area/foo, area-foo, and a literal that looks like area/foo's hashed slug three distinct slugs", () => {
    const areaSlashFoo = tagSlug("area/foo");
    const areaDashFoo = tagSlug("area-foo");
    // this literal is exactly what area/foo hashes to, so it already looks like a hashed slug
    const lookalikeLiteral = tagSlug(areaSlashFoo);

    expect(areaSlashFoo).toMatch(/^area-foo-[0-9a-f]{8}$/);
    expect(new Set([areaSlashFoo, areaDashFoo, lookalikeLiteral]).size).toBe(3);
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

  it("assigns tagSlug(name) to every tag, with or without other colliding labels present", () => {
    const name = "not rated";
    const tag = { name, color: "ffffff" };

    const alone = collectTags([{ tags: [tag] }]);
    const withOthers = collectTags([
      { tags: [tag, { name: "medium", color: "000000" }] },
    ]);

    expect(alone[0].slug).toBe(tagSlug(name));
    expect(withOthers.find((t) => t.name === name)?.slug).toBe(tagSlug(name));
  });
});

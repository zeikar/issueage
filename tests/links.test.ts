import { describe, expect, it } from "vitest";
import { pagePath, postPath, tagPath, withBase } from "../src/lib/links";

describe("withBase", () => {
  it.each([
    ["/issueage", "/posts/20/", "/issueage/posts/20/"],
    ["/issueage/", "/posts/20/", "/issueage/posts/20/"],
    ["/", "/posts/20/", "/posts/20/"],
    ["/issueage", "/", "/issueage/"],
    ["/issueage", "posts/20/", "/issueage/posts/20/"],
  ])("joins %j and %j into %j", (base, path, expected) => {
    expect(withBase(base, path)).toBe(expected);
  });
});

describe("postPath", () => {
  it("links a post by its number", () => {
    expect(postPath(20)).toBe("/posts/20/");
  });
});

describe("tagPath", () => {
  it("links a tag by its slug", () => {
    expect(tagPath("간단하게-알아보는")).toBe("/tags/간단하게-알아보는/");
  });
});

describe("pagePath", () => {
  it.each([
    ["", 1, "/"],
    ["", 2, "/2/"],
    ["/tags/c++", 1, "/tags/c++/"],
    ["/tags/c++", 3, "/tags/c++/3/"],
  ])("links %j page %d as %j", (prefix, page, expected) => {
    expect(pagePath(prefix, page)).toBe(expected);
  });
});

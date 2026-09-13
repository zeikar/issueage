import { describe, expect, it } from "vitest";
import { withBase } from "../src/lib/links";

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

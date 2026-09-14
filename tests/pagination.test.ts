import { describe, expect, it } from "vitest";
import { getPaginationPages } from "../src/lib/pagination";

describe("getPaginationPages", () => {
  it.each([
    [1, 1, [1]],
    [1, 2, [1, 2]],
    [1, 3, [1, 2, 3]],
    // every hidden stretch is one page, so all pages show instead of "…"
    [5, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [1, 7, [1, 2, 3, 4, "…", 7]],
    // a long stretch gets its middle page
    [1, 16, [1, 2, "…", 9, "…", 16]],
    [4, 16, [1, 2, 3, 4, 5, "…", 10, "…", 16]],
    [8, 16, [1, "…", 4, "…", 7, 8, 9, "…", 12, "…", 16]],
    [16, 16, [1, "…", 8, "…", 15, 16]],
    [50, 100, [1, "…", 25, "…", 49, 50, 51, "…", 75, "…", 100]],
  ])("pages around %d of %d are %j", (current, last, expected) => {
    expect(getPaginationPages(current, last)).toEqual(expected);
  });
});

import { describe, expect, it } from "vitest";
import { getPaginationPages } from "../src/lib/pagination";

describe("getPaginationPages", () => {
  it.each([
    [1, 1, [1]],
    [5, 10, [1, "…", 3, 4, 5, 6, 7, "…", 10]],
    [1, 3, [1, 2, 3]],
    [10, 10, [1, "…", 8, 9, 10]],
  ])("pages around %d of %d are %j", (current, last, expected) => {
    expect(getPaginationPages(current, last)).toEqual(expected);
  });
});

import { describe, expect, it } from "vitest";
import { tagTextClass } from "../src/lib/color";

describe("tagTextClass", () => {
  it.each([
    ["ffffff", "text-black"],
    ["000000", "text-white"],
    // luminance 0.2126 and 0.4614: bright by luminance, dark by the old brightness formula
    ["ff0000", "text-black"],
    ["05d205", "text-black"],
    // real labels, luminance 0.6276 and 0.1706
    ["FBCA04", "text-black"],
    ["326CE5", "text-white"],
  ])("gives background %s the class %s", (hex, expected) => {
    expect(tagTextClass(hex)).toBe(expected);
  });
});

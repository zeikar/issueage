import { describe, expect, it } from "vitest";
import { formatDate } from "../src/lib/datetime";

describe("formatDate", () => {
  // both ends of the UTC day, so a build machine on either side of UTC would shift one of them
  it.each(["2021-02-18T00:00:00Z", "2021-02-18T23:59:59Z"])(
    "formats %s as its UTC date",
    (dateString) => {
      expect(formatDate(dateString, "long")).toBe("February 18, 2021");
      expect(formatDate(dateString, "short")).toBe("Feb 18, 2021");
    },
  );
});

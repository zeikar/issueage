import { describe, expect, it } from "vitest";
import { excerptParts } from "../src/lib/search";

describe("excerptParts", () => {
  it("splits marks and unescapes only what Pagefind escapes", () => {
    expect(excerptParts("a <mark>b</mark> &lt;c&gt; &amp; d")).toEqual([
      { text: "a ", marked: false },
      { text: "b", marked: true },
      { text: " <c> &amp; d", marked: false },
    ]);
  });

  it("keeps an excerpt without marks as one plain part", () => {
    expect(excerptParts("no matches here")).toEqual([
      { text: "no matches here", marked: false },
    ]);
  });

  it("handles marks at the start and at the end", () => {
    expect(excerptParts("<mark>jump</mark> game <mark>III</mark>")).toEqual([
      { text: "jump", marked: true },
      { text: " game ", marked: false },
      { text: "III", marked: true },
    ]);
  });
});

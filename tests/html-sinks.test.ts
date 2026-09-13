import { describe, expect, it } from "vitest";

// post HTML is sanitized once at build time, so any raw HTML sink in the source would bypass that;
// the glob is resolved when the test runs, so files added under src/ are checked without a list to maintain,
// and it is exhaustive because Vite otherwise skips dotfiles and dot-directories
const sources = import.meta.glob<string>("../src/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
  exhaustive: true,
});

const SINKS = [
  "set:html",
  "dangerouslySetInnerHTML",
  "innerHTML",
  "outerHTML",
  "insertAdjacentHTML",
];

describe("raw HTML sinks", () => {
  it("reads the source tree", () => {
    expect(Object.keys(sources)).toEqual(
      expect.arrayContaining([
        "../src/components/Search.tsx",
        "../src/lib/markdown.ts",
      ]),
    );
  });

  it.each(SINKS)("no source file uses %s", (sink) => {
    expect(
      Object.entries(sources)
        .filter(([, source]) => source.includes(sink))
        .map(([path]) => path),
    ).toEqual([]);
  });
});

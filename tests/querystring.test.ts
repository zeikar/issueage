import { describe, expect, it } from "vitest";
import { parseQueryString } from "../src/lib/querystring";
import { getSearchLink, getTagLink } from "../src/lib/links";

// links look like "/?a=b"; svelte-spa-router hands the part after "?" back to parseQueryString
const parseLink = (link: string) =>
  parseQueryString(link.slice(link.indexOf("?") + 1));

describe("query string links", () => {
  it.each(["100%", "a&b=c", "C++", "한글 검색", "#hash"])(
    "round-trips the search %j",
    (search) => {
      expect(parseLink(getSearchLink("", search))).toEqual({
        search,
        page: "1",
      });
    }
  );

  it("round-trips tag names while keeping other parameters", () => {
    expect(parseLink(getTagLink("search=100%25", "C++ & Go"))).toEqual({
      search: "100%",
      tag: "C++ & Go",
      page: "1",
    });
  });

  it("still reads links created before values were encoded", () => {
    expect(parseQueryString("tag=C++&search=100%")).toEqual({
      tag: "C++",
      search: "100%",
    });
  });
});

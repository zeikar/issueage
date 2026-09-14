// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  blogPostingJsonLd,
  shareableImage,
  siteDescription,
  siteUrl,
  xmlSafe,
  ogImageFor,
  ogLocaleFor,
  robotsTxt,
  serializeJsonLd,
  sitemapXml,
} from "../src/lib/seo";

describe("absoluteUrl", () => {
  it("resolves a path under the base against the site origin", () => {
    expect(
      absoluteUrl("/repozine/posts/1/", new URL("https://zeikar.dev")),
    ).toBe("https://zeikar.dev/repozine/posts/1/");
  });

  it("names the missing setting when the site is not configured", () => {
    expect(() => absoluteUrl("/", undefined)).toThrow(/site/);
  });
});

describe("siteUrl", () => {
  it.each([
    ["/repozine", "/sitemap.xml", "https://zeikar.dev/repozine/sitemap.xml"],
    ["/", "/sitemap.xml", "https://zeikar.github.io/sitemap.xml"],
  ])("resolves a path under the base %s", (base, path, expected) => {
    const site = new URL(new URL(expected).origin);
    expect(siteUrl(base, path, site)).toBe(expected);
  });
});

describe("siteDescription", () => {
  const profile = { bio: "Always shipping" };

  it("prefers the repository's About text", () => {
    expect(siteDescription({ description: "A study log", profile })).toBe(
      "A study log",
    );
  });

  it.each([
    ["the bio when the repository has none", profile, "Always shipping"],
    ["nothing for a blank bio", { bio: "  " }, null],
    ["nothing without a bio", { bio: null }, null],
  ])("falls back to %s", (_, profile, expected) => {
    expect(siteDescription({ description: null, profile })).toBe(expected);
  });
});

describe("xmlSafe", () => {
  // GitHub keeps control characters such as the ESC of pasted terminal colors, and one in a feed makes the whole XML invalid
  it("drops characters XML 1.0 cannot contain and keeps the rest", () => {
    expect(xmlSafe("a\u001b[31mred\u0000\ufffe 탭\t줄\n끝\r")).toBe(
      "a[31mred 탭\t줄\n끝\r",
    );
  });
});

describe("ogImageFor", () => {
  it("asks dogimg to render a card for the encoded page URL", () => {
    expect(ogImageFor("https://zeikar.dev/repozine/posts/1/?a=1&b=2")).toBe(
      "https://dogimg.vercel.app/api/og?url=https%3A%2F%2Fzeikar.dev%2Frepozine%2Fposts%2F1%2F%3Fa%3D1%26b%3D2",
    );
  });
});

describe("shareableImage", () => {
  it("keeps an absolute http(s) image address", () => {
    expect(shareableImage("https://github.com/user-attachments/assets/a")).toBe(
      "https://github.com/user-attachments/assets/a",
    );
  });

  // link previews fetch the image on their own, so a relative path or a data URL is of no use to them
  it.each([null, "images/a.png", "/a.png", "data:image/png;base64,AAAA"])(
    "drops %j",
    (src) => {
      expect(shareableImage(src)).toBeUndefined();
    },
  );
});

describe("ogLocaleFor", () => {
  it.each([
    ["ko-KR", "ko_KR"],
    ["en-us", "en_US"],
    ["zh-Hant-TW", "zh_TW"],
  ])("turns %s into the Open Graph form %s", (language, locale) => {
    expect(ogLocaleFor(language)).toBe(locale);
  });

  it("has no Open Graph locale for a language without a region", () => {
    expect(ogLocaleFor("ko")).toBeUndefined();
  });
});

describe("serializeJsonLd", () => {
  // post titles and excerpts are authored in issues, and this JSON lands inside a script element
  it("cannot close the script element or open markup, and still parses to the same data", () => {
    const data = {
      headline: "</script><script>alert(1)</script> & <!-- \u2028",
    };
    const json = serializeJsonLd(data);

    expect(json).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(json)).toEqual(data);
  });
});

describe("blogPostingJsonLd", () => {
  const post = {
    title: "416. Partition Equal Subset Sum",
    url: "https://zeikar.dev/leetcode/posts/23/",
    description: "합이 같아지게 배열을 둘로 나눌 수 있는지 판단하는 문제.",
    image: "https://github.com/user-attachments/assets/a.png",
    publishedAt: "2021-12-12T00:00:00Z",
    modifiedAt: "2026-09-13T00:00:00Z",
    tags: ["medium", "dp"],
    author: { name: "zeikar", url: "https://github.com/zeikar" },
  };

  it("describes the post as a schema.org BlogPosting", () => {
    expect(blogPostingJsonLd(post)).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "416. Partition Equal Subset Sum",
      url: "https://zeikar.dev/leetcode/posts/23/",
      mainEntityOfPage: "https://zeikar.dev/leetcode/posts/23/",
      description: "합이 같아지게 배열을 둘로 나눌 수 있는지 판단하는 문제.",
      image: "https://github.com/user-attachments/assets/a.png",
      datePublished: "2021-12-12T00:00:00Z",
      dateModified: "2026-09-13T00:00:00Z",
      keywords: "medium, dp",
      author: {
        "@type": "Person",
        name: "zeikar",
        url: "https://github.com/zeikar",
      },
    });
  });

  it("leaves out fields a post doesn't have", () => {
    const data = blogPostingJsonLd({
      ...post,
      description: "",
      image: undefined,
      tags: [],
    });

    expect(data).not.toHaveProperty("description");
    expect(data).not.toHaveProperty("image");
    expect(data).not.toHaveProperty("keywords");
  });
});

describe("sitemapXml", () => {
  it("lists each URL, with a last modified date where one is known", () => {
    const xml = sitemapXml([
      { loc: "https://zeikar.dev/repozine/" },
      {
        loc: "https://zeikar.dev/repozine/posts/1/",
        lastmod: "2024-05-01T09:00:00Z",
      },
    ]);
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    expect(doc.querySelector("parsererror")).toBeNull();
    expect(
      Array.from(doc.querySelectorAll("url"), (url) => [
        url.querySelector("loc")?.textContent,
        url.querySelector("lastmod")?.textContent ?? null,
      ]),
    ).toEqual([
      ["https://zeikar.dev/repozine/", null],
      ["https://zeikar.dev/repozine/posts/1/", "2024-05-01T09:00:00Z"],
    ]);
  });

  it("escapes characters XML reserves", () => {
    const xml = sitemapXml([{ loc: "https://e.com/?a=1&b=<2>" }]);
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.querySelector("loc")?.textContent).toBe(
      "https://e.com/?a=1&b=<2>",
    );
  });
});

describe("robotsTxt", () => {
  it("allows everything and points crawlers at the sitemap", () => {
    expect(robotsTxt("https://zeikar.github.io/sitemap.xml")).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://zeikar.github.io/sitemap.xml\n",
    );
  });
});

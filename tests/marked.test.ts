// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getHTML, getPlainText, getTableOfContents } from "../src/lib/marked";

// ArticleDetails builds the table of contents first, which installs the heading renderer used by getHTML
const render = (markdown: string): Document => {
  getTableOfContents(markdown);
  return new DOMParser().parseFromString(getHTML(markdown), "text/html");
};

const YOUTUBE_EMBED = /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//;

const collectAnchors = (items: any[]): string[] =>
  (items ?? []).flatMap((item) => [
    ...(item.anchor ? [item.anchor] : []),
    ...collectAnchors(item.children),
  ]);

describe("getHTML", () => {
  // anyone who can get markdown into an article must not be able to run script on the site
  it.each([
    ["an inline event handler", '<img src="x" onerror="alert(1)">'],
    ["a script tag", "<script>alert(1)</script>"],
    ["an svg onload", "<svg onload=alert(1)>"],
    ["an iframe", '<iframe src="https://evil.example"></iframe>'],
    [
      "an iframe on a YouTube lookalike host",
      '<iframe src="https://www.youtube.com.evil.example/embed/x"></iframe>',
    ],
    [
      "a frame name that links could use to navigate an embed elsewhere",
      '<iframe name="yt" src="https://www.youtube.com/embed/x"></iframe><a href="https://evil.example" target="yt">x</a>',
    ],
    [
      "srcdoc on an allowed embed",
      '<iframe src="https://www.youtube.com/embed/x" srcdoc="<script>alert(1)</script>"></iframe>',
    ],
    ["a javascript: markdown link", "[click](javascript:alert(1))"],
    ["a javascript: html link", '<a href="javascript:alert(1)">click</a>'],
    [
      "a quote breaking out of the link renderer",
      '[x](https://a.example/"onmouseover="alert(1))',
    ],
  ])("removes %s", (_, markdown) => {
    const doc = render(markdown);

    expect(doc.querySelector("script")).toBeNull();
    for (const frame of Array.from(doc.querySelectorAll("iframe"))) {
      expect(frame.getAttribute("src")).toMatch(YOUTUBE_EMBED);
      expect(frame.hasAttribute("srcdoc")).toBe(false);
      expect(frame.hasAttribute("name")).toBe(false);
    }
    for (const element of Array.from(doc.querySelectorAll("*"))) {
      for (const { name, value } of Array.from(element.attributes)) {
        expect(name).not.toMatch(/^on/i);
        expect(value).not.toMatch(/^\s*javascript:/i);
      }
    }
  });

  it("keeps external links opening in a new tab", () => {
    const link = render("[site](https://example.com)").querySelector("a");

    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("keeps YouTube embeds, which existing articles use", () => {
    const frame = render(
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/GTJr8OvyEVQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media" allowfullscreen></iframe>'
    ).querySelector("iframe");

    expect(frame.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/GTJr8OvyEVQ"
    );
    expect(frame.hasAttribute("allowfullscreen")).toBe(true);
  });

  it("keeps images and highlighted code", () => {
    const doc = render(
      "![alt](https://example.com/a.png)\n\n```js\nconst a = 1;\n```"
    );

    expect(doc.querySelector("img").getAttribute("src")).toBe(
      "https://example.com/a.png"
    );
    expect(doc.querySelector("code .hljs-keyword")).not.toBeNull();
  });

  it("keeps every heading id the table of contents links to", () => {
    // "title", "body" and "links" are document properties, which DOMPurify refuses as bare ids
    const markdown = "# Title\n\n## Body\n\n## Links\n\n### 소개";
    const anchors = collectAnchors(getTableOfContents(markdown));
    const doc = new DOMParser().parseFromString(getHTML(markdown), "text/html");

    expect(anchors).toHaveLength(4);
    for (const anchor of anchors) {
      expect(doc.getElementById(anchor)).not.toBeNull();
    }
  });
});

describe("getPlainText", () => {
  it("returns decoded text without markup, so it must never be rendered as HTML", () => {
    const text = getPlainText(
      '**bold** <img src="x" onerror="alert(1)"> 1 &lt; 2'
    );

    expect(text).toContain("bold");
    expect(text).toContain("1 < 2");
    expect(text).not.toContain("<img");
  });

  it("truncates long text with an ellipsis", () => {
    expect(getPlainText("a".repeat(300), 200)).toBe("a".repeat(200) + "…");
    expect(getPlainText("short", 200).trim()).toBe("short");
  });

  it("handles an empty body", () => {
    expect(getPlainText("", 200)).toBe("");
  });
});

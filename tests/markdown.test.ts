// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/lib/markdown";
import { nestHeadings, type TocItem } from "../src/lib/toc";

// the first render loads every Shiki grammar (seconds on a busy CI runner); pay that once here,
// with a generous timeout, instead of inside whichever test happens to run first
beforeAll(async () => {
  await renderMarkdown("```js\nx\n```");
}, 60_000);

const render = async (markdown: string): Promise<Document> => {
  const { html } = await renderMarkdown(markdown);
  return new DOMParser().parseFromString(html, "text/html");
};

const YOUTUBE_EMBED =
  /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]+(?:[?#]|$)/;

// the "text" fallback paints a line in one color, so real highlighting shows up as several
const tokenStyles = (doc: Document): Set<string | null> =>
  new Set(
    Array.from(doc.querySelectorAll("pre.shiki span[style]"), (span) =>
      span.getAttribute("style"),
    ),
  );

const flattenToc = (items: TocItem[]): TocItem[] =>
  items.flatMap((item) => [item, ...flattenToc(item.children)]);

describe("renderMarkdown html", () => {
  // anyone who can get markdown into a post must not be able to run script on the site
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
      "an iframe whose path climbs out of /embed/",
      '<iframe src="https://www.youtube.com/embed/../redirect?q=https://evil.example"></iframe>',
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
    ["a code fence meta string", "```js onclick=alert(1)\nx\n```"],
  ])("removes %s", async (_, markdown) => {
    const doc = await render(markdown);

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

  it("keeps YouTube embeds, which existing posts use", async () => {
    const doc = await render(
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/GTJr8OvyEVQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media" allowfullscreen></iframe>',
    );
    const frame = doc.querySelector("iframe");

    expect(frame?.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/GTJr8OvyEVQ",
    );
    expect(frame?.hasAttribute("allowfullscreen")).toBe(true);
  });

  it("opens external links in a new tab", async () => {
    const link = (await render("[site](https://example.com)")).querySelector(
      "a",
    );

    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.getAttribute("target")).toBe("_blank");
  });

  it("keeps images and highlights code", async () => {
    const doc = await render(
      "![alt](https://example.com/a.png)\n\n```js\nconst a = 1;\n```",
    );

    expect(doc.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/a.png",
    );
    expect(doc.querySelector("pre.shiki")).not.toBeNull();
    expect(tokenStyles(doc).size).toBeGreaterThan(1);
  });

  it("highlights a capitalized language name", async () => {
    const doc = await render("```Python\ndef f():\n    return 1\n```");

    expect(tokenStyles(doc).size).toBeGreaterThan(1);
  });

  it("renders a fence whose info string is not a language", async () => {
    const doc = await render("```DP\ndp[i] = dp[i - 1] + 1\n```");

    expect(doc.querySelector("pre code")?.textContent).toContain(
      "dp[i] = dp[i - 1] + 1",
    );
  });
});

describe("renderMarkdown links and ids", () => {
  it("builds a nested table of contents whose ids exist in the html", async () => {
    // "title", "body" and "links" are document properties, so bare ids would clobber them
    const { html, toc } = await renderMarkdown(
      "# Title\n\n## Body\n\n## Links\n\n### 소개",
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const items = flattenToc(toc);

    expect(items).toHaveLength(4);
    for (const { id } of items) {
      expect(id).toMatch(/^user-content-/);
      expect(doc.getElementById(id)).not.toBeNull();
    }
    const shape = (items: TocItem[]): unknown[] =>
      items.map(({ text, depth, children }) => [text, depth, shape(children)]);
    expect(shape(toc)).toEqual([
      [
        "Title",
        1,
        [
          ["Body", 2, []],
          ["Links", 2, [["소개", 3, []]]],
        ],
      ],
    ]);
  });

  it("leaves empty headings out of the table of contents", async () => {
    const { toc } = await renderMarkdown("##\n\n# Real");

    expect(flattenToc(toc).map(({ text }) => text)).toEqual(["Real"]);
  });

  it("points in-page links at the prefixed ids", async () => {
    const doc = await render(
      "[jump](#body)\n\n[x](https://a.example/#body)\n\n## Body",
    );
    const [jump, external] = Array.from(doc.querySelectorAll("a"));

    expect(jump.getAttribute("href")).toBe("#user-content-body");
    expect(doc.getElementById("user-content-body")).not.toBeNull();
    expect(external.getAttribute("href")).toBe("https://a.example/#body");
  });

  it("keeps in-page links already written with the prefix, as GitHub resolves them", async () => {
    const doc = await render("[jump](#user-content-body)\n\n## Body");

    expect(doc.querySelector("a")!.getAttribute("href")).toBe(
      "#user-content-body",
    );
  });

  it("links footnote references and back-references to existing ids", async () => {
    const { html, toc, excerpt } = await renderMarkdown(
      "Text[^1]\n\n[^1]: Note",
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll('a[href^="#"]'));

    // the footnotes section's heading is visually hidden, so it is not part of the post's outline or summary
    expect(toc).toEqual([]);
    expect(excerpt).not.toContain("Footnotes");
    expect(excerpt).not.toContain("Note");
    expect(excerpt).not.toContain("↩");

    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1);
      expect(doc.getElementById(id)).not.toBeNull();
    }
    for (const element of Array.from(doc.querySelectorAll("[id]"))) {
      expect(element.id).not.toContain("user-content-user-content-");
    }
  });
});

describe("renderMarkdown excerpt and thumbnail", () => {
  it("returns decoded text without markup, so it must never be rendered as HTML", async () => {
    const { excerpt } = await renderMarkdown(
      "**bold** <img src=x onerror=alert(1)> 1 &lt; 2",
    );

    expect(excerpt).toContain("bold");
    expect(excerpt).toContain("1 < 2");
    expect(excerpt).not.toContain("<img");
  });

  it("truncates long text with an ellipsis", async () => {
    expect((await renderMarkdown("a".repeat(300))).excerpt).toBe(
      "a".repeat(200) + "…",
    );
    expect((await renderMarkdown("short")).excerpt).toBe("short");
  });

  it("does not split an emoji at the cut", async () => {
    const { excerpt } = await renderMarkdown("a".repeat(199) + "😀 more text");

    expect(excerpt).toMatch(/^a{199}😀…$/u);
  });

  it("starts at the prose of a post laid out as headings and a link", async () => {
    const { excerpt, toc } = await renderMarkdown(
      "# Problem link\nhttps://leetcode.com/problems/two-sum/\n\n# Problem Summary\n배열에서 두 수의 합이 target이 되는 문제.\n\n## Solution\n해시맵을 쓴다.",
    );

    expect(excerpt).toBe(
      "배열에서 두 수의 합이 target이 되는 문제. 해시맵을 쓴다.",
    );
    // headings are dropped from the excerpt only; the toc keeps them
    expect(flattenToc(toc).map(({ text }) => text)).toEqual([
      "Problem link",
      "Problem Summary",
      "Solution",
    ]);
  });

  it.each([
    ["an angle-bracket autolink", "see <https://e.com/a> here"],
    ["a www literal", "see www.e.com here"],
    [
      "a link written with its own address",
      "see [https://e.com/a](https://e.com/a) here",
    ],
    [
      "an address the href percent-encodes",
      "see https://ko.wikipedia.org/wiki/동적_계획법 here",
    ],
    [
      "a raw html link whose address sits on its own line",
      'see\n\n<a href="https://e.com/a">\nhttps://e.com/a\n</a>\n\nhere',
    ],
    ["a heading nested in a blockquote", "> # Title\n\nsee here"],
    ["a code block", "see\n\n```python\nclass Solution: pass\n```\n\nhere"],
  ])("leaves out %s", async (_, markdown) => {
    expect((await renderMarkdown(markdown)).excerpt).toBe("see here");
  });

  it("keeps an address written as inline code, which is not a link", async () => {
    expect((await renderMarkdown("see `https://e.com/a` here")).excerpt).toBe(
      "see https://e.com/a here",
    );
  });

  it("keeps the words of a link that names its target, so the sentence still reads", async () => {
    const { excerpt } = await renderMarkdown(
      "[공식 문서](https://docs.python.org/3/)를 참고했다.",
    );

    expect(excerpt).toBe("공식 문서를 참고했다.");
  });

  it("handles an empty body", async () => {
    const { excerpt, thumbnail, toc } = await renderMarkdown("");

    expect(excerpt).toBe("");
    expect(thumbnail).toBeNull();
    expect(toc).toEqual([]);
  });

  it.each([
    ["a markdown image", "![](https://e.com/a.png)", "https://e.com/a.png"],
    ["an html image", '<img src="https://e.com/b.png">', "https://e.com/b.png"],
  ])("uses %s as the thumbnail", async (_, markdown, expected) => {
    expect((await renderMarkdown(markdown)).thumbnail).toBe(expected);
  });
});

describe("nestHeadings", () => {
  it("nests a heading under the closest earlier heading of smaller depth", () => {
    const toc = nestHeadings([
      { id: "a", text: "A", depth: 3 },
      { id: "b", text: "B", depth: 1 },
      { id: "c", text: "C", depth: 3 },
      { id: "d", text: "D", depth: 2 },
    ]);

    expect(toc).toEqual([
      { id: "a", text: "A", depth: 3, children: [] },
      {
        id: "b",
        text: "B",
        depth: 1,
        children: [
          { id: "c", text: "C", depth: 3, children: [] },
          { id: "d", text: "D", depth: 2, children: [] },
        ],
      },
    ]);
  });
});

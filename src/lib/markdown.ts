import rehypeShiki from "@shikijs/rehype";
import type { Nodes, Root } from "hast";
import { toString } from "hast-util-to-string";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeSchema,
} from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, type Plugin } from "unified";
import { visit } from "unist-util-visit";
import { nestHeadings, type Heading, type TocItem } from "./toc";

type PostMeta = {
  headings: Heading[];
  thumbnail: string | null;
  text: string;
};

declare module "vfile" {
  interface DataMap {
    postMeta: PostMeta;
  }
}

export type RenderedMarkdown = {
  html: string;
  toc: TocItem[];
  excerpt: string;
  thumbnail: string | null;
};

const EXCERPT_LENGTH = 200;

// posts embed YouTube videos, but an iframe from any other origin is not trusted
// the id segment must end the path, or "/embed/../" would reach any other youtube.com page
const YOUTUBE_EMBED =
  /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\/[\w-]+(?:[?#]|$)/;

const schema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      "src",
      "width",
      "height",
      "title",
      "allow",
      "allowFullScreen",
      "frameBorder",
    ],
  },
};

const rehypeYoutubeOnly: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "iframe" || !parent || index === undefined) {
      return;
    }
    const { src } = node.properties;
    if (typeof src !== "string" || !YOUTUBE_EMBED.test(src)) {
      parent.children.splice(index, 1);
      return index;
    }
    // a named frame could be navigated to another origin by a link or form with target="<name>"
    delete node.properties.name;
  });
};

// sanitize prefixes every id with its default clobberPrefix but leaves hrefs alone, so in-page links need the same prefix to resolve
const rehypePrefixFragmentLinks: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    const { href } = node.properties;
    if (
      node.tagName === "a" &&
      typeof href === "string" &&
      href.startsWith("#") &&
      href.length > 1
    ) {
      node.properties.href = "#user-content-" + href.slice(1);
    }
  });
};

const HEADING_TAG = /^h[1-6]$/;
// autolinks and links written as their own address show the URL itself as their text
const ADDRESS_TEXT = /^(?:[a-z][a-z\d+.-]*:\/\/|www\.)\S+$/i;

// the text of a node, like hast-util-to-string, minus what doesn't read as prose in a one-line preview:
// headings are the post's outline (the toc already shows them), and a bare address is noise
const excerptText = (node: Nodes): string => {
  if (
    node.type === "element" &&
    (HEADING_TAG.test(node.tagName) ||
      (node.tagName === "a" && ADDRESS_TEXT.test(toString(node).trim())))
  ) {
    return "";
  }
  if ("children" in node) {
    return node.children.map(excerptText).join("");
  }
  return node.type === "text" ? node.value : "";
};

const rehypeCollectPostMeta: Plugin<[], Root> = () => (tree, file) => {
  // GFM appends the footnotes section to the root, and its visually hidden "Footnotes" heading belongs in neither the toc nor the excerpt;
  // rehype-raw turns the marker into an empty string, so test for presence
  const body: Root = {
    type: "root",
    children: tree.children.filter(
      (node) =>
        node.type !== "element" || node.properties.dataFootnotes === undefined,
    ),
  };
  const headings: Heading[] = [];
  let thumbnail: string | null = null;

  visit(body, "element", (node) => {
    const { id } = node.properties;
    const text = toString(node);
    // an empty heading such as a bare "##" line has nothing to show in the toc
    if (
      HEADING_TAG.test(node.tagName) &&
      typeof id === "string" &&
      text.trim() !== ""
    ) {
      headings.push({ id, depth: Number(node.tagName[1]), text });
    }
  });
  visit(tree, "element", (node) => {
    const { src } = node.properties;
    if (
      node.tagName === "img" &&
      thumbnail === null &&
      typeof src === "string"
    ) {
      thumbnail = src;
    }
  });

  file.data.postMeta = {
    headings,
    thumbnail,
    text: excerptText(body).replace(/\s+/g, " ").trim(),
  };
};

// shiki language ids are lowercase, but posts use fences like ```Python
const rehypeLowercaseLanguage: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    const { className } = node.properties;
    if (node.tagName === "code" && Array.isArray(className)) {
      node.properties.className = className.map((name) =>
        typeof name === "string" && name.startsWith("language-")
          ? name.toLowerCase()
          : name,
      );
    }
  });
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  // sanitize adds the clobber prefix to every id, so footnote ids must start bare or they get it twice
  .use(remarkRehype, { allowDangerousHtml: true, clobberPrefix: "" })
  .use(rehypeRaw)
  .use(rehypeSlug)
  // issue bodies are untrusted and this is their only sanitizer: plugins after it must add only markup they generate
  .use(rehypeSanitize, schema)
  .use(rehypeYoutubeOnly)
  .use(rehypePrefixFragmentLinks)
  .use(rehypeCollectPostMeta)
  .use(rehypeExternalLinks, {
    target: "_blank",
    rel: ["noopener", "noreferrer"],
  })
  .use(rehypeLowercaseLanguage)
  .use(rehypeShiki, {
    themes: { light: "github-light", dark: "github-dark" },
    fallbackLanguage: "text",
  })
  .use(rehypeStringify);

export const renderMarkdown = async (
  markdown: string,
): Promise<RenderedMarkdown> => {
  const file = await processor.process(markdown);
  // rehypeCollectPostMeta runs on every file
  const { headings, thumbnail, text } = file.data.postMeta!;
  // cut by code point so an emoji at the boundary is not left as a lone surrogate
  const characters = Array.from(text);

  return {
    html: String(file),
    toc: nestHeadings(headings),
    excerpt:
      characters.length > EXCERPT_LENGTH
        ? characters.slice(0, EXCERPT_LENGTH).join("") + "…"
        : text,
    thumbnail,
  };
};

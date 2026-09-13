import marked from "marked";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

// articles embed YouTube videos, but an iframe from any other origin is not trusted
const YOUTUBE_EMBED = /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//;
DOMPurify.addHook("uponSanitizeElement", (node: Element, data) => {
  if (data.tagName !== "iframe") {
    return;
  }
  if (!YOUTUBE_EMBED.test(node.getAttribute("src") || "")) {
    node.parentNode?.removeChild(node);
    return;
  }
  // a named frame could be navigated to another origin by a link or form with target="<name>"
  node.removeAttribute("name");
});

export const getHTML = (markdown: string): string => {
  // issue bodies are raw markdown that may contain HTML; target is dropped by default, but links rely on it
  return DOMPurify.sanitize(marked(markdown), {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder"],
  });
};

export const getTableOfContents = (markdown: string): any[] => {
  const toc = [];

  // Override function
  const renderer = {
    heading(text, level, _, slugger) {
      // prefixed like GitHub does: DOMPurify drops ids that shadow document properties (e.g. "title")
      const escapedText =
        "user-content-" +
        slugger.slug(text.toLowerCase().replace(/[^\w\u1100-\udfff]+/g, "-"));
      toc.push({
        anchor: escapedText,
        level: level,
        text: escapeHtml(text),
      });
      return `<h${level} id="${escapedText}" class="heading">
                ${text}
              </h${level}>`;
    },
    image(href, _, text) {
      return `<figure class="image">
                <img src="${href}" title="${text}" alt="${text}"/>
              </figure>`;
    },
    link(href, _, text) {
      return `<a href="${href}" target="_blank" class="is-underlined"> 
                ${text}
              </a>`;
    },
  };

  marked.use({ renderer });
  marked.setOptions({
    highlight: function (code, lang, _) {
      if (hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    },
    breaks: true,
  });

  marked(markdown);

  return preprocressToc(toc);
};

// returns plain text: render it with {text}, never {@html}, since entities like &lt; are decoded
export const getPlainText = (markdown: string, limit?: number): string => {
  // DOMParser documents are inert: scripts don't run and images don't load
  const text = new DOMParser().parseFromString(marked(markdown), "text/html")
    .body.textContent;
  if (!limit || text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + "\u2026";
};

export const getFirstImageUrl = (markdown: string): string => {
  // get first group
  const match = /!\[[^\]]*\]\((?<imageUrl>.*?)(?="|\))(".*")?\)/g.exec(
    markdown
  );
  if (!match) {
    return "";
  }
  return match.groups.imageUrl;
};

function preprocressToc(toc: any[]): any[] {
  if (toc.length === 0) {
    return null;
  }

  let currentLevel = 1;
  const root = [{}];
  let currentItem = root[0];

  for (let i = 0; i < toc.length; i++) {
    const element = toc[i];

    while (element.level > currentLevel) {
      const parent = currentItem;
      currentItem = {};
      if (!parent["children"]) {
        parent["children"] = [];
      }
      parent["children"].push(currentItem);
      currentItem["parent"] = parent;
      currentLevel++;
    }
    while (element.level < currentLevel) {
      currentItem = currentItem["parent"];
      currentLevel--;
    }

    if (!currentItem["children"]) {
      currentItem["children"] = [];
    }
    currentItem["children"].push(element);
  }

  return root;
}

function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

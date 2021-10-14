import marked from "marked";
import hljs from "highlight.js";

export const getHTML = (markdown: string): string => {
  return marked(markdown);
};

export const getTableOfContents = (markdown: string): any[] => {
  const toc = [];

  // Override function
  const renderer = {
    heading(text, level, _, slugger) {
      const escapedText = slugger.slug(
        text.toLowerCase().replace(/[^\w\u1100-\udfff]+/g, "-")
      );
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

export const getHTMLWithoutTags = (
  markdown: string,
  limit?: number
): string => {
  const html = marked(markdown);
  const replaced = html.replace(/<[^>]*>/g, "");
  if (!limit) {
    return replaced;
  }

  let ret = replaced.substring(0, limit);
  if (replaced.length > limit) {
    ret += "&hellip;";
  }
  return ret;
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

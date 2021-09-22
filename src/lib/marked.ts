import marked from "marked";

export const getHTML = (markdown: string): string => {
  return marked(markdown);
};

export const getTableOfContents = (markdown: string): any[] => {
  const toc = [];

  // Override function
  const renderer = {
    heading(text, level) {
      const escapedText = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, "-");
      toc.push({
        anchor: escapedText,
        level: level,
        text: escapeHtml(text),
      });
      return `<h${level} id="${escapedText}" class="heading">
                ${text}
              </h${level}>`;
    },
  };

  marked.use({ renderer });
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

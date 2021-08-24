import marked from "marked";

export const getHTML = (markdown: string): string => {
  return marked(markdown);
};

export const getTableOfContentsHTML = (markdown: string): string => {
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
                <a name="${escapedText}" class="anchor" href="#${escapedText}">
                  #
                </a>
              </h${level}>`;
    },
  };

  marked.use({ renderer });
  marked(markdown);

  return generateHTMLFromToc(toc);
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

function generateHTMLFromToc(toc: any[]): string {
  const ul = '<ul class="menu_list">',
    ulc = "</ul>",
    li = "<li>",
    lic = "</li>";
  let html = "";
  let currentLevel = 0;

  for (let i = 0; i < toc.length; i++) {
    const element = toc[i];

    while (element.level > currentLevel) {
      html += ul;
      currentLevel++;
    }
    while (element.level < currentLevel) {
      html += ulc;
      currentLevel--;
    }

    html += li;
    html += `<a href="#${element.anchor}">${element.text}</a>`;
    html += lic;
  }

  while (currentLevel > 0) {
    html += ulc;
    currentLevel--;
  }

  return html;
}

function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

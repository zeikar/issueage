import marked from "marked";

export const getHTML = (markdown: string): String => {
  return marked(markdown);
};

export const getHTMLWithoutTags = (markdown: string): String => {
  const html = marked(markdown);
  return html.replace(/<[^>]*>/g, "");
};

export const getFirstImageUrl = (markdown: string): String => {
  // get first group
  const match = /!\[[^\]]*\]\((?<imageUrl>.*?)(?="|\))(".*")?\)/g.exec(
    markdown
  );
  if (!match) {
    return "";
  }
  return match.groups.imageUrl;
};

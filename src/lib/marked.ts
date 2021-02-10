import marked from "marked";

export const getHTML = (markdown: string): String => {
  return marked(markdown);
};

export const getHTMLWithoutTags = (markdown: string): String => {
  const html = marked(markdown);
  return html.replace(/<[^>]*>/g, "");
};

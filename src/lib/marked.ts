import marked from "marked";

export const getHTML = (markdown: string): string => {
  return marked(markdown);
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

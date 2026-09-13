// BASE_URL is "/" for a user site, and "/issueage" or "/issueage/" depending on trailingSlash
export const withBase = (base: string, path: string): string => {
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
};

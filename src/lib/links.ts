// BASE_URL is "/" for a site served from its domain root, and "/repozine" or "/repozine/" (depending on trailingSlash) under a path
export const withBase = (base: string, path: string): string => {
  return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
};

export const postPath = (number: number): string => `/posts/${number}/`;

export const tagPath = (slug: string): string => `/tags/${slug}/`;

// [...page] routes serve page 1 at the prefix itself
export const pagePath = (prefix: string, page: number): string =>
  page === 1 ? `${prefix}/` : `${prefix}/${page}/`;

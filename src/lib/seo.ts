import { withBase } from "./links";

export const absoluteUrl = (path: string, site: URL | undefined): string => {
  if (site === undefined) {
    throw new Error("absolute URLs need `site` set in astro.config.ts");
  }
  return new URL(path, site).href;
};

// the absolute URL of a path under the site's base, e.g. its home page or sitemap
export const siteUrl = (
  base: string,
  path: string,
  site: URL | undefined,
): string => absoluteUrl(withBase(base, path), site);

// the repository's About text describes the site; the owner's bio stands in when the repository has none,
// and GitHub returns an unset bio as "" for some accounts
export const siteDescription = ({
  description,
  profile,
}: {
  description: string | null;
  profile: { bio: string | null };
}): string | null => description ?? (profile.bio?.trim() || null);

// XML 1.0 has no escape for most control characters, so text that may hold them (post titles and excerpts) has to drop them
export const xmlSafe = (text: string): string =>
  text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "");

// a post's first image can be any src the sanitizer allows, but link previews fetch og:image on their own and need an absolute address
export const shareableImage = (src: string | null): string | undefined =>
  src !== null && /^https?:\/\//i.test(src) ? src : undefined;

// the account's own Open Graph image service; it renders a card from the page's title, description and favicon
export const ogImageFor = (pageUrl: string): string =>
  `https://dogimg.vercel.app/api/og?url=${encodeURIComponent(pageUrl)}`;

// og:locale takes language_TERRITORY, so only a tag that names a region has one
export const ogLocaleFor = (language: string): string | undefined => {
  const [primary, ...subtags] = language.split("-");
  const region = subtags.find((subtag) => /^[a-z]{2}$/i.test(subtag));
  return region && `${primary.toLowerCase()}_${region.toUpperCase()}`;
};

// the JSON is written into a <script> element, where "</script>" or "<!--" in a post title would end or corrupt it;
// escaping these characters keeps the same JSON value while leaving no markup
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

type BlogPosting = {
  title: string;
  url: string;
  description: string;
  image: string | undefined;
  publishedAt: string;
  modifiedAt: string;
  tags: string[];
  author: { name: string; url: string };
};

export const blogPostingJsonLd = (post: BlogPosting) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  url: post.url,
  mainEntityOfPage: post.url,
  ...(post.description && { description: post.description }),
  ...(post.image && { image: post.image }),
  datePublished: post.publishedAt,
  dateModified: post.modifiedAt,
  ...(post.tags.length > 0 && { keywords: post.tags.join(", ") }),
  author: { "@type": "Person", name: post.author.name, url: post.author.url },
});

const escapeXml = (text: string): string =>
  text.replace(
    /[<>&"']/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );

export const sitemapXml = (urls: { loc: string; lastmod?: string }[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      ({ loc, lastmod }) =>
        `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

export const robotsTxt = (sitemapUrl: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

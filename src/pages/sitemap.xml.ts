import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { postPath, tagPath } from "../lib/links";
import { byNewest } from "../lib/posts";
import { siteUrl, sitemapXml } from "../lib/seo";
import { collectTags } from "../lib/tags";

// only posts carry a last modified date: the home and tag pages change with every post, which a date would misstate
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection("posts"))
    .map((entry) => entry.data)
    .sort(byNewest);
  const url = (path: string) => siteUrl(import.meta.env.BASE_URL, path, site);

  return new Response(
    sitemapXml([
      { loc: url("/") },
      ...posts.map((post) => ({
        loc: url(postPath(post.number)),
        lastmod: post.updatedAt,
      })),
      ...collectTags(posts).map((tag) => ({ loc: url(tagPath(tag.slug)) })),
    ]),
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};

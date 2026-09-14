import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "../lib/config";
import { postPath, withBase } from "../lib/links";
import { byNewest } from "../lib/posts";
import { siteDescription, siteUrl, xmlSafe } from "../lib/seo";
import { getSite } from "../lib/site";

export const GET: APIRoute = async ({ site }) => {
  const [posts, siteData] = await Promise.all([
    getCollection("posts"),
    getSite(),
  ]);
  const { websiteTitle, language } = siteConfig;

  return rss({
    title: websiteTitle,
    // RSS requires a channel description
    description: siteDescription(siteData) ?? websiteTitle,
    site: siteUrl(import.meta.env.BASE_URL, "/", site),
    items: posts
      .map((entry) => entry.data)
      .sort(byNewest)
      .map((post) => ({
        title: xmlSafe(post.title),
        link: withBase(import.meta.env.BASE_URL, postPath(post.number)),
        pubDate: new Date(post.createdAt),
        description: xmlSafe(post.excerpt),
        categories: post.tags.map((tag) => xmlSafe(tag.name)),
      })),
    // parseSiteConfig only accepts a language tag, so it is safe to write into the XML as is
    customData: `<language>${language}</language>`,
  });
};

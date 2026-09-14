import type { APIRoute, GetStaticPaths } from "astro";
import { robotsTxt, siteUrl } from "../lib/seo";

// crawlers read robots.txt only at the root of a host, so it is built only for a site served from there (an <owner>.github.io
// repository, or a project repository with its own domain); a site under a path has to list its sitemap in the root site's robots.txt
export const getStaticPaths = (() =>
  import.meta.env.BASE_URL === "/"
    ? [{ params: { file: "robots" } }]
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = ({ site }) =>
  new Response(
    robotsTxt(siteUrl(import.meta.env.BASE_URL, "/sitemap.xml", site)),
  );

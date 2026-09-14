import type { APIRoute, GetStaticPaths } from "astro";
import { robotsTxt, siteUrl } from "../lib/seo";

// crawlers read robots.txt only at the root of a host, so it is built only for a site served from there (an <owner>.github.io repository);
// a project site's sitemap has to be listed in the root site's robots.txt instead
export const getStaticPaths = (() =>
  import.meta.env.BASE_URL === "/"
    ? [{ params: { file: "robots" } }]
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = ({ site }) =>
  new Response(
    robotsTxt(siteUrl(import.meta.env.BASE_URL, "/sitemap.xml", site)),
  );

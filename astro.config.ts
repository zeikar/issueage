import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { basePathFor, siteConfig, siteOriginFor } from "./src/lib/config";

// the config runs in Node, and the project has no @types/node (see src/lib/github.ts)
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  // canonical, Open Graph, sitemap and RSS URLs are absolute; the deploy workflow sets SITE_ORIGIN
  site: siteOriginFor(process.env.SITE_ORIGIN, siteConfig.repoOwner),
  base: basePathFor(siteConfig.repoOwner, siteConfig.repoName),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});

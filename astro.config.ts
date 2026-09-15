import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import {
  assertBuildingConfiguredRepository,
  fontStylesheetFor,
  siteConfig,
  siteLocationFor,
} from "./src/lib/config";

// the config runs in Node, and the project has no @types/node (see src/lib/github.ts)
declare const process: { env: Record<string, string | undefined> };

// Codespaces sets GITHUB_REPOSITORY too, also in a contributor's fork, so only builds in GitHub Actions are checked
assertBuildingConfiguredRepository(
  siteConfig.repoOwner,
  siteConfig.repoName,
  process.env.GITHUB_ACTIONS === "true"
    ? process.env.GITHUB_REPOSITORY
    : undefined,
);

// canonical, Open Graph, sitemap and RSS URLs are absolute; the deploy workflow sets SITE_URL
const { site, base } = siteLocationFor(
  process.env.SITE_URL,
  siteConfig.repoOwner,
  siteConfig.repoName,
);

export default defineConfig({
  site,
  base,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "repozine:fonts": fontStylesheetFor(siteConfig.language) },
    },
  },
});

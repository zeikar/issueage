import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { basePathFor, siteConfig } from "./src/lib/config";

export default defineConfig({
  base: basePathFor(siteConfig.repoOwner, siteConfig.repoName),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});

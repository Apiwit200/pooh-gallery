import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://apiwit-nathong.pages.dev";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  output: "static",
  build: { format: "directory", inlineStylesheets: "always" },
  image: { service: { entrypoint: "astro/assets/services/noop" } },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  vite: { plugins: [tailwindcss()] },
});

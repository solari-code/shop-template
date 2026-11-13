import { siteConfig } from "@/config/site.mjs";
import { themeConfig } from "@/config/theme.mjs";
import { siteLanguage } from "@/lib/config/shop.mjs";
import { defaultColorMode } from "@/lib/config/theme.mjs";

// Web app manifest (/manifest.webmanifest), built from the config. It can
// only hold one set of colours: those of the default mode (light for
// 'system').
const colors = themeConfig.colors[defaultColorMode(themeConfig.mode)];

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: colors["base-100"],
    theme_color: colors.primary,
    lang: siteLanguage,
    icons: [
      { src: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png", purpose: "any" },
      { src: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}

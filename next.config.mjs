import { assertShopConfig } from './lib/config/check.mjs';
import { themeConfig } from './config/theme.mjs';

// Checks config/*.mjs before anything starts: errors stop `next dev`,
// `next build` and `next start` with a list of what to fix.
assertShopConfig();

// The fonts chosen in config/theme.mjs. next/font needs fixed values in
// the code, so each bundled font has its own file in app/fonts/; these
// aliases point to the chosen ones, so only those are loaded and preloaded.
// (Changing the fonts needs a restart of `next dev`.)
const fontAliases = {
  '@shop/body-font': `./app/fonts/${themeConfig.fonts.body}.js`,
  '@shop/heading-font': `./app/fonts/${themeConfig.fonts.heading}.js`,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: fontAliases,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;

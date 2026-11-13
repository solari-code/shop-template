import "./globals.css";
import { siteConfig } from "@/config/site.mjs";
import { themeConfig } from "@/config/theme.mjs";
import { siteLanguage } from "@/lib/config/shop.mjs";
import { fontVariables, serverThemeAttribute } from "@/lib/config/theme.mjs";
import ThemeHead from "@/components/ThemeHead";
// The fonts chosen in config/theme.mjs (bundled in app/fonts, SIL OFL).
// next.config.mjs points these names to the chosen font files.
import bodyFont from "@shop/body-font";
import headingFont from "@shop/heading-font";

const { name, tagline, description, url, logos } = siteConfig;

export const metadata = {
  // Absolute URLs for social preview images
  metadataBase: new URL(url),
  title: {
    default: name,
    // Page titles get the shop name added: "Products — Selva Studio"
    template: `%s — ${name}`,
  },
  description,
  openGraph: {
    title: `${name} - ${tagline}`,
    description,
    url,
    siteName: name,
    type: "website",
    images: [
      {
        url: logos.openGraph,
        width: 1200,
        height: 630,
        alt: name,
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/favicon/apple-touch-icon.png'
  },
  // The web app manifest is app/manifest.js (linked automatically)
};

// Font classes define --font-inter etc.; the same class appears only once
// when body and headings use the same font.
const fontClasses = [...new Set([bodyFont.variable, headingFont.variable])].join(" ");

export default async function RootLayout({ children }) {
  return (
    // data-theme: the light or dark mode when it is fixed or has a default;
    // the pre-paint script in ThemeHead changes it to a saved choice before
    // React hydrates, so differences on <html> are expected
    <html lang={siteLanguage} data-theme={serverThemeAttribute(themeConfig.mode)} suppressHydrationWarning>
      <head>
        {/* Theme colours and overlays as CSS variables (see app/globals.css) */}
        <ThemeHead />
      </head>
      <body className={`${fontClasses} font-sans antialiased bg-brand-base-100 text-brand-content`} style={fontVariables(themeConfig)}>
        {children}
      </body>
    </html>
  );
}
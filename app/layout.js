import localFont from "next/font/local";
import "./globals.css";

// Fonts are bundled in app/fonts (SIL OFL), so builds don't need to reach Google Fonts.
// Inter is used below; Bagel Fat One (the logo face), Fraunces and Lora are there as well.
const inter = localFont({
  src: './fonts/InterVariable-latin.woff2',
  weight: '100 900',
  variable: '--font-inter',
});

export const metadata = {
  title: "Selva Studio",
  description: "Shop handmade slow fashion pieces from upcycled fabrics at Selva Studio.",
  openGraph: {
    title: "Selva Studio - Slow Fashion",
    description: "Shop handmade slow fashion pieces from upcycled fabrics at Selva Studio.",
    url: "https://example.com",
    siteName: "Selva Studio",
    type: "website",
    images: [
      {
        url: "/images/logo/openGraph_logo.png",
        width: 1200,
        height: 630,
        alt: "Selva Studio",
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
  manifest: "/manifest.json",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="selva">
      <body className={` ${inter.variable} font-sans antialiased bg-white`}>
        {children}
      </body>
    </html>
  );
}
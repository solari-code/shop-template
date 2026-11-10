// Inter (SIL OFL, see OFL-*.txt). Selected in config/theme.mjs as 'inter';
// next.config.mjs points @shop/body-font and @shop/heading-font to the
// chosen files, so only those are loaded.
// The const name becomes the font family name, so it must be unique.
import localFont from 'next/font/local';

const inter = localFont({
  src: './InterVariable-latin.woff2',
  weight: '100 900',
  variable: '--font-inter',
});

export default inter;

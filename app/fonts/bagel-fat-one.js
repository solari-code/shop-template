// Bagel Fat One (SIL OFL, see OFL-*.txt). Selected in config/theme.mjs as 'bagel-fat-one';
// next.config.mjs points @shop/body-font and @shop/heading-font to the
// chosen files, so only those are loaded.
// The const name becomes the font family name, so it must be unique.
import localFont from 'next/font/local';

const bagelFatOne = localFont({
  src: './BagelFatOne-Regular-latin.woff2',
  weight: '400',
  variable: '--font-bagel-fat-one',
});

export default bagelFatOne;

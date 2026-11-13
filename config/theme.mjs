// Colours, fonts, image overlays and email colours, and light and dark mode.
//
// The look comes from one of the example themes in config/themes/, each
// with a light and a dark palette:
// - studio:  clean and minimal, violet accent; Inter (the template's look)
// - atelier: warm sand tones, terracotta accent; Lora and Fraunces
// - bloom:   soft pink, teal accent; Inter and Bagel Fat One
// To use another, change the import and the `...studio` line below. To
// adjust a theme, edit its file, or copy one as a starting point for your
// own. (Changing the fonts needs a restart of `npm run dev`.)
//
// The colours of a theme, in each palette (colors.light, colors.dark).
// Hex values (#rgb or #rrggbb):
// - base-100, base-200, base-300: page backgrounds, from the page itself
//   to sections and borders
// - content: text and dark buttons
// - primary: brand colour (WhatsApp button, button hover, browser theme
//   colour)
// - neutral: footer background and the dark tint over images
// - surface: header bar, form fields and the image slider buttons
// - content-inverse: text on dark buttons (content and primary backgrounds)
// - content-soft, content-muted, content-subtle: softer text colours, from
//   darkest to lightest (in dark mode: brightest to dimmest): body text on
//   the About and legal pages; labels and small headings; placeholders
// - on-image: text and icons on images and on the footer
// - badge, badge-text: item count on the cart icon
// In the dark palette, content is light and the backgrounds are dark.
// `npm run check-config` warns when a text colour has too little contrast
// with its background.
//
// Also in a theme: fonts (bundled in app/fonts: 'inter', 'fraunces',
// 'lora', 'bagel-fat-one'), overlays (how strongly images are darkened
// behind text, in percent, the same in both modes) and email colours
// (written into each email as fixed values, because email programs don't
// support the site's CSS).

import { studio } from './themes/studio.mjs'

export const themeConfig = {
    ...studio,

    // Light or dark mode
    mode: {
        // The mode the shop starts in: 'light', 'dark', or 'system' to
        // follow the visitor's device setting
        default: 'system',
        // Lets visitors switch between light and dark. Their choice is
        // saved in the browser (localStorage). false: always `default`.
        switcher: true,
        // Where the switcher is shown: a button in the side menu, a button in
        // the footer, and an icon in the header (next to the menu button)
        showInMenu: true,
        showInFooter: true,
        showInHeader: false,
    },
}

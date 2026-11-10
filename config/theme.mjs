// Colours, fonts and image overlays. Colours are hex values (#rgb or #rrggbb).
// For a dark theme, swap the light and dark values: e.g. dark base-*,
// light content, and dark content-inverse.

export const themeConfig = {
    colors: {
        // Page backgrounds, from lightest to darkest
        'base-100': '#ffffff',
        'base-200': '#f4f4f6',
        'base-300': '#e8e8ed',
        // Text and dark buttons
        content: '#1c1917',
        // Brand colour (WhatsApp button, button hover, browser theme colour)
        primary: '#9567f3',
        // Footer background and the dark tint over images
        neutral: '#0b0809',

        // Header bar, form fields and the image slider buttons
        surface: '#ffffff',
        // Text on dark buttons (content and primary backgrounds)
        'content-inverse': '#ffffff',
        // Softer text colours, from darkest to lightest: body text on the
        // About and legal pages; labels and small headings; placeholders
        'content-soft': '#4b5563',
        'content-muted': '#6b7280',
        'content-subtle': '#9ca3af',
        // Text and icons on images and on the footer
        'on-image': '#ffffff',
        // Item count on the cart icon
        badge: '#ef4444',
        'badge-text': '#ffffff',
    },

    // Fonts bundled in app/fonts: 'inter', 'fraunces', 'lora', 'bagel-fat-one'
    fonts: {
        body: 'inter',
        heading: 'inter',
    },

    // How strongly images are darkened behind text, in percent (0-100)
    overlays: {
        hero: 35,
        banner: 35,
        footer: 10,
    },

    // Email colours. Written into each email as fixed values, because email
    // programs don't support the site's CSS.
    email: {
        background: '#f5f5f5',
        card: '#ffffff',
        text: '#111111',
        muted: '#888888',
        light: '#bbbbbb',
        border: '#e8e8e8',
        borderLight: '#f0f0f0',
    },
}

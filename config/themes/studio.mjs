// Example theme "Studio": clean and minimal, with a violet accent.
// Inter for text and headings. The template's original look.
//
// Chosen in config/theme.mjs. The colours are explained there.

export const studio = {
    colors: {
        light: {
            'base-100': '#ffffff',
            'base-200': '#f4f4f6',
            'base-300': '#e8e8ed',
            content: '#1c1917',
            primary: '#8753f1',
            neutral: '#0b0809',
            surface: '#ffffff',
            'content-inverse': '#ffffff',
            'content-soft': '#4b5563',
            'content-muted': '#5c636f',
            'content-subtle': '#666f7f',
            'on-image': '#ffffff',
            badge: '#dc2626',
            'badge-text': '#ffffff',
        },
        dark: {
            'base-100': '#121114',
            'base-200': '#1b1a1e',
            'base-300': '#2b2a30',
            content: '#f4f3f1',
            primary: '#a98bf6',
            neutral: '#0b0809',
            surface: '#1b1a1e',
            'content-inverse': '#121114',
            'content-soft': '#c9c7cf',
            'content-muted': '#a19eaa',
            'content-subtle': '#85828e',
            'on-image': '#ffffff',
            badge: '#dc2626',
            'badge-text': '#ffffff',
        },
    },

    fonts: {
        body: 'inter',
        heading: 'inter',
    },

    overlays: {
        hero: 35,
        banner: 35,
        footer: 10,
    },

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

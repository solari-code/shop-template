// Example theme "Bloom": bright and playful, soft pink with a teal accent.
// Inter for text, Bagel Fat One for headings.
//
// Chosen in config/theme.mjs. The colours are explained there.

export const bloom = {
    colors: {
        light: {
            'base-100': '#fff5f9',
            'base-200': '#fce8f1',
            'base-300': '#f6d5e3',
            content: '#2a1030',
            primary: '#0e7f81',
            neutral: '#1c0d22',
            surface: '#ffffff',
            'content-inverse': '#ffffff',
            'content-soft': '#5b4461',
            'content-muted': '#6f5a74',
            'content-subtle': '#7a627f',
            'on-image': '#ffffff',
            badge: '#d6246e',
            'badge-text': '#ffffff',
        },
        dark: {
            'base-100': '#1a0f1f',
            'base-200': '#24152b',
            'base-300': '#36223f',
            content: '#fbeef5',
            primary: '#4fd1c5',
            neutral: '#0f0713',
            surface: '#24152b',
            'content-inverse': '#1a0f1f',
            'content-soft': '#e2cbe0',
            'content-muted': '#b79dbb',
            'content-subtle': '#927d98',
            'on-image': '#ffffff',
            badge: '#ff5fa2',
            'badge-text': '#1a0f1f',
        },
    },

    fonts: {
        body: 'inter',
        heading: 'bagel-fat-one',
    },

    overlays: {
        hero: 30,
        banner: 30,
        footer: 15,
    },

    email: {
        background: '#fdf3f7',
        card: '#ffffff',
        text: '#2a1030',
        muted: '#8a7390',
        light: '#c9b8cd',
        border: '#f3dfe8',
        borderLight: '#f8eaf0',
    },
}

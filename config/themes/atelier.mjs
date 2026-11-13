// Example theme "Atelier": warm and natural, sand tones with a terracotta
// accent. Lora for text, Fraunces for headings.
//
// Chosen in config/theme.mjs. The colours are explained there.

export const atelier = {
    colors: {
        light: {
            'base-100': '#faf7f2',
            'base-200': '#f2ece2',
            'base-300': '#e6dccd',
            content: '#2b2118',
            primary: '#b0502c',
            neutral: '#1f1710',
            surface: '#fdfbf7',
            'content-inverse': '#fdfbf7',
            'content-soft': '#5a4a3c',
            'content-muted': '#6b5b4c',
            'content-subtle': '#766758',
            'on-image': '#fffaf3',
            badge: '#b0502c',
            'badge-text': '#ffffff',
        },
        dark: {
            'base-100': '#1a1511',
            'base-200': '#231c16',
            'base-300': '#362c23',
            content: '#f3ebe0',
            primary: '#e08a63',
            neutral: '#0f0b08',
            surface: '#231c16',
            'content-inverse': '#1a1511',
            'content-soft': '#d6c8b8',
            'content-muted': '#ae9d8b',
            'content-subtle': '#948373',
            'on-image': '#fffaf3',
            badge: '#e08a63',
            'badge-text': '#1a1511',
        },
    },

    fonts: {
        body: 'lora',
        heading: 'fraunces',
    },

    overlays: {
        hero: 30,
        banner: 35,
        footer: 15,
    },

    email: {
        background: '#f5f0e8',
        card: '#fffdf9',
        text: '#2b2118',
        muted: '#8a7866',
        light: '#c2b5a6',
        border: '#e9e0d2',
        borderLight: '#f1ebe1',
    },
}

// Brand, contact and email sender details.
//
// Plain data only: this file is used by the shop, the emails, the Sanity
// Studio and the config check (npm run check-config). No secrets here; API
// keys and NOTIFICATION_EMAIL stay in .env.local.

export const siteConfig = {
    // Shop name, used in page titles, the footer, emails and alt texts
    name: 'Selva Studio',
    // Short name for the home screen icon (web app manifest)
    shortName: 'Selva',
    // Used after the name in social previews ("Selva Studio - Slow Fashion")
    // and in the email footer
    tagline: 'Slow Fashion',
    // Default description for search engines and social previews
    description: 'Shop handmade slow fashion pieces from upcycled fabrics at Selva Studio.',
    // Public URL of the shop, without a trailing slash
    url: 'https://example.com',
    // Language and region (BCP 47), used for the page language and for
    // formatting prices and country names, e.g. 'en-US', 'de-DE', 'fr-FR'
    locale: 'en-US',

    // The person behind the shop, shown in the footer and email signature
    owner: {
        name: 'Mara Silva',
        firstName: 'Mara',
    },

    contact: {
        // Public contact address (footer, legal pages, order confirmation)
        email: 'hello@example.com',
        // Optional, shown in the footer when set
        phone: '',
        // Optional WhatsApp number in international format, digits only
        // (no +, spaces or leading zeros), e.g. '4915112345678'.
        // Leave empty to hide the WhatsApp button.
        whatsapp: '10000000000',
    },

    // Social links in the footer. type: instagram, facebook, tiktok,
    // pinterest or youtube
    social: [
        { type: 'instagram', url: 'https://www.instagram.com/' },
    ],

    // Image files in /public
    logos: {
        // Header and test checkout in light mode: a dark logo for the
        // light header bar. Only needed when the shop can show the light
        // mode (config/theme.mjs).
        lightMode: '/images/logo/logo_black.png',
        // Header and test checkout in dark mode: a light version of the same
        // logo, so the header looks the same in both modes. Only needed
        // when the shop can show the dark mode.
        darkMode: '/images/logo/logo_white.png',
        // On the photos of the hero section and the footer, in both modes:
        // a light logo that stands out on the darkened images
        onImage: '/images/logo/logo_slowfashion_white.png',
        // Preview image for social media (1200 x 630)
        openGraph: '/images/logo/openGraph_logo.png',
    },

    // Sender of all shop emails. The domain must be verified in Resend.
    // Replies to order confirmations go to contact.email.
    emailSender: {
        name: 'Selva Studio',
        address: 'hello@example.com',
    },
}

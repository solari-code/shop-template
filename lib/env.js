// Shared helper for checking env values; safe to import on server and client.

// Values from .env.example count as "not set", so copying the example file
// without filling it in still gives a working local shop.
const PLACEHOLDER_VALUES = new Set([
    'your-project-id',
    'sk_placeholder',
    'sk_test_placeholder',
    'whsec_placeholder',
    're_placeholder',
    'you@example.com',
])

export function isConfigured(value) {
    const trimmed = typeof value === 'string' ? value.trim() : ''
    return trimmed !== '' && !PLACEHOLDER_VALUES.has(trimmed)
}

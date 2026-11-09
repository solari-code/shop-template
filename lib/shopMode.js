import 'server-only'
import { isConfigured } from '@/lib/env'

// Decides whether the shop runs against real services ("live") or fully
// offline with local data, a test checkout and console emails ("local").
//
// SHOP_MODE=local|live forces a mode. Without it, the shop runs live only
// when the Sanity project and Stripe secret key are configured.

export const SHOP_MODES = ['local', 'live']

// Needed for live mode; if any of these is missing, auto-detection picks local.
const REQUIRED_FOR_LIVE = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'STRIPE_SECRET_KEY',
]

// Live mode starts without these, but parts of the order flow won't work.
const RECOMMENDED_FOR_LIVE = {
    STRIPE_WEBHOOK_SECRET: 'the Stripe webhook will reject all events',
    SANITY_API_WRITE_TOKEN: 'stock cannot be updated after an order',
    RESEND_API_KEY: 'no emails can be sent',
    NOTIFICATION_EMAIL: 'order and contact notifications have no recipient',
    NEXT_PUBLIC_URL: 'Stripe success and cancel URLs will be invalid',
}

// Next.js inlines NEXT_PUBLIC_* only for static `process.env.X` access, so
// every variable is listed explicitly instead of read via process.env[name].
function readEnv() {
    return {
        SHOP_MODE: process.env.SHOP_MODE,
        NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
        NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    }
}

export function resolveShopMode(env) {
    const missingForLive = REQUIRED_FOR_LIVE.filter(name => !isConfigured(env[name]))
    const missingRecommended = Object.keys(RECOMMENDED_FOR_LIVE).filter(name => !isConfigured(env[name]))
    const requested = env.SHOP_MODE?.trim().toLowerCase()
    const warnings = []

    let mode
    let reason

    if (requested && SHOP_MODES.includes(requested)) {
        mode = requested
        reason = `forced by SHOP_MODE=${requested}`
    } else {
        if (requested) {
            warnings.push(`Ignoring unknown SHOP_MODE="${env.SHOP_MODE}" (expected "local" or "live"), detecting mode from keys instead.`)
        }
        if (missingForLive.length === 0) {
            mode = 'live'
            reason = 'Sanity and Stripe keys are configured'
        } else {
            mode = 'local'
            reason = `missing ${missingForLive.join(', ')}`
        }
    }

    if (mode === 'live') {
        if (missingForLive.length > 0) {
            warnings.push(`SHOP_MODE=live, but ${missingForLive.join(', ')} ${missingForLive.length === 1 ? 'is' : 'are'} not set. Product data and checkout will fail.`)
        }
        for (const name of missingRecommended) {
            warnings.push(`${name} is not set: ${RECOMMENDED_FOR_LIVE[name]}.`)
        }
    }

    return { mode, reason, warnings, missingForLive }
}

let cached

export function getShopMode() {
    if (!cached) {
        cached = resolveShopMode(readEnv())
        console.log(`[shop] Running in ${cached.mode} mode (${cached.reason}).`)
        for (const warning of cached.warnings) {
            console.warn(`[shop] Warning: ${warning}`)
        }
    }
    return cached
}

export function isLocalMode() {
    return getShopMode().mode === 'local'
}

export function isLiveMode() {
    return getShopMode().mode === 'live'
}

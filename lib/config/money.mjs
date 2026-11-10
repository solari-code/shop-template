// Prices: formatting, rounding and conversion to Stripe amounts.
// Plain functions, safe on the server, in the browser and in Node.
//
// Prices in the shop are plain numbers in the shop currency (e.g. 19.5 for
// $19.50). Stripe expects integers in the currency's smallest unit, which
// is not always 1/100:
// - zero-decimal currencies (JPY, KRW, ...):  ¥500  -> 500
// - three-decimal currencies (KWD, ...):      1.25  -> 1250 (must end in 0)
// - all others:                               19.5  -> 1950
// https://docs.stripe.com/currencies

// Stripe's zero-decimal currencies
const STRIPE_ZERO_DECIMAL = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']
// Stripe's three-decimal currencies; amounts must be divisible by 10
const STRIPE_THREE_DECIMAL = ['BHD', 'JOD', 'KWD', 'OMR', 'TND']

// Currencies the shop refuses, with the reason (reported by the config check)
export const UNSUPPORTED_CURRENCIES = {
    UGX: 'Stripe handles UGX as a special case (see https://docs.stripe.com/currencies#special-cases), which this shop does not support yet.',
    XDR: 'XDR is not a currency customers can pay in.',
    XSU: 'XSU is not a currency customers can pay in.',
}

// Details of a currency:
// - factor:   Stripe amount = price * factor
// - decimals: decimals a price may have. The fewer of what the currency
//             uses in practice (Intl) and what Stripe can charge; e.g. ISK
//             has no coins, so prices are whole although Stripe counts
//             in 1/100.
const infoCache = new Map()

export function currencyInfo(currency) {
    const code = String(currency).toUpperCase()
    if (!infoCache.has(code)) infoCache.set(code, readCurrencyInfo(code))
    return infoCache.get(code)
}

function readCurrencyInfo(code) {
    const intlDigits = new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits
    if (STRIPE_ZERO_DECIMAL.includes(code)) return { code, factor: 1, decimals: 0 }
    // Three-decimal amounts must end in 0, so at most 2 decimals can be used
    if (STRIPE_THREE_DECIMAL.includes(code)) return { code, factor: 1000, decimals: Math.min(intlDigits, 2) }
    return { code, factor: 100, decimals: Math.min(intlDigits, 2) }
}

// True if the amount has no more decimals than the currency allows
export function fitsCurrency(amount, currency) {
    const scaled = amount * 10 ** currencyInfo(currency).decimals
    return Math.abs(Math.round(scaled) - scaled) < 1e-6
}

// Rounds away floating point noise: 19.99 * 3 = 59.970000000000006 -> 59.97
export function roundAmount(amount, currency) {
    const scale = 10 ** currencyInfo(currency).decimals
    return Math.round((Number(amount) || 0) * scale) / scale
}

// Price -> Stripe amount (integer in the smallest unit)
export function toStripeAmount(amount, currency) {
    const { factor } = currencyInfo(currency)
    return Math.round(roundAmount(amount, currency) * factor)
}

// Stripe amount -> price
export function fromStripeAmount(stripeAmount, currency) {
    return (Number(stripeAmount) || 0) / currencyInfo(currency).factor
}

// True if two prices are the same once rounded to the currency
export function sameAmount(a, b, currency) {
    return toStripeAmount(a, currency) === toStripeAmount(b, currency)
}

// "$20" for whole amounts, "$19.50" when there are decimals.
export function formatMoney(amount, { currency, locale }) {
    const { decimals } = currencyInfo(currency)
    const rounded = roundAmount(amount, currency)
    const digits = Number.isInteger(rounded) ? 0 : decimals
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(rounded)
}

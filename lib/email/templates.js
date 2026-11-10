// Email templates. Each returns { subject, html, text }.
// The text version is used for the console output in local mode.
//
// All dynamic values are HTML-escaped: names, addresses and messages come
// from customers and must not be able to inject markup into the emails.

import { SHOP_EMAIL } from './config'
import { siteConfig } from '@/config/site.mjs'
import { themeConfig } from '@/config/theme.mjs'
import { textsConfig } from '@/config/texts.mjs'
import { shopText, shopCurrency, sizeText } from '@/lib/config/shop.mjs'
import { formatMoney } from '@/lib/config/money.mjs'
import { countryName } from '@/lib/checkout/address.mjs'

// Email colours from config/theme.mjs (fixed values: email programs
// don't support the site's CSS variables)
const {
    background: pageBg,
    card: bg,
    text,
    muted: textMuted,
    light: textLight,
    border,
    borderLight,
} = themeConfig.email

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

const e = escapeHtml

// A config text (config/texts.mjs) as HTML: the text and the filled-in
// values are escaped; `html` values (e.g. a link) are inserted as they are.
// Line breaks (\n) become <br/>.
function htmlText(text, values = {}, html = {}) {
    return e(text)
        .replace(/\n/g, '<br/>')
        .replace(/\{(\w+)\}/g, (match, name) =>
            name in html ? html[name] : e(shopText(match, values))
        )
}

// For the plain-text parts: missing values become '' instead of "undefined".
const t = (value) => value ?? ''

// Address as lines, skipping empty parts (no "undefined" in emails).
function addressLines(address, { includeCountry = false } = {}) {
    if (!address) return []
    const street = [address.line1, address.line2].filter(Boolean).join(', ')
    const region = [address.state, address.postal_code].filter(Boolean).join(' ')
    const cityLine = [address.city, region].filter(Boolean).join(', ')
    // Full country name in the shop's language ('US' -> 'United States')
    const country = includeCountry && address.country ? countryName(address.country, siteConfig.locale) : null
    return [street, cityLine, country].filter(Boolean)
}

// An amount in the order's currency, formatted like on the site ("$20", "$19.50")
function money(amount, currency = shopCurrency) {
    return formatMoney(Number(amount) || 0, { currency, locale: siteConfig.locale })
}

function lineTotal(item, currency) {
    return money((Number(item.price) || 0) * (Number(item.quantity) || 0), currency)
}

const emailWrapper = (content) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: ${pageBg};">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background: ${bg};">
                    
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 32px 40px; border-bottom: 1px solid ${border};">
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 20px; letter-spacing: 0.35em; font-weight: 300; margin: 0; text-transform: uppercase; color: ${text};">${e(siteConfig.name.toUpperCase())}</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 40px 32px 40px; border-top: 1px solid ${border};">
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 300; color: ${textMuted}; letter-spacing: 0.08em; margin: 0 0 4px 0;">${htmlText(textsConfig.emailSignature)}</p>
                            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 300; color: ${textLight}; letter-spacing: 0.08em; margin: 0;">${htmlText(textsConfig.emailFooter)}</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
`

const sectionLabel = (label) => `
    <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 10px 0;">${label}</p>
`

const divider = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr><td style="border-top: 1px solid ${border};"></td></tr>
    </table>
`

const productRows = (items, currency) => `
    <table width="100%" cellpadding="0" cellspacing="0">
        <!-- Header -->
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border};">
                Product
            </td>
            <td align="center" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border}; white-space: nowrap; padding-left: 12px;">
                Qty
            </td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 400; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 10px; border-bottom: 1px solid ${border}; white-space: nowrap; padding-left: 12px;">
                Total
            </td>
        </tr>

        <!-- Items -->
        ${items.map(i => `
            <tr>
                <td style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 14px 0; border-bottom: 1px solid ${borderLight};">
                    <p style="font-size: 13px; font-weight: 300; color: ${text}; margin: 0 0 3px 0;">${e(i.title)}</p>
                    <p style="font-size: 11px; font-weight: 300; color: ${textMuted}; margin: 0; text-transform: uppercase; letter-spacing: 0.08em;">${e(sizeText(i.size))}</p>
                </td>
                <td align="center" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap; vertical-align: top;">
                    ${e(i.quantity)}
                </td>
                <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap; vertical-align: top;">
                    ${e(lineTotal(i, currency))}
                </td>
            </tr>
        `).join('')}
    </table>
`

const totalRows = (total, shippingDisplayName, shippingCost, currency) => `
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0; border-bottom: 1px solid ${borderLight};">
                Shipping: ${e(shippingDisplayName)}
            </td>
            <td style="border-bottom: 1px solid ${borderLight}; padding: 14px 0 14px 12px;"></td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 300; color: ${text}; padding: 14px 0 14px 12px; border-bottom: 1px solid ${borderLight}; white-space: nowrap;">
                ${e(money(shippingCost, currency))}
            </td>
        </tr>
        <tr>
            <td style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 400; color: ${text}; text-transform: uppercase; letter-spacing: 0.12em; padding: 14px 0 0 0;">
                Total
            </td>
            <td style="padding: 14px 0 0 12px;"></td>
            <td align="right" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 300; color: ${text}; padding: 14px 0 0 12px; white-space: nowrap;">
                ${e(money(total, currency))}
            </td>
        </tr>
    </table>
`

// Plain-text parts

const textItems = (items, currency) => items
    .map(i => `- ${t(i.title)} (${sizeText(t(i.size))}) x ${t(i.quantity)}: ${lineTotal(i, currency)}`)
    .join('\n')

const textTotals = (total, shippingDisplayName, shippingCost, currency) =>
    `Shipping: ${t(shippingDisplayName)}: ${money(shippingCost, currency)}\nTotal: ${money(total, currency)}`


// ─── Contact Email ─────────────────────────────────────────
export function contactEmail({ name, email, message }) {
    return {
        subject: `New message — ${name}`,
        html: emailWrapper(`
                <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 32px 0; color: ${text};">
                    New contact message
                </h1>

                ${sectionLabel('From')}
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">${e(name)}</p>
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${textMuted}; margin: 0 0 28px 0;">
                    <a href="mailto:${e(email)}" style="color: ${textMuted}; text-decoration: none;">${e(email)}</a>
                </p>

                ${divider}

                ${sectionLabel('Message')}
                <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0; white-space: pre-wrap;">${e(message)}</p>
            `),
        text: `New contact message\n\nFrom: ${t(name)} <${t(email)}>\n\nMessage:\n${t(message)}`,
    }
}


// ─── Order Notification to the shop owner ─────────────────
export function orderNotificationEmail({ customerName, customerEmail, items, total, currency, paymentIntent, shippingName, shippingAddress, shippingDisplayName, shippingCost, orderNumber }) {
    const address = addressLines(shippingAddress, { includeCountry: true })
    // Only Stripe orders have a payment to link to (local test orders don't).
    const stripeUrl = paymentIntent ? `https://dashboard.stripe.com/payments/${encodeURIComponent(paymentIntent)}` : null

    return {
        subject: `🛍️ New order — ${customerName}`,
        html: emailWrapper(`
            <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 5px 0; color: ${text};">
                New order received
            </h1>
            <h3 style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300;font-size:15px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 32px 0;color: ${text}">${e(orderNumber)}</h3>

            ${sectionLabel('Customer')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">${e(customerName)}</p>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${textMuted}; margin: 0;">
                <a href="mailto:${e(customerEmail)}" style="color: ${textMuted}; text-decoration: none;">${e(customerEmail)}</a>
            </p>

            ${divider}

            ${sectionLabel('Shipping address')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 4px 0;">Ship to: ${e(shippingName)}</p>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0;">
                ${address.map(e).join('<br/>\n                ')}
            </p>

            ${divider}

            ${productRows(items, currency)}
            ${totalRows(total, shippingDisplayName, shippingCost, currency)}
            ${stripeUrl ? `
            ${divider}

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center">
                        <a href="${e(stripeUrl)}"
                           style="font-family: 'Helvetica Neue', Arial, sans-serif; display: inline-block; font-size: 11px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; color: ${text}; border: 1px solid ${text}; padding: 12px 32px; text-decoration: none;">
                            View in Stripe
                        </a>
                    </td>
                </tr>
            </table>` : ''}
        `),
        text: [
            `New order received: ${t(orderNumber)}`,
            `Customer: ${t(customerName)} <${t(customerEmail)}>`,
            [`Ship to: ${t(shippingName)}`, ...address].join('\n'),
            `Items:\n${textItems(items, currency)}`,
            textTotals(total, shippingDisplayName, shippingCost, currency),
            stripeUrl ? `View in Stripe: ${stripeUrl}` : null,
        ].filter(Boolean).join('\n\n'),
    }
}


// ─── Order Confirmation to Customer ───────────────────────
export function orderConfirmationEmail({ customerName, items, total, currency, shippingAddress, shippingDisplayName, shippingCost, orderNumber }) {
    const address = addressLines(shippingAddress)
    const texts = textsConfig.orderConfirmationEmail
    const values = { customerName: t(customerName) }
    const emailLink = `<a href="mailto:${e(SHOP_EMAIL)}" style="color: ${textMuted};">${e(SHOP_EMAIL)}</a>`

    return {
        subject: shopText(texts.subject),
        html: emailWrapper(`
            <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 300; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px 0; color: ${text};">
                ${htmlText(texts.heading)}
            </h1>
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; margin: 0 0 32px 0;">
                ${htmlText(texts.greeting, values)}
            </p>

            ${divider}

            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 300; color: ${text}; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px 0;">Your order: ${e(orderNumber)}</p>

            ${productRows(items, currency)}
            ${totalRows(total, shippingDisplayName, shippingCost, currency)}

            ${divider}

            ${sectionLabel('Shipping address')}
            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; color: ${text}; line-height: 1.8; margin: 0 0 28px 0;">
                ${address.map(e).join('<br/>\n                ')}
            </p>

            ${divider}

            <p style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: ${text}; margin: 0;">
                ${htmlText(texts.closing, values, { shopEmail: emailLink })}
            </p>
        `),
        text: [
            shopText(texts.heading),
            shopText(texts.greeting, values),
            `Your order: ${t(orderNumber)}`,
            `Items:\n${textItems(items, currency)}`,
            textTotals(total, shippingDisplayName, shippingCost, currency),
            ['Shipping address:', ...address].join('\n'),
            shopText(texts.closing, values),
        ].join('\n\n'),
    }
}

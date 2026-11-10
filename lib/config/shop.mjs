// Helpers for using the config in pages and components.
// Safe on the server and in the browser.
//
// createShopHelpers(config) builds the helpers for a config; the named
// exports below are the helpers for this shop's config (config/*.mjs).
// Tests use createShopHelpers with a fixed example config, so they don't
// depend on the values of a particular shop.

import { siteConfig } from '../../config/site.mjs'
import { pagesConfig } from '../../config/pages.mjs'
import { commerceConfig } from '../../config/commerce.mjs'
import { homepageSections } from '../../config/homepage.mjs'
import { fillText, textValues } from './text.mjs'
import { formatMoney } from './money.mjs'

export function createShopHelpers({ site, commerce, pages, homepage }) {
    const siteValues = textValues(site)

    // Fills in {shopName}, {ownerFirstName}, ... (and `extra` values, e.g.
    // { customerName }) in a config text.
    function shopText(text, extra) {
        return fillText(text, extra ? { ...siteValues, ...extra } : siteValues)
    }

    // ─── Pages (config/pages.mjs) ────────────────────────

    // Title and description of a page, for Next.js `metadata`. The shop
    // name is added to the title by the root layout.
    function pageMetadata(page) {
        const { title, description } = pages[page]
        return {
            ...(title !== undefined && { title: shopText(title) }),
            ...(description !== undefined && { description: shopText(description) }),
        }
    }

    // Banner image and title of a page, as PageBanner props
    function pageBanner(page) {
        const { image, title } = pages[page].banner
        return { image, title: shopText(title) }
    }

    // ─── Language and prices ─────────────────────────────

    // Page language for <html lang>, from the locale: 'en-US' -> 'en'
    const siteLanguage = new Intl.Locale(site.locale).language

    // The shop currency, e.g. 'USD'
    const shopCurrency = commerce.currency

    // A price in the shop currency: "$20", or "$19.50" when it has decimals
    function formatPrice(amount) {
        return formatMoney(amount, { currency: shopCurrency, locale: site.locale })
    }

    // ─── Categories and sizes (config/commerce.mjs) ──────

    const categoriesBySlug = new Map(commerce.categories.map(c => [c.slug, c]))
    const sizesByValue = new Map(commerce.sizes.map(s => [s.value, s]))

    // Title of a category slug; unknown slugs are returned as they are
    function categoryTitle(slug) {
        return categoriesBySlug.get(slug)?.title ?? slug
    }

    // The configured categories among `slugs` (e.g. those that have
    // products), as { slug, title } in the config order. Unknown slugs are
    // left out.
    function shopCategories(slugs) {
        const wanted = new Set(slugs ?? [])
        return commerce.categories.filter(c => wanted.has(c.slug))
    }

    // Display name of a size value ('M' -> 'M', or its label if set)
    function sizeLabel(value) {
        return sizesByValue.get(value)?.label ?? value
    }

    // True for the size marked oneSize (e.g. 'One size' for accessories)
    function isOneSize(value) {
        return sizesByValue.get(value)?.oneSize === true
    }

    // "Size M", or just "One size" for the one-size option
    function sizeText(value, prefix = 'Size') {
        return isOneSize(value) ? sizeLabel(value) : `${prefix} ${sizeLabel(value)}`
    }

    // ─── Links ───────────────────────────────────────────

    // "Write to me" links: the contact section on the homepage, or an
    // email link if the homepage has no contact section.
    const contactSection = homepage.find(s => s.type === 'contact')
    const contactHref = contactSection ? `/#${contactSection.id}` : `mailto:${site.contact.email}`

    return {
        shopText, pageMetadata, pageBanner, siteLanguage, shopCurrency, formatPrice,
        categoryTitle, shopCategories, sizeLabel, isOneSize, sizeText, contactHref,
    }
}

// The helpers for this shop
export const {
    shopText, pageMetadata, pageBanner, siteLanguage, shopCurrency, formatPrice,
    categoryTitle, shopCategories, sizeLabel, isOneSize, sizeText, contactHref,
} = createShopHelpers({ site: siteConfig, commerce: commerceConfig, pages: pagesConfig, homepage: homepageSections })

// Email "From" header: 'Selva Studio <hello@example.com>'. Names with
// special characters (e.g. 'Selva Studio, Inc.') are quoted, as email
// headers require.
export function emailFrom({ name, address }) {
    const displayName = /[()<>[\]:;@\\,."]/.test(name) ? `"${name.replace(/(["\\])/g, '\\$1')}"` : name
    return `${displayName} <${address}>`
}

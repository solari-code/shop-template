// Checks the shop config (config/*.mjs).
//
// validateConfig(config, options) returns { errors, warnings, placeholders },
// each a list of { path, message }:
// - errors:       the shop would break or show wrong data; the build stops
// - warnings:     probably a mistake, but the shop works
// - placeholders: example values of the template that are still set
//                 (warned about in live mode)
//
// Pure function without file or env access, so it runs the same in
// next.config.mjs, on the server, in `npm run check-config` and in tests.
// options:
// - fileExists(publicPath): checks image paths, e.g. '/images/a.jpg'
// - localProducts: the example products (data/products.js), checked
//   against the categories and sizes

import { TEXT_PLACEHOLDERS, placeholdersIn } from './text.mjs'
import { currencyInfo, fitsCurrency, UNSUPPORTED_CURRENCIES } from './money.mjs'
import { featureOfHref } from './features.mjs'
import { COLOR_MODES, MODE_DEFAULTS, MODE_SWITCHES, colorModes, contrastRatio } from './theme.mjs'

export const SOCIAL_TYPES = ['instagram', 'facebook', 'tiktok', 'pinterest', 'youtube']
export const FONT_NAMES = ['inter', 'fraunces', 'lora', 'bagel-fat-one']
export const THEME_COLORS = [
    'base-100', 'base-200', 'base-300', 'content', 'primary', 'neutral',
    'surface', 'content-inverse', 'content-soft', 'content-muted', 'content-subtle', 'on-image', 'badge', 'badge-text',
]
export const EMAIL_COLORS = ['background', 'card', 'text', 'muted', 'light', 'border', 'borderLight']

// Text colours and the backgrounds they are used on, with where. Checked in
// each palette the shop can show: a contrast below MIN_CONTRAST is a
// warning.
export const CONTRAST_PAIRS = [
    { text: 'content', background: 'base-100', use: 'text on the page' },
    { text: 'content', background: 'base-200', use: 'text on sections, the side menu and form fields' },
    { text: 'content', background: 'surface', use: 'the header' },
    { text: 'content-inverse', background: 'content', use: 'text on dark buttons' },
    { text: 'content-inverse', background: 'primary', use: 'text on brand-coloured buttons' },
    { text: 'content-soft', background: 'base-100', use: 'body text on the legal pages' },
    { text: 'content-soft', background: 'base-200', use: 'body text in the About section' },
    { text: 'content-muted', background: 'base-100', use: 'labels and small headings' },
    { text: 'content-muted', background: 'base-200', use: 'labels and small headings' },
    { text: 'content-subtle', background: 'base-100', use: 'hints' },
    { text: 'content-subtle', background: 'base-200', use: 'placeholders in form fields' },
    { text: 'on-image', background: 'neutral', use: 'text on the footer' },
    { text: 'badge-text', background: 'badge', use: 'the item count on the cart icon' },
]
// WCAG AA for normal text. All these texts are small or normal sized.
export const MIN_CONTRAST = 4.5
export const STRIPE_MAX_SHIPPING_OPTIONS = 5
// Logos of the header, and the mode they are shown in
const MODE_LOGOS = { lightMode: 'light', darkMode: 'dark' }

// Countries Stripe Checkout can't ship to (allowed_countries rejects them)
const STRIPE_UNSUPPORTED_COUNTRIES = ['AS', 'CX', 'CC', 'CU', 'HM', 'IR', 'KP', 'MH', 'FM', 'NF', 'MP', 'PW', 'SD', 'SY', 'UM', 'VI']
// Two-letter codes that are not countries
const NOT_COUNTRIES = ['EU', 'EZ', 'UN', 'ZZ', 'QO', 'XA', 'XB']

// Pages of the shop, for checking internal links
const SHOP_ROUTES = ['/', '/products', '/cart', '/wishlist', '/privacy-policy', '/terms', '/checkout/success']

// Homepage section types and their settings (required / optional)
export const SECTION_TYPES = {
    hero: { required: ['image'], optional: [] },
    slider: { required: ['images'], optional: ['eyebrow', 'heading', 'link', 'imageAlt'] },
    about: { required: ['heading', 'text', 'image'], optional: ['eyebrow', 'imageAlt'] },
    contact: { required: ['heading'], optional: ['eyebrow', 'text', 'messagePlaceholder', 'whatsappLabel', 'whatsappMessage'] },
}

// Pages in config/pages.mjs and their settings. `feature`: the page is
// only required when that feature is on.
const PAGES = {
    products: { required: ['title', 'banner'], optional: ['description'] },
    cart: { required: ['title', 'banner'], optional: ['description'] },
    wishlist: { required: ['title', 'banner'], optional: ['description'], feature: 'wishlist' },
    checkoutSuccess: { required: ['banner'], optional: [] },
    privacy: { required: ['title', 'banner'], optional: ['description'] },
    terms: { required: ['title', 'banner'], optional: ['description'] },
}

// config/texts.mjs: key -> extra placeholders (besides TEXT_PLACEHOLDERS),
// or a nested object of the same shape
const TEXTS = {
    contactLink: [],
    sizeHelp: [],
    wishlist: {
        save: [], remove: [], headerLink: [], empty: [], emptyLink: [],
        moveToCart: [], movedToCart: ['productTitle'], viewCart: [], unavailable: [],
    },
    orderSuccess: { heading: [], text: [], questions: [] },
    themeSwitcher: { toDark: [], toLight: [] },
    contactForm: { sent: [], missingFields: [], failed: [] },
    orderConfirmationEmail: { subject: [], heading: [], greeting: ['customerName'], closing: [] },
    emailSignature: [],
    emailFooter: [],
}

// Text groups that are only required when their feature is on
const FEATURE_TEXTS = { wishlist: 'wishlist', themeSwitcher: 'themeSwitcher' }

// config/wishlist.mjs: settings that are true or false, and the largest
// maxItems (keeps the browser storage and the product lookup small)
export const WISHLIST_SWITCHES = ['enabled', 'showInHeader', 'showOnProductCards', 'showOnProductPage', 'removeAfterMoveToCart']
export const WISHLIST_MAX_ITEMS_LIMIT = 500

const EXAMPLE_DOMAINS = ['example.com', 'example.org', 'example.net']

export function validateConfig(config, { fileExists, localProducts } = {}) {
    const result = { errors: [], warnings: [], placeholders: [] }
    const c = checker(result, fileExists)

    if (!c.object(config, 'config', ['site', 'commerce', 'shipping', 'theme', 'homepage', 'pages', 'navigation', 'footer', 'texts', 'wishlist'])) {
        return result
    }

    // Features that are on; pages, texts and links of features that are
    // off are not required
    const features = {
        wishlist: checkWishlist(c, config.wishlist),
        themeSwitcher: config.theme?.mode?.switcher === true,
    }

    // Light and/or dark: which palettes and logos are needed
    const modes = colorModes(config.theme?.mode)

    checkSite(c, config.site, modes)
    const currency = checkCommerce(c, config.commerce)
    checkShipping(c, config.shipping, currency)
    checkTheme(c, config.theme, modes)
    const sectionIds = checkHomepage(c, config.homepage, features)
    checkPages(c, config.pages, features)
    checkNavigation(c, config.navigation, sectionIds, features)
    if (c.object(config.footer, 'footer', ['backgroundImage'])) {
        c.image(config.footer.backgroundImage, 'footer.backgroundImage')
    }
    checkTexts(c, config.texts, TEXTS, 'texts', optionalKeys(FEATURE_TEXTS, features))

    if (localProducts) {
        result.warnings.push(...validateLocalProducts(localProducts, config.commerce, currency).warnings)
    }

    return result
}

// Warnings the shop prints when it starts, besides the missing env keys
// (lib/shopMode.js). Config errors have stopped the start already
// (next.config.mjs), so this is only about:
// - live mode: example values that are still set
// - local mode: example products with unknown categories or sizes
export function startupWarnings(config, mode, { localProducts } = {}) {
    if (mode === 'live') {
        return validateConfig(config).placeholders
            .map(({ path, message }) => `${path} still has an example value: ${message}`)
    }
    if (localProducts) {
        return validateLocalProducts(localProducts, config.commerce)
            .warnings.map(({ path, message }) => `${path} ${message}`)
    }
    return []
}

// ─── Sections ─────────────────────────────────────────────

function checkSite(c, site, modes) {
    const path = 'site'
    if (!c.object(site, path, ['name', 'shortName', 'tagline', 'description', 'url', 'locale', 'owner', 'contact', 'social', 'logos', 'emailSender'])) return

    c.text(site.name, `${path}.name`)
    if (c.text(site.shortName, `${path}.shortName`) && site.shortName.length > 12) {
        c.warn(`${path}.shortName`, `"${site.shortName}" is longer than 12 characters and may be cut off on phone home screens.`)
    }
    c.text(site.tagline, `${path}.tagline`)
    c.text(site.description, `${path}.description`)

    if (c.url(site.url, `${path}.url`)) {
        if (site.url.endsWith('/')) c.error(`${path}.url`, 'Leave out the trailing slash, e.g. "https://myshop.com".')
        const host = new URL(site.url).hostname
        if (EXAMPLE_DOMAINS.includes(host) || host === 'localhost') {
            c.placeholder(`${path}.url`, `"${site.url}" is the example URL. Set the public URL of the shop.`)
        }
    }

    if (c.string(site.locale, `${path}.locale`)) {
        try {
            const [canonical] = Intl.getCanonicalLocales(site.locale)
            if (!Intl.NumberFormat.supportedLocalesOf([canonical]).length) {
                c.warn(`${path}.locale`, `"${site.locale}" is not supported by this Node.js version; prices may be formatted in another language.`)
            }
        } catch {
            c.error(`${path}.locale`, `"${site.locale}" is not a valid locale. Use a code like "en-US" or "de-DE".`)
        }
    }

    if (c.object(site.owner, `${path}.owner`, ['name', 'firstName'])) {
        c.text(site.owner.name, `${path}.owner.name`)
        c.text(site.owner.firstName, `${path}.owner.firstName`)
    }

    if (c.object(site.contact, `${path}.contact`, ['email', 'phone', 'whatsapp'], ['email'])) {
        const contact = site.contact
        c.email(contact.email, `${path}.contact.email`)
        if (contact.phone !== undefined && c.string(contact.phone, `${path}.contact.phone`, { allowEmpty: true }) && isZeros(contact.phone)) {
            c.placeholder(`${path}.contact.phone`, `"${contact.phone}" is the example number. Set your number or leave it empty.`)
        }
        if (contact.whatsapp !== undefined && c.string(contact.whatsapp, `${path}.contact.whatsapp`, { allowEmpty: true }) && contact.whatsapp) {
            if (!/^[1-9]\d{6,14}$/.test(contact.whatsapp)) {
                c.error(`${path}.contact.whatsapp`, `"${contact.whatsapp}" must be an international number with digits only (no +, spaces or leading zeros), e.g. "4915112345678".`)
            } else if (isZeros(contact.whatsapp)) {
                c.placeholder(`${path}.contact.whatsapp`, `"${contact.whatsapp}" is the example number. Set your number or leave it empty to hide the WhatsApp button.`)
            }
        }
    }

    if (c.array(site.social, `${path}.social`, { allowEmpty: true })) {
        site.social.forEach((link, i) => {
            const p = `${path}.social[${i}]`
            if (!c.object(link, p, ['type', 'url'])) return
            if (!SOCIAL_TYPES.includes(link.type)) {
                c.error(`${p}.type`, `"${link.type}" is not supported. Use one of: ${SOCIAL_TYPES.join(', ')}.`)
            }
            if (c.url(link.url, `${p}.url`) && ['', '/'].includes(new URL(link.url).pathname)) {
                c.placeholder(`${p}.url`, `"${link.url}" links to the ${link.type} home page, not to your profile.`)
            }
        })
    }

    // The header logos are only needed for the modes the shop can show
    const logos = ['lightMode', 'darkMode', 'onImage', 'openGraph']
    const requiredLogos = logos.filter(key => !MODE_LOGOS[key] || modes.includes(MODE_LOGOS[key]))
    if (c.object(site.logos, `${path}.logos`, logos, requiredLogos)) {
        for (const key of logos) {
            if (site.logos[key] !== undefined) c.image(site.logos[key], `${path}.logos.${key}`)
        }
    }

    if (c.object(site.emailSender, `${path}.emailSender`, ['name', 'address'])) {
        if (c.string(site.emailSender.name, `${path}.emailSender.name`) && /[<>"\r\n]/.test(site.emailSender.name)) {
            c.error(`${path}.emailSender.name`, 'Must not contain <, >, " or line breaks.')
        }
        c.email(site.emailSender.address, `${path}.emailSender.address`)
    }
}

// Returns the currency code if it is valid, for the amount checks
function checkCommerce(c, commerce) {
    const path = 'commerce'
    if (!c.object(commerce, path, ['currency', 'categories', 'sizes'])) return null

    let currency = null
    if (c.string(commerce.currency, `${path}.currency`)) {
        if (!/^[A-Z]{3}$/.test(commerce.currency) || !Intl.supportedValuesOf('currency').includes(commerce.currency)) {
            c.error(`${path}.currency`, `"${commerce.currency}" is not a valid currency code. Use an ISO 4217 code in capitals, e.g. "USD", "EUR", "GBP".`)
        } else if (UNSUPPORTED_CURRENCIES[commerce.currency]) {
            c.error(`${path}.currency`, UNSUPPORTED_CURRENCIES[commerce.currency])
        } else {
            currency = commerce.currency
        }
    }

    if (c.array(commerce.categories, `${path}.categories`)) {
        const slugs = new Set()
        commerce.categories.forEach((category, i) => {
            const p = `${path}.categories[${i}]`
            if (!c.object(category, p, ['slug', 'title'])) return
            if (c.string(category.slug, `${p}.slug`)) {
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug)) {
                    c.error(`${p}.slug`, `"${category.slug}" may only contain lowercase letters, digits and single dashes, e.g. "t-shirts".`)
                } else if (slugs.has(category.slug)) {
                    c.error(`${p}.slug`, `"${category.slug}" is used more than once.`)
                }
                slugs.add(category.slug)
            }
            c.string(category.title, `${p}.title`)
        })
    }

    if (c.array(commerce.sizes, `${path}.sizes`)) {
        const values = new Set()
        let oneSizeCount = 0
        commerce.sizes.forEach((size, i) => {
            const p = `${path}.sizes[${i}]`
            if (!c.object(size, p, ['value', 'label', 'oneSize'], ['value'])) return
            if (c.string(size.value, `${p}.value`)) {
                if (values.has(size.value)) c.error(`${p}.value`, `"${size.value}" is used more than once.`)
                values.add(size.value)
            }
            if (size.label !== undefined) c.string(size.label, `${p}.label`)
            if (size.oneSize !== undefined && typeof size.oneSize !== 'boolean') c.error(`${p}.oneSize`, 'Must be true or false.')
            if (size.oneSize === true) oneSizeCount++
        })
        if (oneSizeCount > 1) c.error(`${path}.sizes`, 'Only one size can be marked as oneSize.')
    }

    return currency
}

function checkShipping(c, shipping, currency) {
    const path = 'shipping'
    if (!c.object(shipping, path, ['options', 'countries'])) return

    if (c.array(shipping.options, `${path}.options`)) {
        if (shipping.options.length > STRIPE_MAX_SHIPPING_OPTIONS) {
            c.error(`${path}.options`, `Stripe Checkout allows at most ${STRIPE_MAX_SHIPPING_OPTIONS} shipping options (found ${shipping.options.length}).`)
        }
        const ids = new Set()
        shipping.options.forEach((option, i) => {
            const p = `${path}.options[${i}]`
            if (!c.object(option, p, ['id', 'name', 'amount', 'deliveryDays'])) return
            if (c.string(option.id, `${p}.id`)) {
                if (!/^[a-z0-9_-]+$/i.test(option.id)) c.error(`${p}.id`, `"${option.id}" may only contain letters, digits, dashes and underscores.`)
                else if (ids.has(option.id)) c.error(`${p}.id`, `"${option.id}" is used more than once.`)
                ids.add(option.id)
            }
            c.string(option.name, `${p}.name`)
            c.amount(option.amount, `${p}.amount`, currency)
            if (c.object(option.deliveryDays, `${p}.deliveryDays`, ['min', 'max'])) {
                const { min, max } = option.deliveryDays
                const minOk = c.positiveInteger(min, `${p}.deliveryDays.min`)
                const maxOk = c.positiveInteger(max, `${p}.deliveryDays.max`)
                if (minOk && maxOk && min > max) c.error(`${p}.deliveryDays`, `min (${min}) is larger than max (${max}).`)
            }
        })
    }

    if (c.array(shipping.countries, `${path}.countries`)) {
        const names = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })
        const seen = new Set()
        shipping.countries.forEach((code, i) => {
            const p = `${path}.countries[${i}]`
            if (!c.string(code, p)) return
            if (!/^[A-Z]{2}$/.test(code) || NOT_COUNTRIES.includes(code) || !names.of(code)) {
                c.error(p, `"${code}" is not a country code. Use ISO 3166-1 alpha-2 codes in capitals, e.g. "US", "DE".`)
            } else if (STRIPE_UNSUPPORTED_COUNTRIES.includes(code)) {
                c.error(p, `Stripe Checkout can't ship to ${names.of(code)} (${code}).`)
            } else if (seen.has(code)) {
                c.error(p, `"${code}" is listed more than once.`)
            }
            seen.add(code)
        })
    }
}

// modes: the palettes the shop can show (from theme.mode)
function checkTheme(c, theme, modes) {
    const path = 'theme'
    if (!c.object(theme, path, ['colors', 'fonts', 'overlays', 'email', 'mode'])) return

    checkThemeMode(c, theme.mode, `${path}.mode`)
    checkThemeColors(c, theme.colors, `${path}.colors`, modes)
    if (c.object(theme.fonts, `${path}.fonts`, ['body', 'heading'])) {
        for (const key of ['body', 'heading']) {
            if (c.string(theme.fonts[key], `${path}.fonts.${key}`) && !FONT_NAMES.includes(theme.fonts[key])) {
                c.error(`${path}.fonts.${key}`, `"${theme.fonts[key]}" is not a bundled font. Use one of: ${FONT_NAMES.join(', ')}.`)
            }
        }
    }
    if (c.object(theme.overlays, `${path}.overlays`, ['hero', 'banner', 'footer'])) {
        for (const key of ['hero', 'banner', 'footer']) {
            const value = theme.overlays[key]
            if (!(typeof value === 'number' && value >= 0 && value <= 100)) {
                c.error(`${path}.overlays.${key}`, 'Must be a number from 0 to 100.')
            }
        }
    }
    if (c.object(theme.email, `${path}.email`, EMAIL_COLORS)) {
        for (const key of EMAIL_COLORS) c.color(theme.email[key], `${path}.email.${key}`)
    }
}

function checkThemeMode(c, mode, path) {
    if (!c.object(mode, path, ['default', ...MODE_SWITCHES])) return
    if (c.string(mode.default, `${path}.default`) && !MODE_DEFAULTS.includes(mode.default)) {
        c.error(`${path}.default`, `"${mode.default}" is not a mode. Use one of: ${MODE_DEFAULTS.map(m => `"${m}"`).join(', ')}.`)
    }
    for (const key of MODE_SWITCHES) c.boolean(mode[key], `${path}.${key}`)
    const places = MODE_SWITCHES.filter(key => key !== 'switcher')
    if (mode.switcher === true && places.every(key => mode[key] === false)) {
        c.warn(`${path}.switcher`, `The switcher is on but shown nowhere. Set ${places.slice(0, -1).join(', ')} or ${places.at(-1)} to true, or turn the switcher off.`)
    }
}

// Both palettes are checked when they are set; only the palettes the shop
// can show are required and checked for contrast.
function checkThemeColors(c, colors, path, modes) {
    if (!c.object(colors, path, COLOR_MODES, modes)) return
    for (const colorMode of COLOR_MODES) {
        const palette = colors[colorMode]
        const p = `${path}.${colorMode}`
        if (palette === undefined || !c.object(palette, p, THEME_COLORS)) continue
        const valid = THEME_COLORS.map(key => c.color(palette[key], `${p}.${key}`)).every(Boolean)
        if (valid && modes.includes(colorMode)) checkContrast(c, palette, p, colorMode)
    }
}

function checkContrast(c, palette, path, colorMode) {
    for (const { text, background, use } of CONTRAST_PAIRS) {
        const ratio = contrastRatio(palette[text], palette[background])
        if (ratio < MIN_CONTRAST) {
            // Rounded down, so a ratio just below the minimum doesn't show as the minimum
            const shown = Math.floor(ratio * 10) / 10
            c.warn(`${path}.${text}`, `Low contrast on ${background} in ${colorMode} mode (${shown}:1, ${use}). At least ${MIN_CONTRAST}:1 keeps it readable (WCAG AA).`)
        }
    }
}

// Returns the section ids, for checking links like '/#about'
function checkHomepage(c, sections, features) {
    const path = 'homepage'
    const ids = new Set()
    if (!c.array(sections, path, { allowEmpty: true })) return ids

    let contactSections = 0
    sections.forEach((section, i) => {
        const p = `${path}[${i}]`
        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            c.error(p, 'Must be an object like { type: "hero", id: "hero", ... }.')
            return
        }
        const spec = SECTION_TYPES[section.type]
        if (!spec) {
            c.error(`${p}.type`, `"${section.type}" is not a section type. Use one of: ${Object.keys(SECTION_TYPES).join(', ')}.`)
            return
        }
        if (!c.object(section, p, ['type', 'id', ...spec.required, ...spec.optional], ['type', 'id', ...spec.required])) return

        if (c.string(section.id, `${p}.id`)) {
            if (!/^[a-z][a-z0-9-]*$/.test(section.id)) c.error(`${p}.id`, `"${section.id}" may only contain lowercase letters, digits and dashes, starting with a letter.`)
            else if (ids.has(section.id)) c.error(`${p}.id`, `"${section.id}" is used by more than one section.`)
            ids.add(section.id)
        }

        for (const key of ['eyebrow', 'heading', 'text', 'imageAlt', 'messagePlaceholder', 'whatsappLabel', 'whatsappMessage']) {
            if (section[key] !== undefined) c.text(section[key], `${p}.${key}`)
        }
        if (section.image !== undefined) c.image(section.image, `${p}.image`)
        if (section.images !== undefined && c.array(section.images, `${p}.images`)) {
            section.images.forEach((image, j) => c.image(image, `${p}.images[${j}]`))
        }
        if (section.link !== undefined && c.object(section.link, `${p}.link`, ['label', 'href'])) {
            c.text(section.link.label, `${p}.link.label`)
            c.string(section.link.href, `${p}.link.href`)
        }
        if (section.type === 'contact') contactSections++
    })
    if (contactSections > 1) c.error(path, 'Only one contact section is possible (the form can only be on the page once).')

    // Links inside sections can point to other sections
    sections.forEach((section, i) => {
        if (typeof section?.link?.href === 'string') c.href(section.link.href, `${path}[${i}].link.href`, { sectionIds: ids, features })
    })
    return ids
}

function checkPages(c, pages, features) {
    const path = 'pages'
    const optional = Object.keys(PAGES).filter(key => PAGES[key].feature && !features[PAGES[key].feature])
    const required = Object.keys(PAGES).filter(key => !optional.includes(key))
    if (!c.object(pages, path, Object.keys(PAGES), required)) return

    for (const [key, spec] of Object.entries(PAGES)) {
        const page = pages[key]
        const p = `${path}.${key}`
        if (page === undefined && optional.includes(key)) continue
        if (!c.object(page, p, [...spec.required, ...spec.optional], spec.required)) continue
        if (page.title !== undefined) c.text(page.title, `${p}.title`)
        if (page.description !== undefined) c.text(page.description, `${p}.description`)
        if (c.object(page.banner, `${p}.banner`, ['title', 'image'])) {
            c.text(page.banner.title, `${p}.banner.title`)
            c.image(page.banner.image, `${p}.banner.image`)
        }
    }
}

function checkNavigation(c, navigation, sectionIds, features) {
    const path = 'navigation'
    if (!c.array(navigation, path, { allowEmpty: true })) return
    navigation.forEach((item, i) => {
        const p = `${path}[${i}]`
        if (!c.object(item, p, ['label', 'href', 'showCategories'], ['label', 'href'])) return
        c.text(item.label, `${p}.label`)
        if (c.string(item.href, `${p}.href`)) c.href(item.href, `${p}.href`, { sectionIds, features, menu: true })
        if (item.showCategories !== undefined && typeof item.showCategories !== 'boolean') {
            c.error(`${p}.showCategories`, 'Must be true or false.')
        }
    })
}

// Returns true if the wishlist is on
function checkWishlist(c, wishlist) {
    const path = 'wishlist'
    if (!c.object(wishlist, path, [...WISHLIST_SWITCHES, 'maxItems'])) return false
    for (const key of WISHLIST_SWITCHES) c.boolean(wishlist[key], `${path}.${key}`)
    if (wishlist.maxItems !== undefined && c.positiveInteger(wishlist.maxItems, `${path}.maxItems`) && wishlist.maxItems > WISHLIST_MAX_ITEMS_LIMIT) {
        c.error(`${path}.maxItems`, `Must be at most ${WISHLIST_MAX_ITEMS_LIMIT}.`)
    }
    return wishlist.enabled === true
}

// Keys of `spec` ({ key: feature }) whose feature is off
function optionalKeys(spec, features) {
    return Object.keys(spec).filter(key => !features[spec[key]])
}

// optional: top-level keys that may be left out (texts of features that are off)
function checkTexts(c, texts, spec, path, optional = []) {
    const required = Object.keys(spec).filter(key => !optional.includes(key))
    if (!c.object(texts, path, Object.keys(spec), required)) return
    for (const [key, extra] of Object.entries(spec)) {
        if (texts[key] === undefined && optional.includes(key)) continue
        if (Array.isArray(extra)) c.text(texts[key], `${path}.${key}`, extra)
        else checkTexts(c, texts[key], extra, `${path}.${key}`)
    }
}

// The example products (local mode) should only use configured categories
// and sizes; otherwise they are hidden from the menu or shown unlabelled.
// Returns { warnings }.
export function validateLocalProducts(products, commerce, currency = validCurrency(commerce?.currency)) {
    const result = { errors: [], warnings: [], placeholders: [] }
    const c = checker(result)
    const slugs = new Set((commerce?.categories ?? []).map(cat => cat?.slug))
    const sizes = new Set((commerce?.sizes ?? []).map(size => size?.value))
    for (const product of products ?? []) {
        const p = `data/products.js "${product?.title ?? product?._id}"`
        for (const category of product?.categories ?? []) {
            if (!slugs.has(category)) c.warn(p, `uses the category "${category}", which is not in commerce.categories.`)
        }
        for (const variant of product?.variants ?? []) {
            if (!sizes.has(variant?.size)) c.warn(p, `uses the size "${variant?.size}", which is not in commerce.sizes.`)
        }
        for (const key of ['price', 'discountedPrice']) {
            const value = product?.[key]
            if (value !== undefined && value !== null && currency && !fitsCurrency(value, currency)) {
                c.warn(p, `${key} ${value} has more decimals than ${currency} allows.`)
            }
        }
    }
    return { warnings: result.warnings }
}

// ─── Helpers ──────────────────────────────────────────────

function isZeros(value) {
    // Example numbers like "+1 000 000 0000" or "10000000000"
    const digits = String(value).replace(/\D/g, '')
    return digits !== '' && /^1?0+$/.test(digits)
}

function validCurrency(code) {
    return typeof code === 'string' && Intl.supportedValuesOf('currency').includes(code) && !UNSUPPORTED_CURRENCIES[code] ? code : null
}

function checker(result, fileExists) {
    const c = {
        error: (path, message) => result.errors.push({ path, message }),
        warn: (path, message) => result.warnings.push({ path, message }),
        placeholder: (path, message) => result.placeholders.push({ path, message }),

        // Checks that value is an object without unknown keys (typos would
        // otherwise be ignored silently) and with all required keys.
        object(value, path, allowed, required = allowed) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                c.error(path, value === undefined ? 'Missing.' : 'Must be an object ({ ... }).')
                return false
            }
            for (const key of Object.keys(value)) {
                if (!allowed.includes(key)) c.error(`${path}.${key}`, `Unknown setting. Check the spelling; allowed here: ${allowed.join(', ')}.`)
            }
            for (const key of required) {
                if (value[key] === undefined) c.error(`${path}.${key}`, 'Missing.')
            }
            return true
        },
        array(value, path, { allowEmpty = false } = {}) {
            if (!Array.isArray(value)) {
                c.error(path, value === undefined ? 'Missing.' : 'Must be a list ([ ... ]).')
                return false
            }
            if (!allowEmpty && value.length === 0) {
                c.error(path, 'Must not be empty.')
                return false
            }
            return true
        },
        string(value, path, { allowEmpty = false } = {}) {
            if (value === undefined) return false // reported by object()
            if (typeof value !== 'string') {
                c.error(path, 'Must be a text in quotes.')
                return false
            }
            if (!allowEmpty && value.trim() === '') {
                c.error(path, 'Must not be empty.')
                return false
            }
            return true
        },
        // A text that can contain placeholders like {shopName}
        text(value, path, extraPlaceholders = []) {
            if (!c.string(value, path)) return false
            const allowed = [...TEXT_PLACEHOLDERS, ...extraPlaceholders]
            for (const name of placeholdersIn(value)) {
                if (!allowed.includes(name)) {
                    c.error(path, `Unknown placeholder {${name}}. Available here: ${allowed.map(n => `{${n}}`).join(', ')}.`)
                }
            }
            return true
        },
        url(value, path) {
            if (!c.string(value, path)) return false
            let url
            try {
                url = new URL(value)
            } catch {
                url = null
            }
            if (!url || !['http:', 'https:'].includes(url.protocol)) {
                c.error(path, `"${value}" is not a valid web address. Start it with https://.`)
                return false
            }
            return true
        },
        email(value, path) {
            if (!c.string(value, path)) return false
            if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)) {
                c.error(path, `"${value}" is not a valid email address.`)
                return false
            }
            if (EXAMPLE_DOMAINS.includes(value.split('@')[1].toLowerCase())) {
                c.placeholder(path, `"${value}" is an example address.`)
            }
            return true
        },
        color(value, path) {
            if (!c.string(value, path)) return false
            if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
                c.error(path, `"${value}" is not a hex colour like "#1c1917".`)
                return false
            }
            return true
        },
        image(value, path) {
            if (!c.string(value, path)) return false
            if (!value.startsWith('/') || value.includes('..')) {
                c.error(path, `"${value}" must be a path in /public, starting with "/", e.g. "/images/hero.jpg".`)
                return false
            }
            if (fileExists && !fileExists(value)) {
                c.error(path, `File not found: public${value}`)
                return false
            }
            return true
        },
        amount(value, path, currency) {
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
                c.error(path, 'Must be a number of 0 or more (without quotes).')
                return false
            }
            if (currency && !fitsCurrency(value, currency)) {
                c.error(path, `${value} has more decimals than ${currency} allows (${currencyInfo(currency).decimals}).`)
                return false
            }
            return true
        },
        boolean(value, path) {
            if (value === undefined) return false // reported by object()
            if (typeof value !== 'boolean') {
                c.error(path, 'Must be true or false (without quotes).')
                return false
            }
            return true
        },
        positiveInteger(value, path) {
            if (!Number.isInteger(value) || value < 1) {
                c.error(path, 'Must be a whole number of 1 or more.')
                return false
            }
            return true
        },
        // Links: pages ('/products'), homepage sections ('/#about'),
        // external links (https://, mailto:, tel:).
        // features: the features that are on; menu: a link in the side
        // menu, which hides links to pages of features that are off.
        href(value, path, { sectionIds, features = {}, menu = false }) {
            if (/^(https?:\/\/|mailto:|tel:)/.test(value)) return true
            if (!value.startsWith('/')) {
                c.error(path, `"${value}" must start with "/" (a page of the shop) or be a full link (https://...).`)
                return false
            }
            const [route, anchor] = value.split('#')
            if (anchor !== undefined) {
                if (route !== '/') {
                    c.warn(path, `"${value}": section links are only checked on the homepage ("/#id").`)
                } else if (!sectionIds.has(anchor)) {
                    c.error(path, `"${value}" links to a homepage section "${anchor}" that doesn't exist. Sections: ${[...sectionIds].join(', ') || 'none'}.`)
                    return false
                }
                return true
            }
            const pathname = route.split('?')[0]
            const feature = featureOfHref(pathname)
            if (feature && !features[feature]) {
                if (menu) {
                    c.warn(path, `"${value}" is hidden from the menu because ${feature}.enabled is false.`)
                } else {
                    c.error(path, `"${value}" leads to a page that doesn't exist, because ${feature}.enabled is false. Change the link or turn the feature on.`)
                    return false
                }
            } else if (!SHOP_ROUTES.includes(pathname) && !pathname.startsWith('/products/')) {
                c.warn(path, `"${value}" is not a page of the shop.`)
            }
            return true
        },
    }
    return c
}

// ─── Output ───────────────────────────────────────────────

// Readable report for the console
export function formatIssues(issues, prefix = '  - ') {
    return issues.map(({ path, message }) => `${prefix}${path}: ${message}`).join('\n')
}

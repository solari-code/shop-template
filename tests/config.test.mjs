// Tests for the shop config check and the config helpers (lib/config).
// Run with: npm test
//
// The tests use a fixed example config (tests/fixtures/config.mjs), so they
// pass whatever a shop sets in config/. Only the first group checks this
// shop's own config: that it is valid and works with the helpers.

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import fs from 'node:fs'
import { exampleConfig } from './fixtures/config.mjs'
import { shopConfig } from '../config/index.mjs'
import { checkShopConfig, assertShopConfig, ShopConfigError } from '../lib/config/check.mjs'
import { validateConfig, validateLocalProducts, startupWarnings, SECTION_TYPES, FONT_NAMES, THEME_COLORS, CONTRAST_PAIRS, MIN_CONTRAST } from '../lib/config/validate.mjs'
import { fillText, placeholdersIn, textValues } from '../lib/config/text.mjs'
import * as shop from '../lib/config/shop.mjs'
import { themeVariables, fontVariables, hexToChannels, colorModes, defaultColorMode, contrastRatio } from '../lib/config/theme.mjs'
import { enabledFeatures, featureOfHref, isHrefAvailable } from '../lib/config/features.mjs'

// An empty folder (no public/), so image files are not checked
const NO_PUBLIC_DIR = fs.mkdtempSync(`${os.tmpdir()}/shop-config-test-`)

// Validates a changed copy of the example config. Images count as existing
// unless the test says otherwise.
function check(change, { fileExists = () => true, localProducts } = {}) {
    const config = structuredClone(exampleConfig)
    change?.(config)
    return validateConfig(config, { fileExists, localProducts })
}
const paths = (issues) => issues.map(i => i.path)

function assertError(change, path, messagePart) {
    const { errors } = check(change)
    const match = errors.find(e => e.path === path && (!messagePart || e.message.includes(messagePart)))
    assert.ok(match, `expected an error at ${path}${messagePart ? ` containing "${messagePart}"` : ''}, got:\n${JSON.stringify(errors, null, 2)}`)
}

// Helpers for the example config
const helpers = (change) => {
    const config = structuredClone(exampleConfig)
    change?.(config)
    return shop.createShopHelpers(config)
}

describe("this shop's config (config/)", () => {
    test('is valid, with all images present', () => {
        const { errors } = checkShopConfig()
        assert.deepEqual(errors, [], 'run `npm run check-config` for details')
    })

    test('assertShopConfig passes (as in next.config.mjs)', () => {
        delete process.env.__SHOP_CONFIG_CHECKED
        assert.doesNotThrow(() => assertShopConfig())
        delete process.env.__SHOP_CONFIG_CHECKED
    })

    test('works with the helpers', () => {
        for (const page of Object.keys(shopConfig.pages)) {
            const metadata = shop.pageMetadata(page)
            for (const value of Object.values(metadata)) assert.equal(typeof value, 'string')
            const banner = shop.pageBanner(page)
            assert.ok(banner.image.startsWith('/') && banner.title, page)
        }
        assert.match(shop.formatPrice(1234.5), /\d/)
        assert.equal(shop.siteLanguage, new Intl.Locale(shopConfig.site.locale).language)
        assert.deepEqual(shop.shopCategories(shopConfig.commerce.categories.map(c => c.slug)), shopConfig.commerce.categories)
        for (const size of shopConfig.commerce.sizes) assert.ok(shop.sizeText(size.value).includes(size.label ?? size.value))
        assert.match(shop.contactHref, /^(\/#[a-z][a-z0-9-]*|mailto:\S+@\S+)$/)
        for (const colorMode of colorModes(shopConfig.theme.mode)) {
            const vars = themeVariables(shopConfig.theme, colorMode)
            for (const name of THEME_COLORS) assert.match(vars[`--color-${name}-rgb`], /^\d+ \d+ \d+$/, `${colorMode} ${name}`)
        }
    })

    test('the Sanity schema offers its categories and sizes', async () => {
        // (index.js uses imports without file extensions, which only the bundlers resolve)
        const { default: product } = await import('../sanity/schemaTypes/product.js')
        const { default: variant } = await import('../sanity/schemaTypes/variant.js')
        const categoryField = product.fields.find(f => f.name === 'categories')
        const sizeField = variant.fields.find(f => f.name === 'size')
        assert.deepEqual(categoryField.options.list.map(o => o.value), shopConfig.commerce.categories.map(c => c.slug))
        assert.deepEqual(sizeField.options.list, shopConfig.commerce.sizes.map(s => ({ title: s.label ?? s.value, value: s.value })))
    })
})

describe('example config', () => {
    test('is valid', () => {
        assert.deepEqual(check().errors, [])
        assert.deepEqual(check().warnings, [])
    })

    test('lists exactly the example values of the template', () => {
        assert.deepEqual(paths(check().placeholders).sort(), [
            'site.contact.email',
            'site.contact.whatsapp',
            'site.emailSender.address',
            'site.social[0].url',
            'site.url',
        ])
    })
})

describe('errors', () => {
    test('assertShopConfig throws with a readable list', () => {
        delete process.env.__SHOP_CONFIG_CHECKED
        const config = structuredClone(exampleConfig)
        config.commerce.currency = 'usd'
        assert.throws(() => assertShopConfig({ config, root: NO_PUBLIC_DIR }), (error) =>
            error instanceof ShopConfigError && /1 error:\n {2}- commerce\.currency: "usd" is not a valid currency code/.test(error.message))
        assert.equal(process.env.__SHOP_CONFIG_CHECKED, undefined)
    })

    test('unknown and missing settings', () => {
        assertError(c => { c.site.contact.emial = 'x@y.com' }, 'site.contact.emial', 'Unknown setting')
        assertError(c => { delete c.site.name }, 'site.name', 'Missing')
        assertError(c => { c.theme.colours = {} }, 'theme.colours', 'Unknown setting')
        assertError(c => { delete c.pages.cart }, 'pages.cart', 'Missing')
        assertError(c => { c.texts.orderSuccess.heading = '' }, 'texts.orderSuccess.heading', 'empty')
    })

    test('site', () => {
        assertError(c => { c.site.url = 'https://myshop.com/' }, 'site.url', 'trailing slash')
        assertError(c => { c.site.url = 'myshop.com' }, 'site.url', 'not a valid web address')
        assertError(c => { c.site.locale = 'en_US' }, 'site.locale', 'not a valid locale')
        assertError(c => { c.site.contact.email = 'hello@' }, 'site.contact.email', 'not a valid email')
        assertError(c => { c.site.contact.whatsapp = '+49 151 1234567' }, 'site.contact.whatsapp', 'digits only')
        assertError(c => { c.site.social.push({ type: 'myspace', url: 'https://myspace.com/me' }) }, 'site.social[1].type', 'not supported')
        assertError(c => { c.site.emailSender.name = 'Shop <x>' }, 'site.emailSender.name')
        assertError(c => { c.site.logos.lightMode = 'images/logo.png' }, 'site.logos.lightMode', 'starting with "/"')
    })

    test('missing image files', () => {
        const { errors } = check(null, { fileExists: (p) => p !== '/images/hero_2.jpeg' })
        assert.deepEqual(errors, [{ path: 'pages.products.banner.image', message: 'File not found: public/images/hero_2.jpeg' }])
    })

    test('currency', () => {
        assertError(c => { c.commerce.currency = 'usd' }, 'commerce.currency')
        assertError(c => { c.commerce.currency = 'XYZ' }, 'commerce.currency')
        assert.deepEqual(check(c => { c.commerce.currency = 'EUR' }).errors, [])
    })

    test('categories', () => {
        assertError(c => { c.commerce.categories.push({ slug: 'dresses', title: 'More dresses' }) }, 'commerce.categories[7].slug', 'more than once')
        assertError(c => { c.commerce.categories[0].slug = 'T Shirts' }, 'commerce.categories[0].slug', 'lowercase')
        assertError(c => { c.commerce.categories = [] }, 'commerce.categories', 'empty')
    })

    test('sizes', () => {
        assertError(c => { c.commerce.sizes.push({ value: 'M' }) }, 'commerce.sizes[7].value', 'more than once')
        assertError(c => { c.commerce.sizes[1].oneSize = true }, 'commerce.sizes', 'Only one size')
        assertError(c => { c.commerce.sizes[1].oneSize = 'yes' }, 'commerce.sizes[1].oneSize')
        assert.deepEqual(check(c => { c.commerce.sizes[1].label = 'Extra small' }).errors, [])
    })

    test('shipping options', () => {
        const option = (id) => ({ id, name: id, amount: 5, deliveryDays: { min: 1, max: 2 } })
        assertError(c => { c.shipping.options = ['a', 'b', 'c', 'd', 'e', 'f'].map(option) }, 'shipping.options', 'at most 5')
        assertError(c => { c.shipping.options.push(option('standard')) }, 'shipping.options[2].id', 'more than once')
        assertError(c => { c.shipping.options[0].amount = -1 }, 'shipping.options[0].amount')
        assertError(c => { c.shipping.options[0].amount = '8' }, 'shipping.options[0].amount')
        assertError(c => { c.shipping.options[0].deliveryDays = { min: 5, max: 2 } }, 'shipping.options[0].deliveryDays', 'larger than max')
        assertError(c => { c.shipping.options[0].deliveryDays.min = 0 }, 'shipping.options[0].deliveryDays.min')
        // More decimals than the currency has
        assertError(c => { c.commerce.currency = 'JPY'; c.shipping.options[0].amount = 8.5 }, 'shipping.options[0].amount', 'decimals')
        assertError(c => { c.shipping.options[0].amount = 8.555 }, 'shipping.options[0].amount', 'decimals')
        assert.deepEqual(check(c => { c.shipping.options[0].amount = 8.5 }).errors, [])
    })

    test('shipping countries', () => {
        assertError(c => { c.shipping.countries = ['us'] }, 'shipping.countries[0]', 'not a country code')
        assertError(c => { c.shipping.countries = ['XX'] }, 'shipping.countries[0]', 'not a country code')
        assertError(c => { c.shipping.countries = ['EU'] }, 'shipping.countries[0]', 'not a country code')
        assertError(c => { c.shipping.countries = ['CU'] }, 'shipping.countries[0]', "Stripe Checkout can't ship")
        assertError(c => { c.shipping.countries = ['US', 'US'] }, 'shipping.countries[1]', 'more than once')
        assert.deepEqual(check(c => { c.shipping.countries = ['US', 'CA', 'DE', 'GB'] }).errors, [])
    })

    test('theme', () => {
        assertError(c => { c.theme.colors.light.primary = 'purple' }, 'theme.colors.light.primary', 'hex colour')
        assertError(c => { c.theme.colors.dark.primary = '#12345' }, 'theme.colors.dark.primary', 'hex colour')
        assertError(c => { delete c.theme.colors.dark.badge }, 'theme.colors.dark.badge', 'Missing')
        assertError(c => { c.theme.colors.dim = {} }, 'theme.colors.dim', 'Unknown setting')
        assertError(c => { c.theme.fonts.heading = 'comic-sans' }, 'theme.fonts.heading', 'not a bundled font')
        assertError(c => { c.theme.overlays.hero = 120 }, 'theme.overlays.hero')
        assertError(c => { delete c.theme.email.muted }, 'theme.email.muted', 'Missing')
    })

    test('theme: the colours are set per mode', () => {
        assertError(c => { c.theme.colors = c.theme.colors.light }, 'theme.colors.base-100', 'Unknown setting')
        assertError(c => { c.theme.colors = c.theme.colors.light }, 'theme.colors.light', 'Missing')
    })

    test('theme mode', () => {
        assertError(c => { c.theme.mode.default = 'auto' }, 'theme.mode.default', 'not a mode')
        assertError(c => { c.theme.mode.switcher = 'yes' }, 'theme.mode.switcher', 'true or false')
        assertError(c => { delete c.theme.mode.showInMenu }, 'theme.mode.showInMenu', 'Missing')
        assertError(c => { c.theme.mode.showInFooter = 'no' }, 'theme.mode.showInFooter', 'true or false')
        assertError(c => { c.theme.mode.position = 'top' }, 'theme.mode.position', 'Unknown setting')
        assertError(c => { delete c.theme.mode }, 'theme.mode', 'Missing')
        for (const value of ['light', 'dark', 'system']) {
            assert.deepEqual(check(c => { c.theme.mode.default = value }).errors, [], value)
            assert.deepEqual(check(c => { c.theme.mode.default = value; c.theme.mode.switcher = false }).errors, [], value)
        }
    })

    test('theme mode: the switcher texts are needed while the switcher is on', () => {
        assertError(c => { delete c.texts.themeSwitcher }, 'texts.themeSwitcher', 'Missing')
        assertError(c => { c.texts.themeSwitcher.toDark = '' }, 'texts.themeSwitcher.toDark', 'empty')
        assertError(c => { c.texts.themeSwitcher.toNight = 'Night' }, 'texts.themeSwitcher.toNight', 'Unknown setting')
        assert.deepEqual(check(c => { c.theme.mode.switcher = false; delete c.texts.themeSwitcher }).errors, [])
        // Checked when set, also with the switcher off
        assertError(c => { c.theme.mode.switcher = false; c.texts.themeSwitcher.toDark = '{darkName}' }, 'texts.themeSwitcher.toDark', 'Unknown placeholder')
    })

    test('theme mode: a switcher that is shown nowhere is a warning', () => {
        const places = ['showInMenu', 'showInFooter', 'showInHeader']
        const shownOnlyIn = (place) => (c) => { for (const key of places) c.theme.mode[key] = key === place }
        const hidden = shownOnlyIn(null)
        assert.deepEqual(check(hidden).warnings, [{
            path: 'theme.mode.switcher',
            message: 'The switcher is on but shown nowhere. Set showInMenu, showInFooter or showInHeader to true, or turn the switcher off.',
        }])
        assert.deepEqual(check(c => { hidden(c); c.theme.mode.switcher = false }).warnings, [])
        // Shown in one place is enough
        for (const place of places) assert.deepEqual(check(shownOnlyIn(place)).warnings, [], place)
    })

    test('theme: only the palettes the shop can show are required', () => {
        const fixed = (mode) => (c) => { c.theme.mode.default = mode; c.theme.mode.switcher = false }
        // Fixed light mode: no dark palette and no dark mode logo needed
        assert.deepEqual(check(c => { fixed('light')(c); delete c.theme.colors.dark; delete c.site.logos.darkMode }).errors, [])
        // Fixed dark mode: no light palette needed
        assert.deepEqual(check(c => { fixed('dark')(c); delete c.theme.colors.light }).errors, [])
        assertError(c => { fixed('dark')(c); delete c.theme.colors.dark }, 'theme.colors.dark', 'Missing')
        // 'system' or a switcher can show both
        assertError(c => { c.theme.mode.switcher = false; delete c.theme.colors.dark }, 'theme.colors.dark', 'Missing')
        assertError(c => { c.theme.mode.default = 'light'; delete c.theme.colors.dark }, 'theme.colors.dark', 'Missing')
        assertError(c => { c.theme.mode.default = 'dark'; delete c.theme.colors.light }, 'theme.colors.light', 'Missing')
        // A palette that is set is checked, even when it isn't shown
        assertError(c => { fixed('light')(c); c.theme.colors.dark.content = 'white' }, 'theme.colors.dark.content', 'hex colour')
    })

    test('theme: the header logo of each mode is needed when the shop can show that mode', () => {
        assertError(c => { delete c.site.logos.darkMode }, 'site.logos.darkMode', 'Missing')
        assertError(c => { delete c.site.logos.lightMode }, 'site.logos.lightMode', 'Missing')
        assert.deepEqual(check(c => { c.theme.mode.default = 'dark'; c.theme.mode.switcher = false; delete c.site.logos.lightMode }).errors, [])
        assertError(c => { c.theme.mode.default = 'light'; c.theme.mode.switcher = false; delete c.site.logos.lightMode }, 'site.logos.lightMode', 'Missing')
        // The logo for images is needed in both modes
        assertError(c => { c.theme.mode.default = 'dark'; c.theme.mode.switcher = false; delete c.site.logos.onImage }, 'site.logos.onImage', 'Missing')
        assertError(c => { c.site.logos.light = c.site.logos.onImage }, 'site.logos.light', 'Unknown setting')
        assertError(c => { c.theme.mode.default = 'dark'; c.theme.mode.switcher = false; delete c.site.logos.darkMode }, 'site.logos.darkMode', 'Missing')
        assertError(c => { c.site.logos.darkMode = 'logo.png' }, 'site.logos.darkMode', 'starting with "/"')
        // Checked when set, even if not needed
        assertError(c => { c.theme.mode.default = 'light'; c.theme.mode.switcher = false; c.site.logos.darkMode = 'logo.png' }, 'site.logos.darkMode', 'starting with "/"')
        const { errors } = check(null, { fileExists: (p) => p !== '/images/logo/logo_white.png' })
        assert.deepEqual(errors, [{ path: 'site.logos.darkMode', message: 'File not found: public/images/logo/logo_white.png' }])
    })

    test('homepage sections', () => {
        assertError(c => { c.homepage.push({ type: 'video', id: 'video' }) }, 'homepage[4].type', 'not a section type')
        assertError(c => { c.homepage[1].id = 'hero' }, 'homepage[1].id', 'more than one section')
        assertError(c => { c.homepage[1].id = 'My Slider' }, 'homepage[1].id')
        assertError(c => { delete c.homepage[2].heading }, 'homepage[2].heading', 'Missing')
        assertError(c => { c.homepage[0].title = 'Hi' }, 'homepage[0].title', 'Unknown setting')
        assertError(c => { c.homepage.push({ ...c.homepage[3], id: 'contact-2' }) }, 'homepage', 'Only one contact section')
        assertError(c => { c.homepage[1].images = [] }, 'homepage[1].images', 'empty')
        // Sections can be removed or reordered
        assert.deepEqual(check(c => { c.homepage.reverse() }).errors, [])
    })

    test('links to pages and sections', () => {
        assertError(c => { c.navigation[2].href = '/#team' }, 'navigation[2].href', 'doesn\'t exist')
        // Removing a section breaks the menu link to it
        assertError(c => { c.homepage = c.homepage.filter(s => s.id !== 'about') }, 'navigation[2].href', 'doesn\'t exist')
        assertError(c => { c.navigation[1].href = 'products' }, 'navigation[1].href', 'must start with "/"')
        assertError(c => { c.homepage[1].link.href = '/#nowhere' }, 'homepage[1].link.href')
        const { errors, warnings } = check(c => { c.navigation.push({ label: 'Blog', href: '/blog' }, { label: 'Shop', href: 'https://example.org' }) })
        assert.deepEqual(errors, [])
        assert.deepEqual(paths(warnings), ['navigation[5].href'])
    })

    test('wishlist settings', () => {
        assertError(c => { c.wishlist.enabled = 'yes' }, 'wishlist.enabled', 'true or false')
        assertError(c => { c.wishlist.showOnProductCard = true }, 'wishlist.showOnProductCard', 'Unknown setting')
        assertError(c => { delete c.wishlist.showInHeader }, 'wishlist.showInHeader', 'Missing')
        assertError(c => { delete c.wishlist }, 'config.wishlist', 'Missing')
        assertError(c => { c.wishlist.maxItems = 0 }, 'wishlist.maxItems', 'whole number')
        assertError(c => { c.wishlist.maxItems = 12.5 }, 'wishlist.maxItems', 'whole number')
        assertError(c => { c.wishlist.maxItems = '50' }, 'wishlist.maxItems', 'whole number')
        assertError(c => { c.wishlist.maxItems = 501 }, 'wishlist.maxItems', 'at most 500')
        assert.deepEqual(check(c => { delete c.wishlist.maxItems }).errors, [{ path: 'wishlist.maxItems', message: 'Missing.' }])
        assert.deepEqual(check(c => { c.wishlist.maxItems = 500 }).errors, [])
        // Any combination of true and false is fine
        assert.deepEqual(check(c => { c.wishlist.showInHeader = false; c.wishlist.removeAfterMoveToCart = false }).errors, [])
    })

    test('wishlist page and texts are only required when the wishlist is on', () => {
        const withoutWishlist = (c) => { delete c.pages.wishlist; delete c.texts.wishlist }
        assertError(withoutWishlist, 'pages.wishlist', 'Missing')
        assertError(withoutWishlist, 'texts.wishlist', 'Missing')
        assertError(c => { delete c.texts.wishlist.moveToCart }, 'texts.wishlist.moveToCart', 'Missing')
        const off = check(c => { withoutWishlist(c); c.wishlist.enabled = false })
        assert.deepEqual(off.errors, [])
        assert.deepEqual(off.warnings, [])
        // When they are kept while the wishlist is off, they are still checked
        assertError(c => { c.wishlist.enabled = false; c.pages.wishlist.banner.title = '' }, 'pages.wishlist.banner.title', 'empty')
    })

    test('links to the wishlist', () => {
        const toWishlist = (c) => c.navigation.push({ label: 'Wishlist', href: '/wishlist' })
        assert.deepEqual(check(toWishlist).warnings, [])
        // Turned off: menu links are hidden (a warning), other links would lead nowhere (an error)
        const off = check(c => { toWishlist(c); c.wishlist.enabled = false })
        assert.deepEqual(off.errors, [])
        assert.deepEqual(off.warnings, [{ path: 'navigation[5].href', message: '"/wishlist" is hidden from the menu because wishlist.enabled is false.' }])
        assertError(c => { c.wishlist.enabled = false; c.homepage[1].link.href = '/wishlist' }, 'homepage[1].link.href', 'wishlist.enabled is false')
        assert.deepEqual(check(c => { c.homepage[1].link.href = '/wishlist' }).errors, [])
    })

    test('placeholders in texts', () => {
        // {productTitle} only where the text says so
        assert.deepEqual(check(c => { c.texts.wishlist.movedToCart = 'Moved {productTitle} to the cart at {shopName}' }).errors, [])
        assertError(c => { c.texts.wishlist.viewCart = 'View {productTitle}' }, 'texts.wishlist.viewCart', 'Unknown placeholder {productTitle}')
        assertError(c => { c.texts.emailFooter = '{shop} — {tagline}' }, 'texts.emailFooter', 'Unknown placeholder {shop}')
        // {customerName} only exists in the email greeting
        assertError(c => { c.texts.orderConfirmationEmail.subject = 'Thanks {customerName}' }, 'texts.orderConfirmationEmail.subject', '{customerName}')
        assertError(c => { c.pages.cart.description = 'Cart of {ownerFirstname}' }, 'pages.cart.description', 'Unknown placeholder')
        assertError(c => { c.homepage[2].text = 'I am {owner}' }, 'homepage[2].text', 'Unknown placeholder')
    })
})

describe('placeholders', () => {
    test('are gone once real values are set', () => {
        const { errors, placeholders } = check(c => {
            c.site.url = 'https://selva.studio'
            c.site.contact.email = 'hello@selva.studio'
            c.site.contact.whatsapp = '4915112345678'
            c.site.social[0].url = 'https://www.instagram.com/selvastudio'
            c.site.emailSender.address = 'shop@selva.studio'
        })
        assert.deepEqual(errors, [])
        assert.deepEqual(placeholders, [])
    })

    test('empty optional contact details are fine', () => {
        const { errors, placeholders } = check(c => {
            c.site.contact.whatsapp = ''
            delete c.site.contact.phone
            c.site.social = []
        })
        assert.deepEqual(errors, [])
        assert.deepEqual(paths(placeholders).sort(), ['site.contact.email', 'site.emailSender.address', 'site.url'])
    })

    test('example phone number', () => {
        const { placeholders } = check(c => { c.site.contact.phone = '+1 000 000 0000' })
        assert.ok(paths(placeholders).includes('site.contact.phone'))
    })
})

describe('local example products', () => {
    const product = (changes) => ({
        title: 'Test', categories: ['dresses'], price: 10,
        variants: [{ size: 'M' }], ...changes,
    })

    test('products with configured categories and sizes', () => {
        assert.deepEqual(validateLocalProducts([product(), product({ variants: [{ size: 'One size' }] })], exampleConfig.commerce).warnings, [])
    })

    test('unknown categories, sizes and prices with too many decimals', () => {
        const { warnings } = validateLocalProducts([
            product({ categories: ['hats'] }),
            product({ variants: [{ size: 'XXXL' }] }),
            product({ price: 10.5 }),
        ], { ...exampleConfig.commerce, currency: 'JPY' })
        assert.deepEqual(warnings.map(w => w.message), [
            'uses the category "hats", which is not in commerce.categories.',
            'uses the size "XXXL", which is not in commerce.sizes.',
            'price 10.5 has more decimals than JPY allows.',
        ])
    })
})

describe('startup warnings', () => {
    test('live mode: example values', () => {
        const warnings = startupWarnings(exampleConfig, 'live', { localProducts: [] })
        assert.equal(warnings.length, 5)
        assert.match(warnings[0], /^site\.url still has an example value: /)
    })

    test('local mode: only problems with the example products', () => {
        assert.deepEqual(startupWarnings(exampleConfig, 'local', { localProducts: [] }), [])
        const warnings = startupWarnings(exampleConfig, 'local', { localProducts: [{ title: 'Hat', categories: ['hats'], variants: [] }] })
        assert.deepEqual(warnings, ['data/products.js "Hat" uses the category "hats", which is not in commerce.categories.'])
    })
})

describe('text placeholders', () => {
    test('fillText replaces known placeholders and keeps unknown ones', () => {
        const values = textValues(exampleConfig.site)
        assert.equal(fillText('Thank you for your order at {shopName}! 🖤', values), 'Thank you for your order at Selva Studio! 🖤')
        assert.equal(fillText('With love — {ownerFirstName}', values), 'With love — Mara')
        assert.equal(fillText('Hi {customerName}', values), 'Hi {customerName}')
        assert.equal(fillText('Hi {customerName}', { ...values, customerName: 'Jane' }), 'Hi Jane')
    })

    test('placeholdersIn', () => {
        assert.deepEqual(placeholdersIn('{shopName} — {tagline} {}'), ['shopName', 'tagline'])
        assert.deepEqual(placeholdersIn(undefined), [])
    })
})

describe('config helpers for pages and emails', () => {
    test('page metadata with the shop name filled in', () => {
        assert.deepEqual(helpers().pageMetadata('products'), {
            title: 'Products',
            description: 'Handmade slow fashion pieces from upcycled fabrics. Selva Studio.',
        })
        // The success page has only a banner, no title or description
        assert.deepEqual(helpers().pageMetadata('checkoutSuccess'), {})
    })

    test('page banners with the shop name filled in', () => {
        assert.deepEqual(helpers().pageBanner('products'), { image: '/images/hero_2.jpeg', title: 'Products' })
        assert.deepEqual(helpers(c => { c.pages.cart.banner.title = 'Cart at {shopName}' }).pageBanner('cart'), { image: '/images/hero_6.jpeg', title: 'Cart at Selva Studio' })
    })

    test('shopText', () => {
        const { shopText } = helpers()
        assert.equal(shopText('Hi {customerName}, from {shopName}', { customerName: 'Jane' }), 'Hi Jane, from Selva Studio')
        // Values are not filled in twice (a customer name can't inject placeholders)
        assert.equal(shopText('Hi {customerName}', { customerName: '{shopName}' }), 'Hi {shopName}')
    })

    test('page language from the locale', () => {
        assert.equal(helpers().siteLanguage, 'en')
        assert.equal(helpers(c => { c.site.locale = 'de-CH' }).siteLanguage, 'de')
    })

    test('"Write to me" links go to the contact section, or to the email address without one', () => {
        assert.equal(helpers().contactHref, '/#contact')
        assert.equal(helpers(c => { c.homepage.find(s => s.type === 'contact').id = 'get-in-touch' }).contactHref, '/#get-in-touch')
        assert.equal(helpers(c => { c.homepage = c.homepage.filter(s => s.type !== 'contact') }).contactHref, 'mailto:hello@example.com')
    })

    test('email sender', () => {
        assert.equal(shop.emailFrom({ name: 'Selva Studio', address: 'hello@example.com' }), 'Selva Studio <hello@example.com>')
        assert.equal(shop.emailFrom({ name: 'Selva Studio, Inc.', address: 'a@b.co' }), '"Selva Studio, Inc." <a@b.co>')
        assert.equal(shop.emailFrom({ name: 'Dr. Mara', address: 'a@b.co' }), '"Dr. Mara" <a@b.co>')
    })
})

describe('categories and sizes', () => {
    test('categories in config order, unknown ones left out', () => {
        const { shopCategories, categoryTitle } = helpers()
        // e.g. the order in which getActiveCategories() finds them on products
        assert.deepEqual(shopCategories(['dresses', 'hats', 'accessories', 'skirts']), [
            { slug: 'accessories', title: 'Accessories' },
            { slug: 'skirts', title: 'Skirts' },
            { slug: 'dresses', title: 'Dresses' },
        ])
        assert.deepEqual(shopCategories(undefined), [])
        assert.equal(categoryTitle('corsets'), 'Corsets')
        assert.equal(categoryTitle('hats'), 'hats')
    })

    test('size labels and the one-size option', () => {
        const { sizeLabel, isOneSize, sizeText } = helpers()
        assert.equal(sizeLabel('M'), 'M')
        assert.equal(sizeLabel('XXXL'), 'XXXL')
        assert.equal(isOneSize('One size'), true)
        assert.equal(isOneSize('M'), false)
        assert.equal(sizeText('M'), 'Size M')
        assert.equal(sizeText('One size'), 'One size')
        assert.equal(sizeText('S', 'size'), 'size S')
    })

    test('labels are used for display', () => {
        const { sizeLabel, sizeText } = helpers(c => {
            c.commerce.sizes.find(s => s.value === 'M').label = 'Medium'
            c.commerce.sizes.find(s => s.oneSize).label = 'Einheitsgröße'
        })
        assert.equal(sizeLabel('M'), 'Medium')
        assert.equal(sizeText('M'), 'Size Medium')
        assert.equal(sizeText('One size'), 'Einheitsgröße')
    })
})

describe('theme', () => {
    test('CSS variables for colours (hex and RGB channels) and overlays', () => {
        const vars = themeVariables(exampleConfig.theme, 'light')
        assert.equal(vars['--color-content'], '#1c1917')
        assert.equal(vars['--color-content-rgb'], '28 25 23')
        assert.equal(vars['--color-surface-rgb'], '255 255 255')
        assert.equal(vars['--color-content-subtle-rgb'], '102 111 127')
        assert.equal(vars['--overlay-hero'], '35%')
        assert.equal(vars['--overlay-footer'], '10%')
        // Every colour, twice; three overlays
        assert.equal(Object.keys(vars).length, THEME_COLORS.length * 2 + 3)
    })

    test('CSS variables of the dark palette, with the same overlays', () => {
        const vars = themeVariables(exampleConfig.theme, 'dark')
        assert.equal(vars['--color-content'], '#f4f3f1')
        assert.equal(vars['--color-base-100-rgb'], '18 17 20')
        assert.equal(vars['--overlay-hero'], '35%')
        assert.equal(Object.keys(vars).length, THEME_COLORS.length * 2 + 3)
    })

    test('the palettes a shop can show, and the default one', () => {
        const mode = (value, switcher) => ({ default: value, switcher })
        assert.deepEqual(colorModes(mode('light', false)), ['light'])
        assert.deepEqual(colorModes(mode('dark', false)), ['dark'])
        assert.deepEqual(colorModes(mode('system', false)), ['light', 'dark'])
        assert.deepEqual(colorModes(mode('light', true)), ['light', 'dark'])
        assert.deepEqual(colorModes(mode('dark', true)), ['light', 'dark'])
        // Missing or invalid settings: both, so the check asks for both
        assert.deepEqual(colorModes(undefined), ['light', 'dark'])
        assert.deepEqual(colorModes(mode('auto', false)), ['light', 'dark'])

        assert.equal(defaultColorMode(mode('light', true)), 'light')
        assert.equal(defaultColorMode(mode('dark', false)), 'dark')
        assert.equal(defaultColorMode(mode('system', true)), 'light')
        assert.equal(defaultColorMode(undefined), 'light')
    })

    test('contrast ratio (WCAG 2)', () => {
        assert.equal(contrastRatio('#000000', '#ffffff'), 21)
        assert.equal(contrastRatio('#fff', '#000'), 21)
        assert.equal(contrastRatio('#9567f3', '#9567f3'), 1)
        assert.equal(contrastRatio('#6b7280', '#ffffff').toFixed(2), '4.83')
        assert.equal(contrastRatio('#ffffff', '#ef4444').toFixed(2), '3.76')
    })

    test('contrast pairs use theme colours', () => {
        for (const { text, background, use } of CONTRAST_PAIRS) {
            assert.ok(THEME_COLORS.includes(text) && THEME_COLORS.includes(background), `${text} on ${background}`)
            assert.ok(use)
        }
        assert.equal(MIN_CONTRAST, 4.5)
    })

    test('low contrast is a warning, in the palette where it is', () => {
        const { errors, warnings } = check(c => { c.theme.colors.dark['content-muted'] = '#3a3940' })
        assert.deepEqual(errors, [])
        assert.deepEqual(warnings, [
            { path: 'theme.colors.dark.content-muted', message: 'Low contrast on base-100 in dark mode (1.6:1, labels and small headings). At least 4.5:1 keeps it readable (WCAG AA).' },
            { path: 'theme.colors.dark.content-muted', message: 'Low contrast on base-200 in dark mode (1.5:1, labels and small headings). At least 4.5:1 keeps it readable (WCAG AA).' },
        ])
        // A background that is too close to the text
        assert.deepEqual(paths(check(c => { c.theme.colors.light.surface = '#2a2a2a' }).warnings), ['theme.colors.light.content'])
        // Just below the minimum is not shown as the minimum
        // (#ef4444: 3.76:1 with white)
        assert.match(check(c => { c.theme.colors.light.badge = '#ef4444' }).warnings[0].message, /\(3\.7:1/)
    })

    test('palettes the shop does not show are not checked for contrast', () => {
        const lowDark = (c) => { c.theme.colors.dark.content = '#121114' }
        assert.ok(check(lowDark).warnings.length > 0)
        assert.deepEqual(check(c => { lowDark(c); c.theme.mode.default = 'light'; c.theme.mode.switcher = false }).warnings, [])
    })

    test('the example themes in config/themes are valid in every mode, without contrast warnings', async () => {
        const files = fs.readdirSync(new URL('../config/themes/', import.meta.url)).filter(f => f.endsWith('.mjs'))
        assert.ok(files.length >= 3, 'three example themes')
        for (const file of files) {
            const exports = await import(`../config/themes/${file}`)
            const theme = exports[file.replace('.mjs', '')]
            assert.ok(theme, `config/themes/${file} exports ${file.replace('.mjs', '')}`)
            for (const modeDefault of ['light', 'dark', 'system']) {
                const { errors, warnings } = check(c => { c.theme = { ...structuredClone(theme), mode: { ...c.theme.mode, default: modeDefault } } })
                assert.deepEqual([...errors, ...warnings], [], `${file}, ${modeDefault}`)
            }
        }
    })

    test("this shop's theme starts from an example theme that keeps the template's look", async () => {
        const { studio } = await import('../config/themes/studio.mjs')
        assert.deepEqual(studio.colors.light, exampleConfig.theme.colors.light)
        assert.deepEqual(studio.fonts, { body: 'inter', heading: 'inter' })
    })

    test('hex colours to RGB channels', () => {
        assert.equal(hexToChannels('#ffffff'), '255 255 255')
        assert.equal(hexToChannels('#FFF'), '255 255 255')
        assert.equal(hexToChannels('#0b0809'), '11 8 9')
    })

    test('font variables point to the chosen fonts', () => {
        assert.deepEqual(fontVariables({ fonts: { body: 'inter', heading: 'fraunces' } }), {
            '--font-body': 'var(--font-inter)',
            '--font-heading': 'var(--font-fraunces)',
        })
    })

    test('every font name has its module in app/fonts', () => {
        for (const name of FONT_NAMES) {
            const file = new URL(`../app/fonts/${name}.js`, import.meta.url)
            assert.ok(fs.existsSync(file), `app/fonts/${name}.js is missing`)
            assert.match(fs.readFileSync(file, 'utf8'), new RegExp(`variable: '--font-${name}'`))
        }
        const modules = fs.readdirSync(new URL('../app/fonts/', import.meta.url)).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3))
        assert.deepEqual(modules.sort(), [...FONT_NAMES].sort())
    })
})

describe('homepage', () => {
    test('the homepage renders every section type the config check accepts', () => {
        const page = fs.readFileSync(new URL('../app/(shop)/page.js', import.meta.url), 'utf8')
        const block = page.slice(page.indexOf('const SECTIONS = {'), page.indexOf('};', page.indexOf('const SECTIONS = {')))
        const types = [...block.matchAll(/^\s+(\w+): \w+,$/gm)].map(m => m[1])
        assert.deepEqual(types.sort(), Object.keys(SECTION_TYPES).sort())
    })
})

describe('features', () => {
    test('enabled features from the config', () => {
        assert.deepEqual(enabledFeatures(exampleConfig), { wishlist: true })
        assert.deepEqual(enabledFeatures({ wishlist: { ...exampleConfig.wishlist, enabled: false } }), { wishlist: false })
        assert.deepEqual(enabledFeatures({}), { wishlist: false })
    })

    test('links to pages of features that are off are not available (the menu hides them)', () => {
        assert.equal(featureOfHref('/wishlist'), 'wishlist')
        assert.equal(featureOfHref('/wishlist?from=menu'), 'wishlist')
        assert.equal(featureOfHref('/wishlist#top'), 'wishlist')
        assert.equal(featureOfHref('/wishlists'), null)
        assert.equal(featureOfHref('/#about'), null)
        assert.equal(featureOfHref('https://example.org/wishlist'), null)
        assert.equal(isHrefAvailable('/wishlist', { wishlist: true }), true)
        assert.equal(isHrefAvailable('/wishlist', { wishlist: false }), false)
        assert.equal(isHrefAvailable('/cart', { wishlist: false }), true)
        const menu = exampleConfig.navigation.concat({ label: 'Wishlist', href: '/wishlist' })
        assert.deepEqual(menu.filter(item => isHrefAvailable(item.href, { wishlist: false })), exampleConfig.navigation)
    })
})

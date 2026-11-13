// Tests for the pre-paint script (lib/prepaint.mjs): it runs the generated
// script in a sandbox with a fake localStorage and checks the CSS it adds.
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { prepaintScript, themePrepaintScript } from '../lib/prepaint.mjs'
import { THEME_STORAGE_KEY, savedColorMode } from '../lib/theme.mjs'
import { cartItemCount } from '../lib/cart.mjs'
import { cleanWishlist } from '../lib/wishlist.mjs'

const KEYS = { cartKey: 'shop-cart', wishlistKey: 'shop-wishlist', wishlistMaxItems: 3 }

// Runs the script with these localStorage values ({ key: string }) and
// returns the CSS it added ('' if none)
function run(storage, options = KEYS) {
    const styles = []
    const element = () => ({ setAttribute() {}, textContent: '' })
    const sandbox = {
        window: { localStorage: { getItem: (key) => storage[key] ?? null } },
        document: { createElement: element, head: { appendChild: (el) => styles.push(el.textContent) } },
    }
    vm.runInNewContext(prepaintScript(options), sandbox)
    return styles.join('')
}

const saved = (items) => JSON.stringify({ state: { items }, version: 1 })
const badge = (css, name) => css.match(new RegExp(`data-count-badge="${name}"\\]:not\\(\\[data-count\\]\\)::after\\{content:"(\\d+)"\\}`))?.[1]

describe('pre-paint script', () => {
    test('adds nothing when nothing is saved', () => {
        assert.equal(run({}), '')
        assert.equal(run({ 'shop-cart': saved([]), 'shop-wishlist': saved([]) }), '')
    })

    test('cart badge: counts like the header', () => {
        const items = [{ quantity: 2 }, { quantity: 1 }, { quantity: 'x' }, null, {}]
        const css = run({ 'shop-cart': saved(items) })
        assert.equal(badge(css, 'cart'), String(cartItemCount(items)))
        assert.equal(badge(css, 'cart'), '3')
        assert.equal(badge(css, 'wishlist'), undefined)
    })

    test('wishlist badge: counts like the wishlist (valid, unique, at most maxItems)', () => {
        const items = [{ productId: 'p1' }, { productId: 'p1' }, { productId: '' }, { productId: 7 }, null, { productId: 'p2' }]
        assert.equal(badge(run({ 'shop-wishlist': saved(items) }), 'wishlist'), String(cleanWishlist(items, { maxItems: 3 }).length))
        const many = ['p1', 'p2', 'p3', 'p4', 'p5'].map(productId => ({ productId }))
        assert.equal(badge(run({ 'shop-wishlist': saved(many) }), 'wishlist'), String(cleanWishlist(many, { maxItems: 3 }).length))
        assert.equal(badge(run({ 'shop-wishlist': saved(many) }), 'wishlist'), '3')
    })

    test('fills the hearts of saved products until React renders them', () => {
        const css = run({ 'shop-wishlist': saved([{ productId: 'prod_Mq7kP2xA' }, { productId: 'prod-2' }]) })
        assert.match(css, /\[data-wishlist-id="prod_Mq7kP2xA"\]:not\(\[data-saved\]\) \.wishlist-heart-fill,\[data-wishlist-id="prod-2"\]:not\(\[data-saved\]\) \.wishlist-heart-fill\{opacity:1\}/)
    })

    test('IDs that could break the CSS are counted but get no heart rule', () => {
        const css = run({ 'shop-wishlist': saved([{ productId: 'a"]{x}' }, { productId: 'ok' }]) })
        assert.equal(badge(css, 'wishlist'), '2')
        assert.ok(!css.includes('a"]'))
        assert.match(css, /data-wishlist-id="ok"/)
    })

    test('broken or unexpected data is ignored', () => {
        assert.equal(run({ 'shop-cart': '{not json', 'shop-wishlist': 'null' }), '')
        assert.equal(run({ 'shop-cart': JSON.stringify({ state: { items: 'x' } }), 'shop-wishlist': '42' }), '')
    })

    test('no storage access (e.g. blocked cookies) does not throw', () => {
        const sandbox = { window: {}, document: {} }
        Object.defineProperty(sandbox.window, 'localStorage', { get() { throw new Error('SecurityError') } })
        assert.doesNotThrow(() => vm.runInNewContext(prepaintScript(KEYS), sandbox))
    })

    test('wishlist off: only the cart badge', () => {
        const css = run({ 'shop-cart': saved([{ quantity: 1 }]), 'shop-wishlist': saved([{ productId: 'p1' }]) }, { ...KEYS, wishlistKey: null })
        assert.equal(badge(css, 'cart'), '1')
        assert.ok(!css.includes('wishlist'))
    })

    test('the options cannot end the script tag', () => {
        assert.ok(!prepaintScript({ ...KEYS, cartKey: '</script><b>' }).includes('</script>'))
    })
})

describe('theme pre-paint script', () => {
    // Runs the script with this saved value (or a getItem that throws) and
    // returns data-theme on <html> afterwards
    function runTheme(saved, { initial = null, throws = false } = {}) {
        const attributes = initial ? { 'data-theme': initial } : {}
        const sandbox = {
            window: { localStorage: { getItem: (key) => { if (throws) throw new Error('denied'); return key === THEME_STORAGE_KEY ? saved : null } } },
            document: { documentElement: { setAttribute: (name, value) => { attributes[name] = value } } },
        }
        vm.runInNewContext(themePrepaintScript({ storageKey: THEME_STORAGE_KEY }), sandbox)
        return attributes['data-theme'] ?? null
    }

    test('applies a saved light or dark mode', () => {
        assert.equal(runTheme('dark'), 'dark')
        assert.equal(runTheme('light'), 'light')
        // Over the default mode rendered by the server
        assert.equal(runTheme('dark', { initial: 'light' }), 'dark')
    })

    test('leaves the page as it is without a valid saved choice', () => {
        for (const saved of [null, '', 'system', 'DARK', '{"state":"dark"}']) {
            assert.equal(runTheme(saved), null, String(saved))
            assert.equal(runTheme(saved, { initial: 'light' }), 'light', String(saved))
            // Accepts the same values as the app
            assert.equal(savedColorMode(saved), null)
        }
    })

    test('without storage access, nothing breaks', () => {
        assert.equal(runTheme('dark', { throws: true }), null)
    })

    test('the storage key is escaped for the <script> tag', () => {
        assert.ok(!themePrepaintScript({ storageKey: '</script><script>alert(1)//' }).includes('</script>'))
    })
})

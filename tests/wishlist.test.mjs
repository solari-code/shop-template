// Tests for the wishlist data (lib/wishlist.mjs).
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    wishlistEntry,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleInWishlist,
    setWishlistSize,
    preselectedVariant,
    refreshWishlist,
    cleanWishlist,
    cleanProductIds,
} from '../lib/wishlist.mjs'

// A product as returned by the product queries
const product = (productId, changes) => ({
    _id: `doc-${productId}`,
    productId,
    title: `Product ${productId}`,
    slug: `product-${productId}`,
    price: 100,
    discountedPrice: null,
    images: [{ _key: 'a', asset: { url: `/images/${productId}.jpg` } }, { _key: 'b' }],
    variants: [{ variantId: 'v1', size: 'M', stock: 1, active: true }],
    ...changes,
})
const T1 = '2026-03-01T10:00:00.000Z'
const T2 = '2026-03-02T10:00:00.000Z'
const ids = (items) => items.map(item => item.productId)

describe('wishlist entries', () => {
    test('keep the product ID, the chosen size and a snapshot for display, no prices or stock', () => {
        assert.deepEqual(wishlistEntry(product('p1'), { addedAt: T1, variantId: 'v1' }), {
            productId: 'p1',
            variantId: 'v1',
            slug: 'product-p1',
            title: 'Product p1',
            image: { _key: 'a', asset: { url: '/images/p1.jpg' } },
            addedAt: T1,
        })
        assert.deepEqual(wishlistEntry({ productId: 'p2' }, { addedAt: T1 }), { productId: 'p2', variantId: null, slug: null, title: null, image: null, addedAt: T1 })
    })
})

describe('adding and removing', () => {
    test('new products go to the top, saved ones keep their place', () => {
        let items = addToWishlist([], product('p1'), { addedAt: T1 })
        items = addToWishlist(items, product('p2'), { addedAt: T2 })
        assert.deepEqual(ids(items), ['p2', 'p1'])
        assert.deepEqual(items.map(item => item.addedAt), [T2, T1])
        assert.equal(addToWishlist(items, product('p1'), { addedAt: T2 }), items)
        assert.equal(isInWishlist(items, 'p1'), true)
        assert.equal(isInWishlist(items, 'p3'), false)
    })

    test('products without a product ID are not added', () => {
        assert.deepEqual(addToWishlist([], product(undefined)), [])
        assert.deepEqual(addToWishlist([], product('')), [])
        assert.deepEqual(addToWishlist([], null), [])
    })

    test('remove and toggle', () => {
        const items = [wishlistEntry(product('p2'), { addedAt: T2 }), wishlistEntry(product('p1'), { addedAt: T1 })]
        assert.deepEqual(ids(removeFromWishlist(items, 'p2')), ['p1'])
        assert.equal(removeFromWishlist(items, 'p3'), items)
        assert.deepEqual(ids(toggleInWishlist(items, product('p1'))), ['p2'])
        assert.deepEqual(ids(toggleInWishlist(items, product('p3'))), ['p3', 'p2', 'p1'])
    })

    test('keeps at most maxItems products, dropping the oldest', () => {
        let items = []
        for (const id of ['p1', 'p2', 'p3', 'p4']) items = addToWishlist(items, product(id), { maxItems: 3 })
        assert.deepEqual(ids(items), ['p4', 'p3', 'p2'])
        assert.deepEqual(ids(toggleInWishlist(items, product('p5'), { maxItems: 3 })), ['p5', 'p4', 'p3'])
        // Without a limit
        assert.equal(addToWishlist(items, product('p5')).length, 4)
    })
})

describe('remembered sizes', () => {
    test('the size chosen when saving is kept; the heart on a product card saves no size', () => {
        assert.equal(addToWishlist([], product('p1'), { variantId: 'v2' })[0].variantId, 'v2')
        assert.equal(toggleInWishlist([], product('p1'), { variantId: 'v2' })[0].variantId, 'v2')
        assert.equal(addToWishlist([], product('p1'))[0].variantId, null)
        assert.equal(addToWishlist([], product('p1'), { variantId: '' })[0].variantId, null)
    })

    test('choosing another size later updates it, for saved products only', () => {
        const items = [wishlistEntry(product('p1'), { addedAt: T1, variantId: 'v1' })]
        assert.equal(setWishlistSize(items, 'p1', 'v2')[0].variantId, 'v2')
        assert.equal(setWishlistSize(items, 'p1', null)[0].variantId, null)
        assert.equal(setWishlistSize(items, 'p1', 'v1'), items)
        assert.equal(setWishlistSize(items, 'p9', 'v2'), items)
    })

    test('refreshing the snapshots keeps the size', () => {
        const items = [wishlistEntry(product('p1'), { addedAt: T1, variantId: 'v1' })]
        assert.equal(refreshWishlist(items, [product('p1', { title: 'Renamed' })])[0].variantId, 'v1')
    })

    test('preselected on the wishlist: the remembered size if it can be bought, else the only size', () => {
        const variant = (variantId, stock, active = true) => ({ variantId, size: variantId, stock, active })
        const dress = product('p1', { variants: [variant('S', 2), variant('M', 0), variant('L', 1, false)] })
        assert.equal(preselectedVariant(dress, 'S')?.variantId, 'S')
        // Sold out, hidden, unknown or no size: nothing preselected
        assert.equal(preselectedVariant(dress, 'M'), null)
        assert.equal(preselectedVariant(dress, 'L'), null)
        assert.equal(preselectedVariant(dress, 'XL'), null)
        assert.equal(preselectedVariant(dress, null), null)
        // Only one size (e.g. one size, or the others hidden): chosen automatically
        const blouse = product('p2', { variants: [variant('S', 2, false), variant('M', 1)] })
        assert.equal(preselectedVariant(blouse, null)?.variantId, 'M')
        assert.equal(preselectedVariant(blouse, 'S')?.variantId, 'M')
        assert.equal(preselectedVariant(product('p3', { variants: [variant('M', 0)] }), null), null)
        assert.equal(preselectedVariant(product('p4', { variants: null }), null), null)
    })
})

describe('refreshing the snapshots', () => {
    test('from current product data; products not found keep their entry', () => {
        const items = [wishlistEntry(product('p1'), { addedAt: T1 }), wishlistEntry(product('p2'), { addedAt: T1 })]
        const refreshed = refreshWishlist(items, [product('p1', { title: 'Renamed', slug: 'renamed', images: null })])
        assert.deepEqual(refreshed[0], { productId: 'p1', variantId: null, slug: 'renamed', title: 'Renamed', image: null, addedAt: T1 })
        assert.equal(refreshed[1], items[1])
    })

    test('returns the same list when nothing changed', () => {
        const items = [wishlistEntry(product('p1'), { addedAt: T1 })]
        assert.equal(refreshWishlist(items, [product('p1')]), items)
        assert.equal(refreshWishlist(items, []), items)
        assert.equal(refreshWishlist(items, null), items)
    })
})

describe('data from the browser', () => {
    test('cleanWishlist drops invalid entries and duplicates', () => {
        const valid = wishlistEntry(product('p1'), { addedAt: T1 })
        assert.deepEqual(cleanWishlist([
            valid,
            { ...valid, title: 'Duplicate' },
            { productId: 42 },
            { productId: '' },
            null,
            'p9',
            { productId: 'p2', variantId: 5, title: 7, slug: ['x'], image: 'x', addedAt: 1 },
        ]), [
            valid,
            { productId: 'p2', variantId: null, slug: null, title: null, image: null, addedAt: null },
        ])
        assert.deepEqual(cleanWishlist(undefined), [])
        assert.deepEqual(cleanWishlist({ items: [] }), [])
        // The newest maxItems, e.g. after lowering maxItems in the config
        const saved = ['p1', 'p2', 'p3', 'p4'].map(productId => ({ productId }))
        assert.deepEqual(ids(cleanWishlist(saved, { maxItems: 2 })), ['p1', 'p2'])
        assert.equal(cleanWishlist(saved).length, 4)
    })

    test('cleanProductIds keeps valid, unique IDs', () => {
        assert.deepEqual(cleanProductIds(['p1', 'p2', 'p1', '', ' ', 3, null, 'x'.repeat(201)]), ['p1', 'p2'])
        assert.deepEqual(cleanProductIds('p1'), [])
        assert.deepEqual(cleanProductIds(['p1', 'p2', 'p3'], { maxItems: 2 }), ['p1', 'p2'])
    })
})

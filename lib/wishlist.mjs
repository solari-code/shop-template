// Wishlist data: the products a customer saved for later.
// Plain functions, safe on the server, in the browser and in Node (tests).
// The store that keeps the wishlist in the browser is lib/wishlistStore.js.
//
// The wishlist is a list of entries, newest first:
//   { productId, variantId, slug, title, image, addedAt }
// Entries are per product, not per size. variantId is the size the
// customer last chose for it (on the product page or the wishlist page), or
// null; the wishlist preselects it when the product is moved to the cart.
// slug, title and image are a snapshot, used to show products that are no
// longer in the shop. Prices, stock and sizes are always loaded fresh from
// the product data.
//
// maxItems (config/wishlist.mjs) is passed in, so the functions work with
// any config: at most this many products are kept, saving more drops the
// oldest ones.

// localStorage key of the wishlist
export const WISHLIST_STORAGE_KEY = 'shop-wishlist'

// Longest ID accepted from the browser
const MAX_ID_LENGTH = 200

function validId(id) {
    return typeof id === 'string' && id.trim() !== '' && id.length <= MAX_ID_LENGTH
}

// A wishlist entry for a product (as returned by the product queries)
export function wishlistEntry(product, { addedAt = new Date().toISOString(), variantId = null } = {}) {
    return {
        productId: product.productId,
        variantId: validId(variantId) ? variantId : null,
        slug: product.slug ?? null,
        title: product.title ?? null,
        image: product.images?.[0] ?? null,
        addedAt,
    }
}

export function isInWishlist(items, productId) {
    return items.some(item => item.productId === productId)
}

// Adds a product at the top; a product that is already saved keeps its place.
// variantId: the size chosen when saving, if any.
export function addToWishlist(items, product, { maxItems, addedAt, variantId } = {}) {
    if (!validId(product?.productId) || isInWishlist(items, product.productId)) return items
    return [wishlistEntry(product, { addedAt, variantId }), ...items].slice(0, maxItems)
}

export function removeFromWishlist(items, productId) {
    return isInWishlist(items, productId) ? items.filter(item => item.productId !== productId) : items
}

// Adds the product if it isn't saved, removes it otherwise
export function toggleInWishlist(items, product, options) {
    return isInWishlist(items, product?.productId)
        ? removeFromWishlist(items, product.productId)
        : addToWishlist(items, product, options)
}

// Remembers the size chosen for a saved product (null: no size). Products
// that are not saved are left alone.
export function setWishlistSize(items, productId, variantId) {
    const size = validId(variantId) ? variantId : null
    const item = items.find(i => i.productId === productId)
    if (!item || item.variantId === size) return items
    return items.map(i => (i === item ? { ...i, variantId: size } : i))
}

// The size to preselect on the wishlist page: the remembered size if it can
// still be bought, otherwise the only size of the product if it can be
// bought, otherwise none (null).
export function preselectedVariant(product, variantId) {
    const active = (product?.variants ?? []).filter(v => v.active === true)
    const available = (v) => Number(v.stock) > 0
    const remembered = active.find(v => v.variantId === variantId && available(v))
    if (remembered) return remembered
    return active.length === 1 && available(active[0]) ? active[0] : null
}

// Updates the snapshots (slug, title, image) from current product data, so
// a product that leaves the shop later is shown as it was last seen.
// products: the current products; saved products not among them keep their
// entry unchanged.
export function refreshWishlist(items, products) {
    const byId = new Map((products ?? []).map(product => [product.productId, product]))
    let changed = false
    const refreshed = items.map(item => {
        const product = byId.get(item.productId)
        if (!product) return item
        const fresh = wishlistEntry(product, { addedAt: item.addedAt, variantId: item.variantId })
        if (fresh.slug === item.slug && fresh.title === item.title && JSON.stringify(fresh.image) === JSON.stringify(item.image)) return item
        changed = true
        return fresh
    })
    return changed ? refreshed : items
}

// The wishlist as read from the browser: entries without a valid product
// ID and duplicates are dropped, missing fields become null (e.g. variantId
// in wishlists saved before sizes were remembered), and only the newest
// maxItems are kept.
export function cleanWishlist(items, { maxItems } = {}) {
    if (!Array.isArray(items)) return []
    const seen = new Set()
    const clean = []
    for (const item of items) {
        if (!validId(item?.productId) || seen.has(item.productId)) continue
        seen.add(item.productId)
        clean.push({
            productId: item.productId,
            variantId: validId(item.variantId) ? item.variantId : null,
            slug: typeof item.slug === 'string' ? item.slug : null,
            title: typeof item.title === 'string' ? item.title : null,
            image: item.image && typeof item.image === 'object' ? item.image : null,
            addedAt: typeof item.addedAt === 'string' ? item.addedAt : null,
        })
        if (clean.length === maxItems) break
    }
    return clean
}

// Product IDs sent from the browser to load the saved products: valid,
// unique, at most maxItems.
export function cleanProductIds(ids, { maxItems } = {}) {
    if (!Array.isArray(ids)) return []
    return [...new Set(ids.filter(validId))].slice(0, maxItems)
}

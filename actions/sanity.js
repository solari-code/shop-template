'use server'

import { getCatalog } from '@/lib/catalog'
import { cleanProductIds } from '@/lib/wishlist.mjs'
import { wishlistConfig } from '@/config/wishlist.mjs'

// Product queries used by the pages. The data comes from Sanity in live
// mode and from the local example products in local mode (see lib/catalog).

export async function getProducts() {
    try {
        return await getCatalog().getProducts()
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

export async function getProductsByCategory(category) {
    try {
        return await getCatalog().getProductsByCategory(category)
    } catch (error) {
        console.error('Error fetching products by category:', error)
        return []
    }
}

export async function getProductBySlug(slug) {
    try {
        return await getCatalog().getProductBySlug(slug)
    } catch (error) {
        console.error('Error fetching product by slug:', error)
        return null
    }
}

// The saved products of a wishlist: the active products among productIds,
// in the order of productIds. Products that are hidden or deleted are left
// out. Returns null if the products could not be loaded, so the wishlist
// doesn't mistake an error for "no longer available".
export async function getProductsByProductIds(productIds) {
    const ids = cleanProductIds(productIds, { maxItems: wishlistConfig.maxItems })
    try {
        const products = await getCatalog().getProductsByProductIds(ids)
        const byId = new Map(products.map(product => [product.productId, product]))
        return ids.filter(id => byId.has(id)).map(id => byId.get(id))
    } catch (error) {
        console.error('Error fetching products by product ID:', error)
        return null
    }
}

export async function getActiveCategories() {
    try {
        return await getCatalog().getActiveCategories()
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

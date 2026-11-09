'use server'

import { getCatalog } from '@/lib/catalog'

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

export async function getActiveCategories() {
    try {
        return await getCatalog().getActiveCategories()
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

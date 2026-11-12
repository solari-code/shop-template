import 'server-only'
import { getClient, getWriteClient } from '@/sanity/lib/client'

// Product data from Sanity (live mode).

const PRODUCT_FIELDS = `
    _id,
    productId,
    title,
    "slug": slug.current,
    price,
    discountedPrice,
    description,
    images,
    categories,
    variants,
    active
`

export async function getProducts() {
    return getClient().fetch(`
        *[_type == "product" && active == true] | order(_createdAt desc) {
            ${PRODUCT_FIELDS}
        }
    `)
}

export async function getProductsByCategory(category) {
    return getClient().fetch(`
        *[_type == "product" && active == true && $category in categories] | order(_createdAt desc) {
            ${PRODUCT_FIELDS}
        }
    `, { category })
}

export async function getProductBySlug(slug) {
    return getClient().fetch(`
        *[_type == "product" && active == true && slug.current == $slug][0] {
            ${PRODUCT_FIELDS}
        }
    `, { slug })
}

export async function getActiveCategories() {
    return getClient().fetch(`
        array::unique(*[_type == "product" && active == true].categories[])
    `)
}

// Active products with these product IDs (e.g. the saved products of a
// wishlist), in no particular order. Unknown and hidden products are left out.
export async function getProductsByProductIds(productIds) {
    if (productIds.length === 0) return []
    return getClient().fetch(`
        *[_type == "product" && active == true && productId in $productIds] {
            ${PRODUCT_FIELDS}
        }
    `, { productIds })
}

// Includes inactive products (an order can still arrive for a product that
// was hidden after checkout started).
export async function getProductByProductId(productId) {
    return getWriteClient().fetch(`
        *[_type == "product" && productId == $productId][0] {
            ${PRODUCT_FIELDS}
        }
    `, { productId })
}

// Lowers the stock of one size, never below 0. Returns
// { previousStock, newStock }, or null if the product or size doesn't exist.
//
// The patch only applies if the document hasn't changed since it was read
// (ifRevisionId), so two orders at the same time can't overwrite each
// other's stock update; on a conflict it reads again and retries.
export async function decrementStock(productId, variantId, quantity, { attempts = 3 } = {}) {
    const client = getWriteClient()

    for (let attempt = 1; ; attempt++) {
        const product = await client.fetch(`
            *[_type == "product" && productId == $productId][0] { _id, _rev, variants }
        `, { productId })

        const variant = product?.variants?.find(v => v.variantId === variantId)
        if (!variant) return null

        const previousStock = variant.stock ?? 0
        const newStock = Math.max(0, previousStock - quantity)
        const variants = product.variants.map(v =>
            v.variantId === variantId ? { ...v, stock: newStock } : v
        )

        try {
            await client
                .patch(product._id)
                .ifRevisionId(product._rev)
                .set({ variants })
                .commit()
            return { previousStock, newStock }
        } catch (error) {
            if (error.statusCode === 409 && attempt < attempts) continue
            throw error
        }
    }
}

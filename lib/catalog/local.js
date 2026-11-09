import 'server-only'
import { localProducts } from '@/data/products'
import { readLocalData, updateLocalData } from '@/lib/local/store'

// Product data for local mode: the example products from data/products.js,
// with the stock lowered by what was sold locally (.local-data/store.json).
// Returns the same shapes as the Sanity queries in ./sanity.js.

function soldQuantity(sold, productId, variantId) {
    return Number(sold?.[productId]?.[variantId]) || 0
}

// Mirrors the GROQ projection in ./sanity.js (missing fields become null).
function toProduct(doc, sold) {
    return structuredClone({
        _id: doc._id,
        productId: doc.productId ?? null,
        title: doc.title ?? null,
        slug: doc.slug?.current ?? null,
        price: doc.price ?? null,
        discountedPrice: doc.discountedPrice ?? null,
        description: doc.description ?? null,
        images: doc.images ?? null,
        categories: doc.categories ?? null,
        variants: doc.variants?.map(v => ({
            ...v,
            stock: Math.max(0, (v.stock ?? 0) - soldQuantity(sold, doc.productId, v.variantId)),
        })) ?? null,
        active: doc.active ?? null,
    })
}

function activeDocs() {
    return localProducts
        .filter(doc => doc.active === true)
        .sort((a, b) => String(b._createdAt).localeCompare(String(a._createdAt)))
}

export async function getProducts() {
    const { sold } = await readLocalData()
    return activeDocs().map(doc => toProduct(doc, sold))
}

export async function getProductsByCategory(category) {
    const { sold } = await readLocalData()
    return activeDocs()
        .filter(doc => doc.categories?.includes(category))
        .map(doc => toProduct(doc, sold))
}

export async function getProductBySlug(slug) {
    const doc = activeDocs().find(d => d.slug?.current === slug)
    if (!doc) return null
    const { sold } = await readLocalData()
    return toProduct(doc, sold)
}

export async function getActiveCategories() {
    return [...new Set(activeDocs().flatMap(doc => doc.categories ?? []))]
}

// Includes inactive products, like the Sanity version.
export async function getProductByProductId(productId) {
    const doc = localProducts.find(d => d.productId === productId)
    if (!doc) return null
    const { sold } = await readLocalData()
    return toProduct(doc, sold)
}

// Lowers the stock of one size, never below 0 (same rule as the Sanity
// stock update). Returns { previousStock, newStock }, or null if the
// product or size doesn't exist.
export async function decrementStock(productId, variantId, quantity) {
    const doc = localProducts.find(d => d.productId === productId)
    const variant = doc?.variants?.find(v => v.variantId === variantId)
    if (!variant) return null

    return updateLocalData(data => {
        const startStock = variant.stock ?? 0
        const alreadySold = soldQuantity(data.sold, productId, variantId)
        const previousStock = Math.max(0, startStock - alreadySold)
        const newStock = Math.max(0, previousStock - quantity)

        data.sold[productId] ??= {}
        data.sold[productId][variantId] = startStock - newStock
        return { previousStock, newStock }
    })
}

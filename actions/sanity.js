'use server'

import { client } from '@/sanity/lib/client'

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
    try {
        return await client.fetch(`
            *[_type == "product" && active == true] | order(_createdAt desc) {
                ${PRODUCT_FIELDS}
            }
        `)
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

export async function getProductsByCategory(category) {
    try {
        return await client.fetch(`
            *[_type == "product" && active == true && $category in categories] | order(_createdAt desc) {
                ${PRODUCT_FIELDS}
            }
        `, { category })
    } catch (error) {
        console.error('Error fetching products by category:', error)
        return []
    }
}

export async function getProductBySlug(slug) {
    try {
        return await client.fetch(`
            *[_type == "product" && active == true && slug.current == $slug][0] {
                ${PRODUCT_FIELDS}
            }
        `, { slug })
    } catch (error) {
        console.error('Error fetching product by slug:', error)
        return null
    }
}

export async function getActiveCategories() {
    try {
        return await client.fetch(`
            array::unique(*[_type == "product" && active == true].categories[])
        `)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}
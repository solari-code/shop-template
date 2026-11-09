import { urlFor } from '@/sanity/lib/client'

// Returns a URL for a product image, for both data sources:
// - local example products carry a site path in `asset.url` (/images/...),
//   which is used as is (next/image still resizes it)
// - Sanity images go through the Sanity image URL builder
// Safe to use in client components; returns null if no URL can be built.

export function isLocalImage(image) {
    const url = image?.asset?.url
    return typeof url === 'string' && url.startsWith('/')
}

export function imageUrl(image, { width, quality } = {}) {
    if (!image) return null
    if (isLocalImage(image)) return image.asset.url

    try {
        let builder = urlFor(image)
        if (width) builder = builder.width(width)
        if (quality) builder = builder.quality(quality)
        return builder.url()
    } catch (error) {
        // e.g. a Sanity image left in the cart while the shop runs locally
        console.warn('Could not build image URL:', error.message)
        return null
    }
}

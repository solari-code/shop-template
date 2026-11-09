import 'server-only'
import { getCatalog } from '@/lib/catalog'
import { formatPrice } from '@/utils/formatPrice'

// Checks the cart against the current product data before checkout starts.
// The cart lives in the browser, so its prices and quantities can be
// outdated (or edited); only the product data is trusted.
//
// Returns { items, issues, cart }:
// - items:  the checkout items, built from the product data (price, title,
//           size, image); only meaningful when there are no issues
// - issues: messages for the customer; any issue blocks the checkout
//           (changed price, not enough stock, unavailable product or size)
// - cart:   the corrected cart for the browser: current prices and stock,
//           quantities reduced to what's available, unavailable items removed

function toCents(amount) {
    return Math.round(Number(amount) * 100)
}

function label(title, size) {
    return size && size !== 'One size' ? `${title} (size ${size})` : title
}

// Merges lines for the same product and size (the cart never creates
// them, but an edited cart could) and sanitises quantities.
function normaliseCart(cartItems) {
    const lines = new Map()
    for (const item of cartItems ?? []) {
        if (!item?.productId || !item?.variantId) continue
        const key = `${item.productId}::${item.variantId}`
        const quantity = Math.floor(Number(item.quantity))
        const existing = lines.get(key)
        if (existing) {
            existing.quantity += Number.isFinite(quantity) ? quantity : 0
        } else {
            lines.set(key, { ...item, quantity: Number.isFinite(quantity) ? quantity : 0 })
        }
    }
    return [...lines.values()]
}

export async function validateCart(cartItems) {
    const catalog = getCatalog()
    const items = []
    const issues = []
    const cart = []

    for (const line of normaliseCart(cartItems)) {
        const product = await catalog.getProductByProductId(line.productId)
        const variant = product?.variants?.find(v => v.variantId === line.variantId)
        const name = label(product?.title ?? line.title ?? 'A product', variant?.size ?? line.size)
        const price = product ? (product.discountedPrice ?? product.price) : null

        if (!product || product.active !== true || !variant || variant.active !== true || price == null) {
            issues.push(`${name} is no longer available and was removed from your cart.`)
            continue
        }

        const stock = Math.max(0, Number(variant.stock) || 0)
        if (stock === 0) {
            issues.push(`${name} is sold out and was removed from your cart.`)
            continue
        }

        let quantity = line.quantity
        if (quantity < 1) {
            quantity = 1
            issues.push(`The quantity of ${name} was invalid and was set to 1.`)
        } else if (quantity > stock) {
            quantity = stock
            issues.push(`Only ${stock} of ${name} ${stock === 1 ? 'is' : 'are'} available. The quantity was changed to ${stock}.`)
        }

        if (toCents(line.price) !== toCents(price)) {
            issues.push(`The price of ${name} changed to ${formatPrice(price)}. Please check your cart.`)
        }

        const current = {
            productId: line.productId,
            variantId: line.variantId,
            title: product.title,
            size: variant.size,
            price,
            image: product.images?.[0] ?? null,
            slug: product.slug,
            quantity,
        }
        items.push(current)
        cart.push({ ...current, stock })
    }

    if (cart.length === 0 && issues.length === 0) {
        issues.push('Your cart is empty.')
    }

    return { items, issues, cart }
}

// Stores the ordered items in Stripe Checkout metadata and reads them back.
//
// Stripe allows at most 500 characters per metadata value (and 50 keys),
// so the items are written in a compact format and split over several keys:
//
//   item_chunks: "2"
//   items_0:     "prod_Mq7kP2xA:var_Ld3nQ8we:1:180,prod_Tr4pW9sK:var_Tw2kS7ab:2:95,..."
//   items_1:     "..."
//
// Each entry is productId:variantId:quantity:unitPrice (the price charged).
// IDs are URL-encoded, so ':' and ',' in an ID can't break the format.
// About 14 items fit into one key.
//
// Sessions created before this format have a single `items` key with JSON
// ([{ productId, variantId, quantity }]); those are still read.

export const METADATA_VALUE_LIMIT = 500
// Stripe's limit is 50 keys; leave room for orderNumber and item_chunks.
const MAX_CHUNKS = 45

function encodeEntry({ productId, variantId, quantity, price }) {
    return [
        encodeURIComponent(productId),
        encodeURIComponent(variantId),
        quantity,
        price,
    ].join(':')
}

function decodeEntry(entry) {
    const [productId, variantId, quantity, price] = entry.split(':')
    const item = {
        productId: decodeURIComponent(productId ?? ''),
        variantId: decodeURIComponent(variantId ?? ''),
        quantity: Number(quantity),
    }
    if (!item.productId || !item.variantId || !Number.isFinite(item.quantity)) {
        throw new Error(`Invalid item entry "${entry}"`)
    }
    const unitPrice = Number(price)
    if (price !== undefined && price !== '' && Number.isFinite(unitPrice)) item.price = unitPrice
    return item
}

// items: [{ productId, variantId, quantity, price }] -> metadata fields
export function encodeItemsMetadata(items) {
    const chunks = []
    let current = ''
    for (const item of items) {
        const entry = encodeEntry(item)
        if (entry.length > METADATA_VALUE_LIMIT) {
            throw new Error(`Item ${item.productId}/${item.variantId} is too long for Stripe metadata.`)
        }
        const next = current ? `${current},${entry}` : entry
        if (next.length > METADATA_VALUE_LIMIT) {
            chunks.push(current)
            current = entry
        } else {
            current = next
        }
    }
    if (current) chunks.push(current)

    if (chunks.length > MAX_CHUNKS) {
        throw new Error(`Too many items for one Stripe checkout (${items.length}).`)
    }

    const metadata = { item_chunks: String(chunks.length) }
    chunks.forEach((chunk, i) => {
        metadata[`items_${i}`] = chunk
    })
    return metadata
}

// metadata -> [{ productId, variantId, quantity, price? }]
// Throws if the item data is missing or damaged.
export function decodeItemsMetadata(metadata = {}) {
    if (metadata.item_chunks !== undefined) {
        const count = Number(metadata.item_chunks)
        if (!Number.isInteger(count) || count < 0) {
            throw new Error(`Invalid item_chunks value "${metadata.item_chunks}"`)
        }
        const items = []
        for (let i = 0; i < count; i++) {
            const chunk = metadata[`items_${i}`]
            if (typeof chunk !== 'string') throw new Error(`Missing metadata key items_${i}`)
            if (chunk) items.push(...chunk.split(',').map(decodeEntry))
        }
        return items
    }

    // Older sessions: one JSON value without prices
    if (metadata.items !== undefined) {
        const items = JSON.parse(metadata.items)
        if (!Array.isArray(items)) throw new Error('metadata.items is not a list')
        return items
    }

    return []
}

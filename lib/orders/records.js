import 'server-only'
import { isLocalMode } from '@/lib/shopMode'
import { getWriteClient } from '@/sanity/lib/client'
import { updateLocalData } from '@/lib/local/store'

// Records which orders were processed, so a repeated delivery of the same
// order (e.g. Stripe retrying a webhook) doesn't lower the stock twice or
// send the emails again.
//
// claimOrder(order) records the order before anything else happens and
// returns false if it was already recorded. markOrder() saves the outcome.
//
// Live mode stores one small document per order in Sanity, with an ID based
// on the checkout session ID. Sanity refuses to create a document that
// already exists, so two deliveries arriving at the same time can't both
// claim the order. The documents have their own type and are not shown in
// the Studio; the dot in the ID also keeps them out of public queries.
// Find them with: *[_type == "processedCheckout"]
//
// Local mode stores the same information in .local-data/store.json.

export const PROCESSED_CHECKOUT_TYPE = 'processedCheckout'

export function processedCheckoutId(orderId) {
    // Sanity IDs allow a-z, A-Z, 0-9, '.', '_' and '-'
    return `${PROCESSED_CHECKOUT_TYPE}.${String(orderId).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

export async function claimOrder(order) {
    if (!order?.id) throw new Error('Order has no id, cannot check for duplicates.')
    return isLocalMode() ? claimLocal(order) : claimSanity(order)
}

export async function markOrder(order, status, problems = []) {
    const fields = { status, problems, finishedAt: new Date().toISOString() }
    if (isLocalMode()) {
        await updateLocalData(data => {
            data.orders[order.id] = { ...data.orders[order.id], ...fields }
        })
    } else {
        await getWriteClient().patch(processedCheckoutId(order.id)).set(fields).commit()
    }
}

async function claimLocal(order) {
    return updateLocalData(data => {
        if (data.orders[order.id]) return false
        data.orders[order.id] = {
            orderNumber: order.orderNumber ?? null,
            source: order.source ?? null,
            status: 'processing',
            claimedAt: new Date().toISOString(),
        }
        return true
    })
}

async function claimSanity(order) {
    try {
        await getWriteClient().create({
            _id: processedCheckoutId(order.id),
            _type: PROCESSED_CHECKOUT_TYPE,
            orderId: order.id,
            orderNumber: order.orderNumber ?? null,
            source: order.source ?? null,
            status: 'processing',
            claimedAt: new Date().toISOString(),
        })
        return true
    } catch (error) {
        // 409 Conflict: a document with this ID exists, so the order was claimed before
        if (error.statusCode === 409) return false
        throw error
    }
}

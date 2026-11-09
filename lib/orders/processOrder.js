import 'server-only'
import { getCatalog } from '@/lib/catalog'
import { sendOrderConfirmationToCustomer, sendOrderNotificationToOwner } from '@/lib/email'
import { claimOrder, markOrder } from './records'

// Processes a paid order: lowers the stock and sends the order emails.
// Used by the Stripe webhook (live) and the local test checkout.
//
// order = {
//   id,              unique per checkout (e.g. Stripe session ID), used to skip duplicates
//   source,          'stripe' | 'local'
//   orderNumber,
//   items,           [{ productId, variantId, quantity, price? }]
//   customer,        { name, email }
//   shipping,        { name, address, methodName, cost }
//   total,           amount paid in dollars, including shipping
//   paymentIntent,   Stripe payment intent ID (live only)
// }
//
// The order is recorded as processed *before* anything else, so it is never
// processed twice. If something fails after that, it is logged and saved
// with the order record, but not retried automatically.
//
// Returns { status } where status is one of:
//   'completed'               everything worked
//   'completed_with_problems' processed, but some steps failed (see problems)
//   'duplicate'               this order was already processed; nothing done
//   'claim_failed'            could not record the order; nothing done, safe to retry

export async function processOrder(order) {
    const label = `Order ${order.orderNumber ?? '(no number)'} [${order.id}]`

    let claimed
    try {
        claimed = await claimOrder(order)
    } catch (error) {
        console.error(`[order] ${label}: could not record the order, so it was NOT processed (no stock change, no emails). It can safely be retried. Reason: ${error.message}`)
        return { status: 'claim_failed', error }
    }
    if (!claimed) {
        console.log(`[order] ${label} was already processed, skipping the duplicate.`)
        return { status: 'duplicate' }
    }

    const problems = []
    if (!order.items?.length) {
        problems.push('The order contains no items, so no stock was updated.')
    }
    const items = await updateStock(order.items ?? [], problems)
    await sendEmails(order, items, problems)

    const status = problems.length ? 'completed_with_problems' : 'completed'
    try {
        await markOrder(order, status, problems)
    } catch (error) {
        problems.push(`Could not save the order status: ${error.message}`)
    }

    if (problems.length) {
        console.error([
            `[order] ${label} was processed with problems. It will NOT be retried automatically, please check it manually:`,
            ...problems.map(p => `  - ${p}`),
        ].join('\n'))
    } else {
        console.log(`[order] ${label} processed: stock updated for ${items.length} item(s), emails sent.`)
    }

    return { status, items, problems }
}

// Lowers the stock for each item and collects the details the emails need.
// Items are handled one after another, so two sizes of the same product
// don't update the same document at the same time.
async function updateStock(orderItems, problems) {
    const catalog = getCatalog()
    const items = []

    for (const item of orderItems) {
        const ref = `${item.productId} / ${item.variantId}`
        let details = { ...item, title: item.productId, size: item.variantId, price: item.price ?? 0 }

        try {
            const product = await catalog.getProductByProductId(item.productId)
            if (!product) {
                problems.push(`Product ${ref} not found, stock not updated (quantity ${item.quantity}).`)
                items.push(details)
                continue
            }

            const variant = product.variants?.find(v => v.variantId === item.variantId)
            details = {
                ...item,
                title: product.title ?? item.productId,
                size: variant?.size ?? item.variantId,
                // The price charged at checkout if known, otherwise the current price
                price: item.price ?? product.discountedPrice ?? product.price ?? 0,
            }

            const result = await catalog.decrementStock(item.productId, item.variantId, item.quantity)
            if (!result) {
                problems.push(`Size ${ref} (${details.title}) not found, stock not updated (quantity ${item.quantity}).`)
            } else if (result.previousStock < item.quantity) {
                problems.push(`${details.title}, size ${details.size}: ordered ${item.quantity} but only ${result.previousStock} in stock (oversold). Stock set to 0.`)
            }
        } catch (error) {
            problems.push(`Stock update failed for ${ref} (quantity ${item.quantity}): ${error.message}`)
        }

        items.push(details)
    }

    return items
}

async function sendEmails(order, items, problems) {
    const data = {
        orderNumber: order.orderNumber,
        customerName: order.customer?.name,
        customerEmail: order.customer?.email,
        items,
        total: formatAmount(order.total),
        paymentIntent: order.paymentIntent,
        shippingName: order.shipping?.name,
        shippingAddress: order.shipping?.address,
        shippingDisplayName: order.shipping?.methodName,
        shippingCost: formatAmount(order.shipping?.cost),
    }

    const [owner, customer] = await Promise.allSettled([
        sendOrderNotificationToOwner(data),
        sendOrderConfirmationToCustomer(data),
    ])
    if (owner.status === 'rejected') {
        problems.push(`Order notification to the shop owner failed: ${owner.reason?.message ?? owner.reason}`)
    }
    if (customer.status === 'rejected') {
        problems.push(`Order confirmation to ${data.customerEmail} failed: ${customer.reason?.message ?? customer.reason}`)
    }
    if (!data.customerEmail) {
        problems.push('No customer email address, so no order confirmation was sent.')
    }
}

// Whole dollars, like the emails showed before
function formatAmount(amount) {
    return (Number(amount) || 0).toFixed(0)
}

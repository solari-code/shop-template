import 'server-only'
import { randomUUID } from 'node:crypto'
import { readLocalData, updateLocalData } from '@/lib/local/store'
import { shippingOptions } from '@/config/shipping.mjs'
import { processOrder } from '@/lib/orders/processOrder'
import { shopCurrency } from '@/lib/config/shop.mjs'
import { roundAmount } from '@/lib/config/money.mjs'

// Local test checkout: stands in for Stripe Checkout in local mode.
// createCheckout() stores a pending checkout in .local-data/store.json and
// returns the URL of the test checkout page (app/test-checkout/[id]), where
// it can be paid or cancelled. Paying runs the same order flow as the
// Stripe webhook.

export async function createCheckout({ items, orderNumber }) {
    const id = `test_cs_${randomUUID().replace(/-/g, '')}`
    const checkout = {
        id,
        orderNumber,
        status: 'open',
        createdAt: new Date().toISOString(),
        items: items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            title: i.title,
            size: i.size,
            price: i.price,
            image: i.image ?? null,
        })),
    }
    await updateLocalData(data => {
        data.checkouts[id] = checkout
    })
    return `/test-checkout/${id}`
}

export async function getCheckout(id) {
    const { checkouts } = await readLocalData()
    return checkouts?.[id] ?? null
}

export function checkoutSubtotal(checkout) {
    const sum = checkout.items.reduce((total, i) => total + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
    return roundAmount(sum, shopCurrency)
}

// Simulates a successful payment. Returns { ok: true, status } or
// { ok: false, reason } with reason 'not_found' | 'paid' | 'cancelled' |
// 'invalid_shipping' | 'not_recorded'.
export async function payCheckout(id, { customer, shipping, shippingOptionId }) {
    const option = shippingOptions.find(o => o.id === shippingOptionId)
    if (!option) return { ok: false, reason: 'invalid_shipping' }

    // open -> paid in one locked update, so a checkout can only be paid once
    const checkout = await updateLocalData(data => {
        const c = data.checkouts[id]
        if (!c) return { error: 'not_found' }
        if (c.status !== 'open') return { error: c.status }
        c.status = 'paid'
        c.paidAt = new Date().toISOString()
        c.shippingOptionId = option.id
        return structuredClone(c)
    })
    if (checkout.error) return { ok: false, reason: checkout.error }

    const result = await processOrder({
        id: checkout.id,
        source: 'local',
        orderNumber: checkout.orderNumber,
        items: checkout.items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
        })),
        customer,
        shipping: {
            name: shipping.name,
            address: shipping.address,
            methodName: option.name,
            cost: option.amount,
        },
        total: roundAmount(checkoutSubtotal(checkout) + option.amount, shopCurrency),
        currency: shopCurrency,
        paymentIntent: null,
    })

    if (result.status === 'claim_failed') {
        // Nothing was processed: reopen the checkout so it can be paid again
        await updateLocalData(data => {
            data.checkouts[id].status = 'open'
            delete data.checkouts[id].paidAt
            delete data.checkouts[id].shippingOptionId
        })
        return { ok: false, reason: 'not_recorded' }
    }
    return { ok: true, status: result.status }
}

// Like leaving Stripe Checkout via its back link: nothing is bought.
export async function cancelCheckout(id) {
    return updateLocalData(data => {
        const c = data.checkouts[id]
        if (!c) return { ok: false, reason: 'not_found' }
        if (c.status !== 'open') return { ok: false, reason: c.status }
        c.status = 'cancelled'
        c.cancelledAt = new Date().toISOString()
        return { ok: true }
    })
}

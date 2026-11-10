import 'server-only'
import { decodeItemsMetadata } from './stripeMetadata'
import { shopCurrency } from '@/lib/config/shop.mjs'
import { fromStripeAmount } from '@/lib/config/money.mjs'
import { shippingOptions } from '@/config/shipping.mjs'

// Shown if the session doesn't say which shipping was chosen
const FALLBACK_SHIPPING_NAME = shippingOptions[0]?.name ?? 'Shipping'

// Turns a completed Stripe Checkout session into the order shape that
// processOrder() expects.

export async function orderFromStripeSession(session, stripe) {
    // Since Stripe API version 2025-03-31 the shipping details are under
    // collected_information; the top-level field is the older location.
    const shippingDetails = session.collected_information?.shipping_details ?? session.shipping_details ?? null
    // Amounts are in the smallest unit of the currency the session was paid
    // in (e.g. cents), which is the shop currency unless it was changed since.
    const currency = session.currency ?? shopCurrency

    return {
        id: session.id,
        source: 'stripe',
        orderNumber: session.metadata?.orderNumber ?? null,
        items: readItems(session.metadata),
        customer: {
            name: session.customer_details?.name ?? shippingDetails?.name ?? null,
            email: session.customer_details?.email ?? null,
        },
        shipping: {
            name: shippingDetails?.name ?? null,
            address: shippingDetails?.address ?? null,
            methodName: await shippingMethodName(session, stripe),
            cost: fromStripeAmount(session.shipping_cost?.amount_total ?? 0, currency),
        },
        total: fromStripeAmount(session.amount_total ?? 0, currency),
        currency: currency.toUpperCase(),
        paymentIntent: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
    }
}

// Items with the charged prices (older sessions have no prices; the order
// flow then uses the current product price). An empty list is flagged by
// processOrder as an order without items.
function readItems(metadata) {
    try {
        return decodeItemsMetadata(metadata ?? {})
    } catch (error) {
        console.error('Could not read the order items from the session metadata:', error)
        return []
    }
}

async function shippingMethodName(session, stripe) {
    const rate = session.shipping_cost?.shipping_rate
    if (!rate) return FALLBACK_SHIPPING_NAME
    if (typeof rate === 'object' && rate.display_name) return rate.display_name

    try {
        const shippingRate = await stripe.shippingRates.retrieve(rate)
        return shippingRate.display_name
    } catch (error) {
        console.error('Error fetching shipping rate:', error)
        return FALLBACK_SHIPPING_NAME
    }
}

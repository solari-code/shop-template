'use server'

import { redirect } from 'next/navigation'
import { getPaymentProvider } from '@/lib/payments'
import { validateCart } from '@/lib/checkout/validateCart'
import { generateOrderNumber } from '@/utils/generateOrderNumber'

// Starts the checkout for the cart: Stripe Checkout in live mode, the local
// test checkout in local mode (see lib/payments).
//
// The cart is checked against the current product data first. If a price
// changed, stock is short or an item is unavailable, the checkout is not
// started; instead this returns { issues, cart } so the cart can show the
// messages and the corrected items. Prices sent to the payment provider
// always come from the product data, never from the browser.
export async function createCheckoutSession(cartItems) {
    let url
    try {
        const { items, issues, cart } = await validateCart(cartItems)
        if (issues.length) return { ok: false, issues, cart }

        const orderNumber = generateOrderNumber()
        url = await getPaymentProvider().createCheckout({ items, orderNumber })
    } catch (error) {
        console.error('Could not start checkout:', error)
        return { ok: false, error: 'The checkout could not be started. Please try again in a moment.' }
    }

    redirect(url)
}

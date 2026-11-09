'use server'

import { redirect } from 'next/navigation'
import { isLocalMode } from '@/lib/shopMode'
import { cancelCheckout, payCheckout } from '@/lib/payments/local'
import { shippingCountries } from '@/config/shipping'

// Pay and Cancel on the local test checkout page (app/test-checkout/[id]).
// Only available in local mode.

const REASONS = {
    not_found: 'This checkout does not exist.',
    paid: 'This checkout was already paid.',
    cancelled: 'This checkout was cancelled. Go back to the cart to start a new one.',
    invalid_shipping: 'Please choose a shipping method.',
    not_recorded: 'The order could not be recorded, nothing was charged. Please try again.',
}

function readForm(formData) {
    const value = (name) => String(formData.get(name) ?? '').trim()
    return {
        checkoutId: value('checkoutId'),
        shippingOptionId: value('shippingOption'),
        customer: { name: value('name'), email: value('email') },
        shipping: {
            name: value('name'),
            address: {
                line1: value('line1'),
                line2: value('line2') || null,
                city: value('city'),
                state: value('state'),
                postal_code: value('postalCode'),
                country: value('country'),
            },
        },
    }
}

function validate({ customer, shipping }) {
    const a = shipping.address
    const missing = [
        !customer.email && 'email',
        !customer.name && 'full name',
        !a.line1 && 'address',
        !a.city && 'city',
        !a.state && 'state',
        !a.postal_code && 'ZIP code',
    ].filter(Boolean)
    if (missing.length) return `Please fill in: ${missing.join(', ')}.`
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return 'Please enter a valid email address.'
    if (!shippingCountries.includes(a.country)) return 'Shipping is not available to this country.'
    return null
}

export async function payTestCheckout(prevState, formData) {
    if (!isLocalMode()) return { error: 'The test checkout is only available in local mode.' }

    const input = readForm(formData)
    const error = validate(input)
    if (error) return { error }

    const result = await payCheckout(input.checkoutId, input)
    if (!result.ok) return { error: REASONS[result.reason] ?? 'Payment failed.' }

    redirect(`/checkout/success?session_id=${encodeURIComponent(input.checkoutId)}`)
}

export async function cancelTestCheckout(formData) {
    if (!isLocalMode()) return
    await cancelCheckout(String(formData.get('checkoutId') ?? ''))
    // Like Stripe's cancel_url: back to the cart, which still has the items
    redirect('/cart')
}

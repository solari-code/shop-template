import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { isLocalMode } from '@/lib/shopMode'
import { isConfigured } from '@/lib/env'
import { orderFromStripeSession } from '@/lib/orders/fromStripeSession'
import { processOrder } from '@/lib/orders/processOrder'

// Stripe webhook: checks the signature, then hands completed checkouts to
// the shared order flow (lib/orders/processOrder.js).
export async function POST(request) {
    // Local mode has no Stripe; the local test checkout handles orders itself.
    if (isLocalMode()) {
        return NextResponse.json({ error: 'Stripe webhook is disabled in local mode' }, { status: 404 })
    }

    if (!isConfigured(process.env.STRIPE_WEBHOOK_SECRET)) {
        console.error('Stripe webhook received, but STRIPE_WEBHOOK_SECRET is not set. Event was not processed.')
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const stripe = getStripe()
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.error('Webhook signature error:', error)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const order = await orderFromStripeSession(event.data.object, stripe)
        const result = await processOrder(order)

        // Nothing was done yet, so let Stripe retry the event later.
        if (result.status === 'claim_failed') {
            return NextResponse.json({ error: 'Order could not be recorded, please retry' }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}

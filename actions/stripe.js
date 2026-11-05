'use server'

import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { urlFor } from '@/sanity/lib/client'
import { generateOrderNumber } from '@/utils/generateOrderNumber'

export async function createCheckoutSession(items) {
    if (!items?.length) throw new Error('No items in cart')

    const line_items = items.map((item) => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.title,
                description: `Size: ${item.size}`,
                images: item.image ? [urlFor(item.image).width(800).url()] : [],
                metadata: {
                    productId: item.productId,
                    variantId: item.variantId,
                },
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }))

    const orderNumber = generateOrderNumber();

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: ['US'],
        },
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: { amount: 800, currency: 'usd' }, // $8
                    display_name: 'Standard shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 5 },
                        maximum: { unit: 'business_day', value: 10 },
                    },
                },
            },
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: { amount: 1500, currency: 'usd' }, // $15
                    display_name: 'Express shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 3 },
                        maximum: { unit: 'business_day', value: 5 },
                    },
                },
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
        metadata: {
            orderNumber,
            items: JSON.stringify(items.map(i => ({
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity,
            })))
        }
    })

    redirect(session.url)
}
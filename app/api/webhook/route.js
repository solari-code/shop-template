import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { writeClient } from '@/sanity/lib/client'
import { sendOrderNotificationToOwner, sendOrderConfirmationToCustomer } from '@/actions/resend'

export async function POST(request) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event;
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
        const session = event.data.object

        const shippingCost = ((session.shipping_cost?.amount_total ?? 0) / 100).toFixed(0)
        let shippingDisplayName = 'Standard shipping'

        if (session.shipping_cost?.shipping_rate) {
            try {
                const shippingRate = await stripe.shippingRates.retrieve(
                    session.shipping_cost.shipping_rate
                )
                shippingDisplayName = shippingRate.display_name
            } catch (error) {
                console.error('Error fetching shipping rate:', error)
            }
        }

        const items = JSON.parse(session.metadata?.items ?? '[]')
        const customerEmail = session.customer_details?.email
        const customerName = session.customer_details?.name
        const total = (session.amount_total / 100).toFixed(0)
        const shippingAddress = session.shipping_details?.address
        const shippingName = session.shipping_details?.name
        const orderNumber = session.metadata?.orderNumber

        // 1. Update stock in Sanity + load product details
        const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
                try {
                    const product = await writeClient.fetch(`
                        *[_type == "product" && productId == $productId][0] {
                            _id,
                            title,
                            price,
                            discountedPrice,
                            variants
                        }
                    `, { productId: item.productId })

                    if (!product) {
                        console.error('Product not found:', item.productId)
                        return {
                            ...item,
                            title: product.title ?? item.productId,
                            size: variant?.size ?? item.variantId,
                            price: product.discountedPrice ?? product.price ?? 0,
                        }
                    }

                    const variant = product.variants?.find(v => v.variantId === item.variantId)

                    const updatedVariants = product.variants.map(v => {
                        if (v.variantId === item.variantId) {
                            const newStock = Math.max(0, v.stock - item.quantity)
                            return { ...v, stock: newStock }
                        }
                        return v
                    })

                    await writeClient
                        .patch(product._id)
                        .set({ variants: updatedVariants })
                        .commit()

                    return {
                        ...item,
                        title: product.title ?? item.productId,
                        size: variant?.size ?? item.variantId,
                        price: product.discountedPrice ?? product.price ?? 0,
                    }

                } catch (error) {
                    console.error('Error updating stock for product:', item.productId, error)
                    return { ...item, title: item.productId, size: item.variantId }
                }
            })
        )

        // 2. Emails
        try {
            await Promise.all([
                sendOrderNotificationToOwner({
                    customerName,
                    customerEmail,
                    items: itemsWithDetails,
                    total,
                    paymentIntent: session.payment_intent,
                    shippingName,
                    shippingAddress,
                    shippingDisplayName,
                    shippingCost,
                    orderNumber
                }),
                sendOrderConfirmationToCustomer({
                    customerName,
                    customerEmail,
                    items: itemsWithDetails,
                    total,
                    shippingAddress,
                    shippingDisplayName,
                    shippingCost,
                    orderNumber
                })
            ])
        } catch (error) {
            console.error('Error sending emails:', error)
        }
    }

    return NextResponse.json({ received: true })
}
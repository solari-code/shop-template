import 'server-only'
import { getStripe } from '@/lib/stripe'
import { imageUrl } from '@/lib/imageUrl'
import { shippingCountries, shippingOptions } from '@/config/shipping.mjs'
import { encodeItemsMetadata } from '@/lib/orders/stripeMetadata'
import { shopCurrency, isOneSize, sizeLabel } from '@/lib/config/shop.mjs'
import { toStripeAmount } from '@/lib/config/money.mjs'

// Stripe Checkout (live mode). Completed payments arrive at the webhook
// (app/api/webhook), which hands them to the shared order flow.

// Stripe needs absolute image URLs; local images are left out.
function stripeImages(image) {
    const url = imageUrl(image, { width: 800 })
    return url?.startsWith('https://') ? [url] : []
}

export async function createCheckout({ items, orderNumber }) {
    // Stripe wants lowercase codes and amounts in the smallest unit
    // (cents for USD; see lib/config/money.mjs)
    const currency = shopCurrency.toLowerCase()

    const line_items = items.map((item) => ({
        price_data: {
            currency,
            product_data: {
                name: item.title,
                description: isOneSize(item.size) ? sizeLabel(item.size) : `Size: ${sizeLabel(item.size)}`,
                images: stripeImages(item.image),
                metadata: {
                    productId: item.productId,
                    variantId: item.variantId,
                },
            },
            unit_amount: toStripeAmount(item.price, shopCurrency),
        },
        quantity: item.quantity,
    }))

    const session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: shippingCountries,
        },
        shipping_options: shippingOptions.map(option => ({
            shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: toStripeAmount(option.amount, shopCurrency), currency },
                display_name: option.name,
                delivery_estimate: {
                    minimum: { unit: 'business_day', value: option.deliveryDays.min },
                    maximum: { unit: 'business_day', value: option.deliveryDays.max },
                },
            },
        })),
        success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
        metadata: {
            orderNumber,
            // The items with their charged prices, read back by the webhook
            // (split over several keys, see lib/orders/stripeMetadata.js)
            ...encodeItemsMetadata(items),
        }
    })

    return session.url
}

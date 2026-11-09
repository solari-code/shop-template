// Shipping options offered at checkout, used by the Stripe checkout and the
// local test checkout. Amounts are in USD.
export const shippingOptions = [
    {
        id: 'standard',
        name: 'Standard shipping',
        amount: 8,
        deliveryDays: { min: 5, max: 10 },
    },
    {
        id: 'express',
        name: 'Express shipping',
        amount: 15,
        deliveryDays: { min: 3, max: 5 },
    },
]

// Countries customers can ship to (ISO codes)
export const shippingCountries = ['US']

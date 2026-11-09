import Stripe from 'stripe'
import { isConfigured } from '@/lib/env'

let stripe

// Created on first use, so the app can be built and run without Stripe keys.
export function getStripe() {
    if (!stripe) {
        if (!isConfigured(process.env.STRIPE_SECRET_KEY)) {
            throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env.local or run the shop with SHOP_MODE=local.')
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2026-02-25.clover',
        })
    }
    return stripe
}

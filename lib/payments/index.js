import 'server-only'
import { isLocalMode } from '@/lib/shopMode'
import * as stripeProvider from './stripe'
import * as localProvider from './local'

// The payment provider for the current shop mode: Stripe Checkout (live)
// or the local test checkout (local). Both provide
// createCheckout({ items, orderNumber }) and return the URL to redirect to.
export function getPaymentProvider() {
    return isLocalMode() ? localProvider : stripeProvider
}

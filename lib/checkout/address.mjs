// Address rules for the local test checkout, shared by the form
// (components/checkout/TestCheckout.jsx) and the server action that checks
// it (actions/testCheckout.js). In live mode, Stripe Checkout collects the
// address with its own rules for each country.
//
// Kept simple on purpose: US addresses need a state and ZIP code; other
// countries need a postal code, and the state or region is optional.

export function addressRules(country) {
    const us = country === 'US'
    return {
        stateRequired: us,
        stateLabel: us ? 'State' : 'State / region (optional)',
        postalCodeLabel: us ? 'ZIP' : 'Postal code',
        // Used in "Please fill in: ..."
        postalCodeName: us ? 'ZIP code' : 'postal code',
    }
}

// Country name in the shop's language: ('DE', 'en-US') -> 'Germany'
export function countryName(code, locale) {
    try {
        return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
    } catch {
        return code
    }
}

// Prefilled customer for the test checkout, so a test order is one click
// away. The example address only fits the US; other countries start empty.
const TEST_ADDRESSES = {
    US: { line1: '123 Test Street', line2: '', city: 'Springfield', state: 'IL', postalCode: '62701' },
}
const EMPTY_ADDRESS = { line1: '', line2: '', city: '', state: '', postalCode: '' }

export function testCustomer(country) {
    return {
        email: 'test.customer@example.com',
        name: 'Test Customer',
        ...(TEST_ADDRESSES[country] ?? EMPTY_ADDRESS),
        country,
    }
}

// Missing fields of a submitted address, for "Please fill in: ...".
// address: { line1, city, state, postal_code, country }
export function missingAddressFields(address) {
    const rules = addressRules(address.country)
    return [
        !address.line1 && 'address',
        !address.city && 'city',
        rules.stateRequired && !address.state && 'state',
        !address.postal_code && rules.postalCodeName,
    ].filter(Boolean)
}

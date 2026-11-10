// Tests for the address rules of the local test checkout (lib/checkout/address.mjs).
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { addressRules, countryName, testCustomer, missingAddressFields } from '../lib/checkout/address.mjs'

const address = (changes) => ({ line1: '1 Main St', city: 'Town', state: '', postal_code: '12345', country: 'US', ...changes })

describe('test checkout addresses', () => {
    test('US: state and ZIP code are required', () => {
        assert.deepEqual(addressRules('US'), { stateRequired: true, stateLabel: 'State', postalCodeLabel: 'ZIP', postalCodeName: 'ZIP code' })
        assert.deepEqual(missingAddressFields(address({ state: '' })), ['state'])
        assert.deepEqual(missingAddressFields(address({ line1: '', city: '', state: '', postal_code: '' })), ['address', 'city', 'state', 'ZIP code'])
        assert.deepEqual(missingAddressFields(address({ state: 'TX' })), [])
    })

    test('other countries: postal code required, state optional', () => {
        assert.deepEqual(addressRules('DE'), { stateRequired: false, stateLabel: 'State / region (optional)', postalCodeLabel: 'Postal code', postalCodeName: 'postal code' })
        assert.deepEqual(missingAddressFields(address({ country: 'DE' })), [])
        assert.deepEqual(missingAddressFields(address({ country: 'GB', postal_code: '' })), ['postal code'])
    })

    test('the example address is only prefilled for the US', () => {
        assert.deepEqual(testCustomer('US'), {
            email: 'test.customer@example.com', name: 'Test Customer',
            line1: '123 Test Street', line2: '', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'US',
        })
        assert.deepEqual(testCustomer('DE'), {
            email: 'test.customer@example.com', name: 'Test Customer',
            line1: '', line2: '', city: '', state: '', postalCode: '', country: 'DE',
        })
    })

    test('country names in the shop language', () => {
        assert.equal(countryName('US', 'en-US'), 'United States')
        assert.equal(countryName('DE', 'en-US'), 'Germany')
        assert.equal(countryName('DE', 'de-DE'), 'Deutschland')
        assert.equal(countryName('CH', 'fr-CH'), 'Suisse')
    })
})

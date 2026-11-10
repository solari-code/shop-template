// Tests for prices: formatting, rounding and Stripe amounts (lib/config/money.mjs).
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { currencyInfo, fitsCurrency, roundAmount, toStripeAmount, fromStripeAmount, sameAmount, formatMoney } from '../lib/config/money.mjs'
import { createShopHelpers } from '../lib/config/shop.mjs'
import { exampleConfig } from './fixtures/config.mjs'
import { validateConfig } from '../lib/config/validate.mjs'

// Intl uses non-breaking spaces in some locales ("19,50 €")
const plain = (text) => text.replace(/\u00a0|\u202f/g, ' ')

describe('currencies', () => {
    test('smallest unit and allowed decimals', () => {
        assert.deepEqual(currencyInfo('USD'), { code: 'USD', factor: 100, decimals: 2 })
        assert.deepEqual(currencyInfo('eur'), { code: 'EUR', factor: 100, decimals: 2 })
        // Zero-decimal: ¥500 is 500 for Stripe
        assert.deepEqual(currencyInfo('JPY'), { code: 'JPY', factor: 1, decimals: 0 })
        // Three-decimal: Stripe needs amounts ending in 0, so 2 decimals at most
        assert.deepEqual(currencyInfo('KWD'), { code: 'KWD', factor: 1000, decimals: 2 })
        // No coins: whole prices, but Stripe still counts in 1/100
        assert.deepEqual(currencyInfo('ISK'), { code: 'ISK', factor: 100, decimals: 0 })
    })

    test('fitsCurrency', () => {
        assert.equal(fitsCurrency(19.99, 'USD'), true)
        assert.equal(fitsCurrency(19.999, 'USD'), false)
        assert.equal(fitsCurrency(500, 'JPY'), true)
        assert.equal(fitsCurrency(500.5, 'JPY'), false)
        assert.equal(fitsCurrency(1.25, 'KWD'), true)
        assert.equal(fitsCurrency(1.255, 'KWD'), false)
    })
})

describe('Stripe amounts', () => {
    test('prices to the smallest unit', () => {
        assert.equal(toStripeAmount(180, 'USD'), 18000)
        assert.equal(toStripeAmount(19.99, 'USD'), 1999)
        assert.equal(toStripeAmount(0.1 + 0.2, 'USD'), 30)
        assert.equal(toStripeAmount(19.99 * 3, 'USD'), 5997)
        assert.equal(toStripeAmount(500, 'JPY'), 500)
        assert.equal(toStripeAmount(1.25, 'KWD'), 1250)
        assert.equal(toStripeAmount(500, 'ISK'), 50000)
    })

    test('always whole numbers', () => {
        for (const amount of [0.01, 1.005, 2.675, 19.995, 1234.5678]) {
            assert.ok(Number.isInteger(toStripeAmount(amount, 'USD')), String(amount))
            assert.ok(Number.isInteger(toStripeAmount(amount, 'KWD')), String(amount))
        }
        // Three-decimal amounts end in 0, as Stripe requires
        assert.equal(toStripeAmount(1.2345, 'KWD') % 10, 0)
    })

    test('back from the smallest unit', () => {
        assert.equal(fromStripeAmount(45300, 'USD'), 453)
        assert.equal(fromStripeAmount(1950, 'usd'), 19.5)
        assert.equal(fromStripeAmount(500, 'JPY'), 500)
        assert.equal(fromStripeAmount(1250, 'KWD'), 1.25)
        assert.equal(fromStripeAmount(50000, 'ISK'), 500)
        assert.equal(fromStripeAmount(undefined, 'USD'), 0)
    })

    test('comparing prices', () => {
        assert.equal(sameAmount(19.99, 19.990000000001, 'USD'), true)
        assert.equal(sameAmount('180', 180, 'USD'), true)
        assert.equal(sameAmount(19.99, 20, 'USD'), false)
    })

    test('rounding', () => {
        assert.equal(roundAmount(19.99 * 3, 'USD'), 59.97)
        assert.equal(roundAmount(499.6, 'JPY'), 500)
    })
})

describe('formatting', () => {
    const usd = (amount) => formatMoney(amount, { currency: 'USD', locale: 'en-US' })

    test('whole amounts without decimals, others with', () => {
        assert.equal(usd(20), '$20')
        assert.equal(usd(19.5), '$19.50')
        assert.equal(usd(19.99), '$19.99')
        assert.equal(usd(0), '$0')
        assert.equal(usd(1234), '$1,234')
        // Floating point noise doesn't show up as decimals
        assert.equal(usd(0.1 + 0.2), '$0.30')
        assert.equal(usd(19.999999999), '$20')
        assert.equal(usd(19.99 * 3), '$59.97')
    })

    test('other currencies and locales', () => {
        assert.equal(plain(formatMoney(19.5, { currency: 'EUR', locale: 'de-DE' })), '19,50 €')
        assert.equal(plain(formatMoney(20, { currency: 'EUR', locale: 'de-DE' })), '20 €')
        assert.equal(formatMoney(500, { currency: 'JPY', locale: 'en-US' }), '¥500')
        assert.equal(formatMoney(500.4, { currency: 'JPY', locale: 'en-US' }), '¥500')
        assert.equal(plain(formatMoney(12.5, { currency: 'GBP', locale: 'en-GB' })), '£12.50')
    })

    test('the shop formatter uses the currency and locale of the config', () => {
        const usdShop = createShopHelpers(exampleConfig)
        assert.equal(usdShop.shopCurrency, 'USD')
        assert.equal(usdShop.formatPrice(180), '$180')
        assert.equal(usdShop.formatPrice(95.5), '$95.50')

        const config = structuredClone(exampleConfig)
        config.commerce.currency = 'EUR'
        config.site.locale = 'de-DE'
        const eurShop = createShopHelpers(config)
        assert.equal(plain(eurShop.formatPrice(95.5)), '95,50 €')
    })
})

describe('config check', () => {
    const errorsFor = (change) => {
        const config = structuredClone(exampleConfig)
        change(config)
        return validateConfig(config, { fileExists: () => true }).errors
    }

    test('currencies Stripe handles specially are refused', () => {
        assert.match(errorsFor(c => { c.commerce.currency = 'UGX' })[0].message, /special case/)
        assert.match(errorsFor(c => { c.commerce.currency = 'XDR' })[0].message, /not a currency customers can pay in/)
    })

    test('shipping amounts must fit the currency', () => {
        assert.deepEqual(errorsFor(c => { c.commerce.currency = 'ISK'; c.shipping.options[0].amount = 800 }), [])
        assert.match(errorsFor(c => { c.commerce.currency = 'ISK'; c.shipping.options[0].amount = 8.5 })[0].message, /more decimals than ISK allows \(0\)/)
        assert.match(errorsFor(c => { c.commerce.currency = 'KWD'; c.shipping.options[0].amount = 1.255 })[0].message, /more decimals than KWD allows \(2\)/)
    })
})

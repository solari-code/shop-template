// Tests for the server-side check of the contact form (lib/email/contactForm.mjs).
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { readContactForm } from '../lib/email/contactForm.mjs'

const form = (fields) => {
    const data = new FormData()
    for (const [key, value] of Object.entries(fields)) data.append(key, value)
    return data
}
const filled = { name: 'Ana', email: 'ana@example.org', message: 'Hello' }

describe('contact form', () => {
    test('accepts filled fields, without the spaces around them', () => {
        assert.deepEqual(readContactForm(form(filled)), filled)
        assert.deepEqual(readContactForm(form({ name: '  Ana ', email: ' ana@example.org\n', message: '\n Hello\nthere \n' })), {
            name: 'Ana', email: 'ana@example.org', message: 'Hello\nthere',
        })
    })

    test('refuses missing, empty and whitespace-only fields', () => {
        for (const key of Object.keys(filled)) {
            const { [key]: _, ...without } = filled
            assert.equal(readContactForm(form(without)), null, `${key} missing`)
            for (const blank of ['', ' ', '   \n\t ']) {
                assert.equal(readContactForm(form({ ...filled, [key]: blank })), null, `${key}: ${JSON.stringify(blank)}`)
            }
        }
    })

    test('refuses files instead of text', () => {
        assert.equal(readContactForm(form({ ...filled, message: new Blob(['Hello']) })), null)
    })
})

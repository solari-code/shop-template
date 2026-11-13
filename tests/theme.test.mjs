// Tests for light and dark mode: the theme stylesheet and the data-theme
// attribute (lib/config/theme.mjs), the saved choice (lib/theme.mjs) and
// the Tailwind `dark:` variant. The pre-paint script that applies a saved
// choice is tested in tests/prepaint.test.mjs.
// Run with: npm test

import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { exampleConfig } from './fixtures/config.mjs'
import { themeStyleSheet, serverThemeAttribute } from '../lib/config/theme.mjs'
import { THEME_STORAGE_KEY, savedColorMode, resolveColorMode, themeAttribute, otherColorMode } from '../lib/theme.mjs'
import { THEME_COLORS } from '../lib/config/validate.mjs'

const require = createRequire(import.meta.url)
const { light, dark } = exampleConfig.theme.colors

// The example theme with other mode settings
const theme = (mode) => ({ ...structuredClone(exampleConfig.theme), mode: { ...exampleConfig.theme.mode, ...mode } })

// The rules of a stylesheet: [{ media, selector, vars: { name: value } }]
function rules(css) {
    return css.split('\n').map((line) => {
        const media = line.match(/^@media ([^{]+)\{/)?.[1].trim() ?? null
        const [, selector, body] = line.match(/([^{}]+)\{([^{}]*)\}+$/)
        const vars = Object.fromEntries(body.split(';').map(d => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]))
        return { media, selector: selector.trim(), vars }
    })
}

// Which palette a rule sets ('light', 'dark', or null), by its colours
function palette(vars) {
    const matches = (colors) => THEME_COLORS.every(name => vars[`--color-${name}`] === colors[name])
    return matches(light) ? 'light' : matches(dark) ? 'dark' : null
}

describe('theme stylesheet', () => {
    test("'system' with a switcher: light by default, dark for the device setting and for data-theme=\"dark\"", () => {
        const css = rules(themeStyleSheet(theme({ default: 'system', switcher: true })))
        assert.deepEqual(css.map(r => [r.media, r.selector, palette(r.vars), r.vars['color-scheme']]), [
            [null, ':root', 'light', 'light'],
            ['(prefers-color-scheme: dark)', ':root:not([data-theme="light"])', 'dark', 'dark'],
            [null, ':root[data-theme="dark"]', 'dark', 'dark'],
        ])
    })

    test("'system' without a switcher: the same rules (data-theme is never set)", () => {
        assert.equal(themeStyleSheet(theme({ default: 'system', switcher: false })), themeStyleSheet(theme({ default: 'system', switcher: true })))
    })

    test('a default mode with a switcher: that palette, the other one for data-theme', () => {
        const css = rules(themeStyleSheet(theme({ default: 'dark', switcher: true })))
        assert.deepEqual(css.map(r => [r.media, r.selector, palette(r.vars)]), [
            [null, ':root', 'dark'],
            [null, ':root[data-theme="light"]', 'light'],
        ])
    })

    test('a fixed mode: only its palette, whatever the device prefers', () => {
        for (const mode of ['light', 'dark']) {
            const css = rules(themeStyleSheet(theme({ default: mode, switcher: false })))
            assert.deepEqual(css.map(r => [r.media, r.selector, palette(r.vars), r.vars['color-scheme']]), [[null, ':root', mode, mode]])
        }
        // The unused palette may be left out of the config
        const lightOnly = theme({ default: 'light', switcher: false })
        delete lightOnly.colors.dark
        assert.equal(rules(themeStyleSheet(lightOnly)).length, 1)
    })

    test('colours as hex and RGB channels; overlays once, on :root', () => {
        const [base, ...others] = rules(themeStyleSheet(theme({ default: 'system' })))
        assert.equal(base.vars['--color-content'], light.content)
        assert.equal(base.vars['--color-content-rgb'], '28 25 23')
        assert.equal(base.vars['--overlay-hero'], '35%')
        for (const rule of others) assert.equal(rule.vars['--overlay-hero'], undefined)
    })

    test('nothing in it can end the <style> tag', () => {
        assert.ok(!themeStyleSheet(theme({})).includes('<'))
    })
})

describe('data-theme rendered by the server', () => {
    test('set for a fixed mode and for a default mode; not for system', () => {
        assert.equal(serverThemeAttribute({ default: 'light', switcher: false }), 'light')
        assert.equal(serverThemeAttribute({ default: 'dark', switcher: false }), 'dark')
        assert.equal(serverThemeAttribute({ default: 'light', switcher: true }), 'light')
        assert.equal(serverThemeAttribute({ default: 'dark', switcher: true }), 'dark')
        assert.equal(serverThemeAttribute({ default: 'system', switcher: true }), undefined)
        assert.equal(serverThemeAttribute({ default: 'system', switcher: false }), undefined)
    })
})

describe('saved choice', () => {
    test('only light or dark', () => {
        assert.equal(THEME_STORAGE_KEY, 'shop-theme')
        assert.equal(savedColorMode('light'), 'light')
        assert.equal(savedColorMode('dark'), 'dark')
        for (const value of [null, undefined, '', 'system', 'Dark', '"dark"', 1]) assert.equal(savedColorMode(value), null)
    })
})

describe('Tailwind dark: variant', () => {
    test('uses the same selectors as the theme stylesheet', () => {
        const [strategy, selectors] = require('../tailwind.config.js').darkMode
        assert.equal(strategy, 'variant')
        const css = themeStyleSheet(theme({ default: 'system' }))
        // data-theme="dark" on <html>
        assert.match(selectors[0], /\[data-theme="dark"\]/)
        assert.ok(css.includes(':root[data-theme="dark"]'))
        // The device prefers dark, unless light is set
        assert.match(selectors[1], /^@media \(prefers-color-scheme: dark\) \{ &:where\(:root:not\(\[data-theme="light"\]\), :root:not\(\[data-theme="light"\]\) \*\) \}$/)
        assert.ok(css.includes('@media (prefers-color-scheme: dark){:root:not([data-theme="light"])'))
    })
})

describe('switcher rules', () => {
    test('the mode shown: saved choice, else default, else the device setting', () => {
        assert.equal(resolveColorMode({ saved: 'dark', defaultMode: 'light', systemPrefersDark: false }), 'dark')
        assert.equal(resolveColorMode({ saved: 'light', defaultMode: 'system', systemPrefersDark: true }), 'light')
        assert.equal(resolveColorMode({ saved: null, defaultMode: 'dark', systemPrefersDark: false }), 'dark')
        assert.equal(resolveColorMode({ saved: null, defaultMode: 'light', systemPrefersDark: true }), 'light')
        assert.equal(resolveColorMode({ saved: null, defaultMode: 'system', systemPrefersDark: true }), 'dark')
        assert.equal(resolveColorMode({ saved: null, defaultMode: 'system', systemPrefersDark: false }), 'light')
    })

    test('data-theme: the choice, else the default mode, none for system', () => {
        assert.equal(themeAttribute({ saved: 'dark', defaultMode: 'system' }), 'dark')
        assert.equal(themeAttribute({ saved: null, defaultMode: 'system' }), null)
        assert.equal(themeAttribute({ saved: null, defaultMode: 'light' }), 'light')
        // Without a choice, the same as the server renders
        for (const defaultMode of ['light', 'dark', 'system']) {
            assert.equal(themeAttribute({ saved: null, defaultMode }), serverThemeAttribute({ default: defaultMode, switcher: true }) ?? null)
        }
    })

    test('switches to the other mode', () => {
        assert.equal(otherColorMode('light'), 'dark')
        assert.equal(otherColorMode('dark'), 'light')
    })

    // Applies the stylesheet like a browser: the rules that match <html>
    // (its data-theme) and the device setting; of those, the last one wins
    // (all rules after :root have the same specificity).
    function shownPalette(css, attribute, systemPrefersDark) {
        const matching = rules(css).filter(({ media, selector }) => {
            if (media && !(media === '(prefers-color-scheme: dark)' && systemPrefersDark)) return false
            if (selector === ':root') return true
            const is = selector.match(/^:root\[data-theme="(\w+)"\]$/)
            if (is) return attribute === is[1]
            const not = selector.match(/^:root:not\(\[data-theme="(\w+)"\]\)$/)
            if (not) return attribute !== not[1]
            throw new Error(`unexpected selector ${selector}`)
        })
        return palette(matching.at(-1).vars)
    }

    test('the page shows the mode the switcher knows, in every case', () => {
        for (const defaultMode of ['light', 'dark', 'system']) {
            const css = themeStyleSheet(theme({ default: defaultMode, switcher: true }))
            for (const saved of [null, 'light', 'dark']) {
                for (const systemPrefersDark of [false, true]) {
                    const attribute = themeAttribute({ saved, defaultMode })
                    assert.equal(
                        shownPalette(css, attribute, systemPrefersDark),
                        resolveColorMode({ saved, defaultMode, systemPrefersDark }),
                        JSON.stringify({ defaultMode, saved, systemPrefersDark }),
                    )
                }
            }
        }
    })

    test('without a switcher, saved choices are not applied and the page shows the configured mode', () => {
        for (const defaultMode of ['light', 'dark', 'system']) {
            const mode = { default: defaultMode, switcher: false }
            const css = themeStyleSheet(theme(mode))
            for (const systemPrefersDark of [false, true]) {
                assert.equal(
                    shownPalette(css, serverThemeAttribute(mode) ?? null, systemPrefersDark),
                    resolveColorMode({ saved: null, defaultMode, systemPrefersDark }),
                )
            }
        }
    })
})

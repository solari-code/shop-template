// Theme helpers (config/theme.mjs): light and dark mode, CSS variables for
// the colours and fonts, and colour contrast. Plain functions, safe on the
// server, in the browser and in Node.

// ─── Light and dark mode ──────────────────────────────────

// The colour palettes a theme has: theme.colors.light and theme.colors.dark
export const COLOR_MODES = ['light', 'dark']
// Values of theme.mode.default: a fixed palette, or the visitor's system
// setting
export const MODE_DEFAULTS = ['light', 'dark', 'system']
// theme.mode settings that are true or false
export const MODE_SWITCHES = ['switcher', 'showInMenu', 'showInFooter', 'showInHeader']

// The palettes the shop can show, from theme.mode:
// - a fixed mode without switcher: only that one, ['light'] or ['dark']
// - 'system', or a switcher: both
// Settings that are missing or invalid count as both, so the config check
// asks for everything that might be needed.
export function colorModes(mode) {
    if (mode?.switcher !== true && (mode?.default === 'light' || mode?.default === 'dark')) return [mode.default]
    return [...COLOR_MODES]
}

// The palette shown when the browser's preference isn't known (no saved
// choice, and no system setting or no support for it): the fixed or
// default mode, and light for 'system'. Also used where only one colour
// fits, e.g. the web app manifest.
export function defaultColorMode(mode) {
    return mode?.default === 'dark' ? 'dark' : 'light'
}

// ─── CSS variables ────────────────────────────────────────

// CSS variables of one palette (colorMode: 'light' or 'dark'): the colours
// as hex and as RGB channels (for Tailwind colours with an opacity like
// bg-brand-surface/90), and the overlay strengths. Tailwind's brand-*
// colours and the overlays in app/globals.css use them.
// { '--color-surface': '#ffffff', '--color-surface-rgb': '255 255 255', ...,
//   '--overlay-hero': '35%', ... }
export function themeVariables(theme, colorMode) {
    return { ...colorVariables(theme, colorMode), ...overlayVariables(theme) }
}

function colorVariables(theme, colorMode) {
    return Object.fromEntries(Object.entries(theme.colors[colorMode]).flatMap(([name, value]) => [
        [`--color-${name}`, value],
        [`--color-${name}-rgb`, hexToChannels(value)],
    ]))
}

function overlayVariables(theme) {
    return Object.fromEntries(Object.entries(theme.overlays).map(([name, value]) => [`--overlay-${name}`, `${value}%`]))
}

// The theme as a stylesheet, rendered in <head> by the root layout. The
// palette of the default mode is set on :root, the other one applies when
// <html> has data-theme="light" or "dark":
// - fixed mode: only its palette; the root layout sets data-theme
// - 'system': the dark palette also applies when the device prefers dark,
//   unless data-theme="light" (a saved choice). Works without JavaScript.
// - 'light' or 'dark' with a switcher: the root layout sets data-theme to
//   the default, the pre-paint script (lib/prepaint.mjs) to a saved choice
// color-scheme makes the browser's own parts (scrollbars, form controls)
// match. The Tailwind `dark:` variant (tailwind.config.js) uses the same
// selectors.
export function themeStyleSheet(theme) {
    const modes = colorModes(theme.mode)
    const base = modes.length === 1 ? modes[0] : defaultColorMode(theme.mode)
    const rule = (selector, colorMode, overlays = {}) => {
        const vars = { ...colorVariables(theme, colorMode), ...overlays, 'color-scheme': colorMode }
        return `${selector}{${Object.entries(vars).map(([name, value]) => `${name}:${value}`).join(';')}}`
    }
    // Overlays are the same in both modes
    const rules = [rule(':root', base, overlayVariables(theme))]
    const other = modes.find(colorMode => colorMode !== base)
    if (other) {
        if (theme.mode.default === 'system') {
            rules.push(`@media (prefers-color-scheme: dark){${rule(':root:not([data-theme="light"])', 'dark')}}`)
        }
        rules.push(rule(`:root[data-theme="${other}"]`, other))
    }
    // Hex colours and numbers only (checked by the config check); < is
    // escaped anyway, so the text can't end the <style> tag
    return rules.join('\n').replace(/</g, '\\3c ')
}

// data-theme on <html> as rendered by the server: the mode for a fixed mode
// or a default of 'light' or 'dark'; none for 'system' (the stylesheet
// follows the device until a choice is saved)
export function serverThemeAttribute(mode) {
    const modes = colorModes(mode)
    if (modes.length === 1) return modes[0]
    return mode?.default === 'system' ? undefined : defaultColorMode(mode)
}

// '#9ca3af' -> '156 163 175', '#fff' -> '255 255 255'
export function hexToChannels(hex) {
    return hexToRgb(hex).join(' ')
}

// On <body>, next to the font classes (which define --font-inter etc.):
// { '--font-body': 'var(--font-inter)', '--font-heading': 'var(--font-inter)' }
export function fontVariables(theme) {
    return {
        '--font-body': `var(--font-${theme.fonts.body})`,
        '--font-heading': `var(--font-${theme.fonts.heading})`,
    }
}

// ─── Contrast ─────────────────────────────────────────────

// Contrast ratio of two hex colours as defined by WCAG 2: from 1 (the same
// colour) to 21 (black on white). E.g. contrastRatio('#6b7280', '#fff')
// is about 4.83.
export function contrastRatio(a, b) {
    const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (lighter + 0.05) / (darker + 0.05)
}

// Relative luminance (WCAG 2), 0 for black to 1 for white
function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map((channel) => {
        const value = channel / 255
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// '#9ca3af' -> [156, 163, 175], '#fff' -> [255, 255, 255]
function hexToRgb(hex) {
    let digits = hex.replace('#', '')
    if (digits.length === 3) digits = [...digits].map(d => d + d).join('')
    return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16))
}

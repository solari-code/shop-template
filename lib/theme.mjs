// Light and dark mode in the browser: the visitor's saved choice. Plain
// functions, safe on the server, in the browser and in Node (tests). The
// settings are theme.mode in config/theme.mjs; the palettes and the
// stylesheet are in lib/config/theme.mjs.

// localStorage key of the visitor's choice: 'light' or 'dark'. Only saved
// when the visitor uses the switcher, and only read while the switcher is
// on (config/theme.mjs).
export const THEME_STORAGE_KEY = 'shop-theme'

// The saved choice, or null if there is none (or it was edited by hand).
// The pre-paint script (lib/prepaint.mjs) accepts the same values.
export function savedColorMode(value) {
    return value === 'light' || value === 'dark' ? value : null
}

// The mode the page shows: the saved choice, else the default mode, or for
// 'system' the device setting (systemPrefersDark). The same result as the
// theme stylesheet (lib/config/theme.mjs) with data-theme as set by
// themeAttribute below.
export function resolveColorMode({ saved, defaultMode, systemPrefersDark }) {
    if (saved) return saved
    if (defaultMode === 'system') return systemPrefersDark ? 'dark' : 'light'
    return defaultMode === 'dark' ? 'dark' : 'light'
}

// data-theme on <html> for a saved choice (or null): the choice, else the
// default mode as rendered by the server; null (no attribute) for 'system',
// so the stylesheet follows the device again
export function themeAttribute({ saved, defaultMode }) {
    if (saved) return saved
    return defaultMode === 'light' || defaultMode === 'dark' ? defaultMode : null
}

// The mode the switcher changes to
export function otherColorMode(mode) {
    return mode === 'dark' ? 'light' : 'dark'
}

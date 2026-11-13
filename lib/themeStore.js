import { useSyncExternalStore } from 'react'
import { themeConfig } from '@/config/theme.mjs'
import { THEME_STORAGE_KEY, savedColorMode, resolveColorMode, themeAttribute } from '@/lib/theme.mjs'

// The light or dark mode in the browser, for the switcher
// (components/ThemeSwitcher.jsx). The rules are in lib/theme.mjs.
//
// The page itself never waits for this: the theme stylesheet and the
// pre-paint script (lib/prepaint.mjs) show the right mode from the first
// frame. This store knows the current mode for the switcher, saves the
// visitor's choice in localStorage and sets data-theme on <html>.

const defaultMode = themeConfig.mode.default
const listeners = new Set()

// The saved choice; read from localStorage on first use. Kept here too, so
// the switcher also works when the browser doesn't allow storage.
let saved

function readSaved() {
    try {
        return savedColorMode(window.localStorage.getItem(THEME_STORAGE_KEY))
    } catch {
        return null
    }
}

function currentSaved() {
    if (saved === undefined) saved = readSaved()
    return saved
}

// The device setting, as one shared object: its change listeners stay
// active as long as it exists
let query
function systemQuery() {
    if (query === undefined) {
        query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null
    }
    return query
}

function getSnapshot() {
    return resolveColorMode({ saved: currentSaved(), defaultMode, systemPrefersDark: systemQuery()?.matches === true })
}

function subscribe(listener) {
    listeners.add(listener)
    // Without a saved choice, 'system' follows changes of the device setting
    systemQuery()?.addEventListener?.('change', listener)
    return () => {
        listeners.delete(listener)
        systemQuery()?.removeEventListener?.('change', listener)
    }
}

function update() {
    const value = themeAttribute({ saved: currentSaved(), defaultMode })
    withoutTransitions(() => {
        if (value) document.documentElement.setAttribute('data-theme', value)
        else document.documentElement.removeAttribute('data-theme')
    })
    listeners.forEach(listener => listener())
}

// Switches all colours at once: elements with a colour transition (buttons,
// the header) would otherwise fade one after another
function withoutTransitions(change) {
    const style = document.createElement('style')
    style.textContent = '*,*::before,*::after{transition:none!important}'
    document.head.appendChild(style)
    change()
    // Applies the new colours before the transitions are back
    window.getComputedStyle(document.body).color
    window.requestAnimationFrame(() => style.remove())
}

// Saves the visitor's choice ('light' or 'dark') and shows it
export function setColorMode(mode) {
    saved = savedColorMode(mode)
    try {
        if (saved) window.localStorage.setItem(THEME_STORAGE_KEY, saved)
    } catch {
        // Not saved (e.g. storage blocked): the choice lasts until the page is left
    }
    update()
}

// A choice made in another tab shows up in this one too
if (typeof window !== 'undefined' && themeConfig.mode.switcher) {
    window.addEventListener('storage', (event) => {
        // key is null when the whole storage was cleared
        if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
        saved = readSaved()
        update()
    })
}

// The mode the page shows: 'light' or 'dark'; undefined while the page
// hydrates (the server can't know it), like lib/useStoredValue.js
export function useColorMode() {
    return useSyncExternalStore(subscribe, getSnapshot, () => undefined)
}

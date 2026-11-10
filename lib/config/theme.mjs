// CSS variables for the theme (config/theme.mjs), set by the root layout.
// Tailwind's brand-* colours and the overlays in app/globals.css use them.

// On <html>: colours (as hex and as RGB channels, for Tailwind colours with
// an opacity like bg-brand-surface/90) and overlay strengths
// { '--color-surface': '#ffffff', '--color-surface-rgb': '255 255 255', ...,
//   '--overlay-hero': '35%', ... }
export function themeVariables(theme) {
    const colors = Object.entries(theme.colors).flatMap(([name, value]) => [
        [`--color-${name}`, value],
        [`--color-${name}-rgb`, hexToChannels(value)],
    ])
    const overlays = Object.entries(theme.overlays).map(([name, value]) => [`--overlay-${name}`, `${value}%`])
    return Object.fromEntries([...colors, ...overlays])
}

// '#9ca3af' -> '156 163 175', '#fff' -> '255 255 255'
export function hexToChannels(hex) {
    let digits = hex.replace('#', '')
    if (digits.length === 3) digits = [...digits].map(d => d + d).join('')
    return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16)).join(' ')
}

// On <body>, next to the font classes (which define --font-inter etc.):
// { '--font-body': 'var(--font-inter)', '--font-heading': 'var(--font-inter)' }
export function fontVariables(theme) {
    return {
        '--font-body': `var(--font-${theme.fonts.body})`,
        '--font-heading': `var(--font-${theme.fonts.heading})`,
    }
}

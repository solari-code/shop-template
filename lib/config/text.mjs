// Placeholders in config texts, e.g. 'Thank you for your order at {shopName}!'.
// Plain functions, safe to use on the server, in the browser and in Node.

// Placeholders every config text can use
export const TEXT_PLACEHOLDERS = ['shopName', 'ownerName', 'ownerFirstName', 'shopEmail', 'tagline']

export function textValues(site) {
    return {
        shopName: site.name,
        ownerName: site.owner?.name,
        ownerFirstName: site.owner?.firstName,
        shopEmail: site.contact?.email,
        tagline: site.tagline,
    }
}

// Names of the placeholders used in a text: 'Hi {customerName}' -> ['customerName']
export function placeholdersIn(text) {
    return [...String(text ?? '').matchAll(/\{(\w+)\}/g)].map(m => m[1])
}

// Replaces {name} with values.name. Unknown placeholders are left as they
// are (the config check reports them).
export function fillText(text, values) {
    return String(text ?? '').replace(/\{(\w+)\}/g, (match, name) =>
        values[name] !== undefined && values[name] !== null ? String(values[name]) : match
    )
}

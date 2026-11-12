// Optional features and their pages. Plain functions, safe on the server,
// in the browser and in Node.
//
// A page of a feature that is off doesn't exist: the config check reports
// links to it, and the side menu hides them.

// Page -> the feature it belongs to (a config section with `enabled`)
export const FEATURE_ROUTES = {
    '/wishlist': 'wishlist',
}

// The features that are on, from the config: { wishlist: true, ... }
export function enabledFeatures(config) {
    return Object.fromEntries(
        [...new Set(Object.values(FEATURE_ROUTES))].map(feature => [feature, config?.[feature]?.enabled === true])
    )
}

// The feature a link belongs to ('/wishlist', '/wishlist?x' -> 'wishlist'),
// or null for other links
export function featureOfHref(href) {
    if (typeof href !== 'string' || !href.startsWith('/')) return null
    const pathname = href.split(/[?#]/)[0]
    return FEATURE_ROUTES[pathname] ?? null
}

// False if the link leads to a page of a feature that is off
export function isHrefAvailable(href, features) {
    const feature = featureOfHref(href)
    return feature === null || features[feature] === true
}

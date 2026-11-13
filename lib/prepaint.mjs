// The pre-paint scripts: small inline scripts that apply what is saved in
// the browser before the page is drawn, so nothing flickers.
// - prepaintScript: the cart and wishlist state (header badges, hearts)
// - themePrepaintScript: the light or dark mode the visitor chose
//
// ─── Cart and wishlist ────────────────────────────────────
//
// Shows the saved cart and wishlist state from the first frame, so the
// header badges and the wishlist hearts don't flicker.
//
// The cart and the wishlist are saved in the browser, so the server renders
// the pages without them, and React can only show them after hydration. This
// small inline script runs before the page content is parsed: it reads
// localStorage and adds CSS that shows the badge counts and fills the saved
// hearts. Once React renders the real state, each element gets a data-count
// or data-saved attribute and the CSS no longer applies to it (see
// "SAVED STATE" in app/globals.css and lib/useStoredValue.js).
//
// It counts the same way as the shop: cartItemCount (lib/cartStore.js) and
// cleanWishlist (lib/wishlist.mjs); tests/prepaint.test.mjs checks this.

// Runs in the browser as an inline script. Written without modern syntax
// and without outside references, because it is inserted as text.
function prepaint(options) {
    try {
        var css = ''

        var savedItems = function (key) {
            var data = null
            try {
                data = JSON.parse(window.localStorage.getItem(key))
            } catch (e) {
                return []
            }
            var items = data && data.state && data.state.items
            return Array.isArray(items) ? items : []
        }

        // Shows the count on a badge that React hasn't rendered yet
        var badge = function (name, count) {
            if (!(count > 0)) return
            var selector = '.count-badge[data-count-badge="' + name + '"]:not([data-count])'
            css += selector + '{display:flex}' + selector + '::after{content:"' + count + '"}'
        }

        var cartCount = 0
        savedItems(options.cartKey).forEach(function (item) {
            cartCount += (item && Number(item.quantity)) || 0
        })
        badge('cart', cartCount)

        if (options.wishlistKey) {
            var ids = []
            savedItems(options.wishlistKey).forEach(function (item) {
                var id = item && item.productId
                if (typeof id !== 'string' || id.trim() === '' || id.length > 200) return
                if (ids.indexOf(id) === -1 && ids.length < options.wishlistMaxItems) ids.push(id)
            })
            badge('wishlist', ids.length)

            // Fills the hearts of saved products. IDs with other characters
            // than letters, digits, _ and - are left out (they can't break
            // the CSS); their hearts fill after hydration.
            var hearts = []
            ids.forEach(function (id) {
                if (/^[\w-]+$/.test(id)) hearts.push('[data-wishlist-id="' + id + '"]:not([data-saved]) .wishlist-heart-fill')
            })
            if (hearts.length) css += hearts.join(',') + '{opacity:1}'
        }

        if (css) {
            var style = document.createElement('style')
            style.setAttribute('data-prepaint', '')
            style.textContent = css
            document.head.appendChild(style)
        }
    } catch (e) {
        // Without storage access the page simply renders without the saved
        // state until hydration
    }
}

// The script for a <script> tag.
// cartKey, wishlistKey: the localStorage keys; wishlistKey is left out when
// the wishlist is off. wishlistMaxItems: wishlistConfig.maxItems.
export function prepaintScript({ cartKey, wishlistKey = null, wishlistMaxItems = 0 }) {
    const options = JSON.stringify({ cartKey, wishlistKey, wishlistMaxItems })
    // < is escaped so the options can't end the <script> tag
    return `(${prepaint.toString()})(${options.replace(/</g, '\\u003c')})`
}

// ─── Light and dark mode ──────────────────────────────────
//
// The stylesheet of the theme shows the default mode, or follows the
// device for 'system' (lib/config/theme.mjs). When the visitor has chosen a
// mode with the switcher, this script sets it as data-theme on <html>
// before the page is drawn. It runs in <head> (app/layout.js) and only
// when the switcher is on, so a fixed mode ignores old saved choices.
// It accepts the same values as savedColorMode (lib/theme.mjs).

// Runs in the browser as an inline script, like prepaint above
function applySavedTheme(storageKey) {
    try {
        var mode = window.localStorage.getItem(storageKey)
        if (mode === 'light' || mode === 'dark') document.documentElement.setAttribute('data-theme', mode)
    } catch (e) {
        // Without storage access the default mode is shown
    }
}

// The script for a <script> tag. storageKey: THEME_STORAGE_KEY (lib/theme.mjs)
export function themePrepaintScript({ storageKey }) {
    return `(${applySavedTheme.toString()})(${JSON.stringify(storageKey).replace(/</g, '\\u003c')})`
}

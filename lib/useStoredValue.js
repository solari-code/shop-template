import { useSyncExternalStore } from 'react'

// Reads a value from a store that is saved in the browser (the cart and
// the wishlist), e.g. the number of items for a header badge.
//
// Returns undefined while the page hydrates: the server can't know what is
// saved in the browser, so the first render has to match the server HTML.
// Right after that it returns the saved value. Until then the pre-paint
// script (lib/prepaint.mjs) shows the saved state with CSS, so the badges
// and hearts don't flicker.
//
// selector must return a plain value (number, boolean, string) or a part of
// the state that only changes when the state does (e.g. state.items).
export function useStoredValue(store, selector) {
    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => undefined,
    )
}

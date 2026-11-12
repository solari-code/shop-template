import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    WISHLIST_STORAGE_KEY,
    addToWishlist,
    removeFromWishlist,
    toggleInWishlist,
    setWishlistSize,
    refreshWishlist,
    cleanWishlist,
} from '@/lib/wishlist.mjs'
import { wishlistConfig } from '@/config/wishlist.mjs'
import { useStoredValue } from '@/lib/useStoredValue'

const { maxItems } = wishlistConfig

// Wishlist state, stored in the browser (localStorage). The entries and
// the rules for changing them are in lib/wishlist.mjs.

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            items: [],

            // product: as returned by the product queries (productId, slug,
            // title, images). variantId: the size chosen when saving, if any.
            add: (product, { variantId } = {}) => set({ items: addToWishlist(get().items, product, { maxItems, variantId }) }),

            remove: (productId) => set({ items: removeFromWishlist(get().items, productId) }),

            // Returns true if the product is saved afterwards
            toggle: (product, { variantId } = {}) => {
                const items = toggleInWishlist(get().items, product, { maxItems, variantId })
                set({ items })
                return items.some(item => item.productId === product?.productId)
            },

            // Remembers the size chosen for a saved product (does nothing
            // if the product is not saved)
            setSize: (productId, variantId) => {
                const items = setWishlistSize(get().items, productId, variantId)
                if (items !== get().items) set({ items })
            },

            // Updates the saved titles, links and images from current
            // product data (the wishlist page does this after loading)
            refresh: (products) => {
                const items = refreshWishlist(get().items, products)
                if (items !== get().items) set({ items })
            },
        }),
        {
            name: WISHLIST_STORAGE_KEY,
            version: 1,
            partialize: (state) => ({ items: state.items }),
            // Data in localStorage can be old or edited by hand
            merge: (persisted, current) => ({ ...current, items: cleanWishlist(persisted?.items, { maxItems }) }),
        }
    )
)

// Changes made in another tab show up in this one too
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        // key is null when the whole storage was cleared
        if (event.key === WISHLIST_STORAGE_KEY || event.key === null) useWishlistStore.persist.rehydrate()
    })
}

// True if the product is in the wishlist; undefined while the page
// hydrates (see lib/useStoredValue.js)
export function useIsInWishlist(productId) {
    return useStoredValue(useWishlistStore, state => state.items.some(item => item.productId === productId))
}

// The saved entries (newest first); undefined while the page hydrates
export function useWishlistItems() {
    return useStoredValue(useWishlistStore, state => state.items)
}

// Number of saved products; undefined while the page hydrates
export function useWishlistCount() {
    return useStoredValue(useWishlistStore, state => state.items.length)
}

// Cart helpers without React, safe on the server, in the browser and in
// Node (tests). The cart state itself is lib/cartStore.js.

// localStorage key of the cart
export const CART_STORAGE_KEY = 'shop-cart'

// Number of items in the cart (the header badge). The pre-paint script
// (lib/prepaint.mjs) counts the same way.
export function cartItemCount(items) {
    return items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
}

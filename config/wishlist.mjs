// Wishlist: customers can save products for later with a heart button.
// No account needed: the wishlist is stored in the customer's browser.
//
// The page title and banner are in config/pages.mjs (`wishlist`), the
// texts in config/texts.mjs (`wishlist`).

export const wishlistConfig = {
    // Turns the whole feature on or off: the hearts, the header icon, the
    // menu link and the /wishlist page (which returns "not found" when off).
    enabled: true,

    // Heart icon with the number of saved products in the header, next to
    // the cart icon
    showInHeader: true,
    // Heart button on the product cards of the product list
    showOnProductCards: true,
    // Heart button on the product page, next to "Add to cart"
    showOnProductPage: true,

    // Remove a product from the wishlist when it is moved to the cart from
    // the wishlist page
    removeAfterMoveToCart: true,

    // Most products a wishlist can hold (1 to 500). Saving one more drops
    // the oldest saved product.
    maxItems: 100,
}

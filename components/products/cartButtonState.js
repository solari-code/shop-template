// State of a button that puts a product into the cart, shared by "Add to
// cart" on the product page and "Move to cart" on the wishlist, so both
// follow the same stock rules and show the same messages.
//
// product: as returned by the product queries; variant: the chosen size (or
// null); cartItems: the items in the cart.
// Returns { disabled, message }: message explains why the button is
// disabled, or is null when the product can be added.
export function cartButtonState({ product, variant, cartItems }) {
    const soldOut = product.variants?.every(v => v.stock === 0 || !v.active);

    const cartItem = cartItems.find(
        i => i.productId === product.productId && i.variantId === variant?.variantId
    );
    const allStockInCart = cartItem ? cartItem.quantity >= variant?.stock : false;

    const message = soldOut
        ? "Sold out"
        : !variant
            ? "Select a size"
            : allStockInCart
                ? "All available stock is already in your cart"
                : null;

    return { soldOut, disabled: !variant || allStockInCart || soldOut, message };
}

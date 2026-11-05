// components/products/AddToCartButton.jsx
"use client";

import { useCartStore } from "@/lib/cartStore";

export default function AddToCartButton({ product, selectedSize }) {
    const { items, addItem } = useCartStore();

    const allOutOfStock = product.variants?.every(v => v.stock === 0 || !v.active);

    const cartItem = items.find(
        i => i.productId === product.productId && i.variantId === selectedSize?.variantId
    );
    const quantityInCart = cartItem?.quantity ?? 0;
    const isMaxStock = cartItem ? quantityInCart >= selectedSize?.stock : false;

    const buttonLabel = allOutOfStock
        ? "Sold out"
        : !selectedSize
            ? "Select a size"
            : isMaxStock
                ? "All available stock is already in your cart"
                : "Add to cart";

    const handleAddToCart = () => {
        if (!selectedSize || isMaxStock || allOutOfStock) return;
        addItem(product, selectedSize);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={!selectedSize || isMaxStock || allOutOfStock}
            className={`w-full py-3 font-light text-sm uppercase tracking-widest transition-colors duration-200 disabled:cursor-not-allowed
                ${allOutOfStock
                    ? "border border-brand-base-300 text-brand-content/30 bg-transparent"
                    : "border border-brand-content bg-brand-content text-white hover:bg-transparent hover:text-brand-content disabled:opacity-40"
                }`}
        >
            {buttonLabel}
        </button>
    );
}
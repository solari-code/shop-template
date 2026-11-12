// components/products/AddToCartButton.jsx
"use client";

import { useCartStore } from "@/lib/cartStore";
import { cartButtonState } from "../cartButtonState";

export default function AddToCartButton({ product, selectedSize }) {
    const { items, addItem } = useCartStore();

    const { soldOut, disabled, message } = cartButtonState({ product, variant: selectedSize, cartItems: items });

    const handleAddToCart = () => {
        if (disabled) return;
        addItem(product, selectedSize);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled}
            className={`w-full py-3 font-light text-sm uppercase tracking-widest transition-colors duration-200 disabled:cursor-not-allowed
                ${soldOut
                    ? "border border-brand-base-300 bg-transparent"
                    : "border border-brand-content bg-brand-content text-brand-content-inverse hover:bg-transparent hover:text-brand-content disabled:opacity-40"
                }`}
        >
            {message ?? "Add to cart"}
        </button>
    );
}

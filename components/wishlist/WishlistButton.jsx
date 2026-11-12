"use client";

import HeartIcon from "./HeartIcon";
import { useIsInWishlist, useWishlistStore } from "@/lib/wishlistStore";
import { wishlistConfig } from "@/config/wishlist.mjs";
import { textsConfig } from "@/config/texts.mjs";
import { shopText } from "@/lib/config/shop.mjs";

const STYLES = {
    // Round button on the product image (product cards)
    card: "w-9 h-9 rounded-full bg-brand-surface/80 backdrop-blur-sm shadow-sm hover:bg-brand-surface",
    // Square button next to "Add to cart" (product page)
    page: "w-12 self-stretch border border-brand-content hover:bg-brand-base-300",
};
const ICON_SIZES = { card: "w-5 h-5", page: "w-6 h-6" };

// Heart that saves a product to the wishlist or removes it.
// product: as returned by the product queries; variant: "card" or "page".
// variantId: the size chosen on the page, remembered for the wishlist.
export default function WishlistButton({ product, variant = "card", variantId = null, className = "" }) {
    // undefined while the page hydrates; the pre-paint script fills the
    // heart meanwhile (lib/prepaint.mjs)
    const saved = useIsInWishlist(product?.productId);
    const toggle = useWishlistStore((state) => state.toggle);

    if (!wishlistConfig.enabled || !product?.productId) return null;

    const label = shopText(saved ? textsConfig.wishlist.remove : textsConfig.wishlist.save);

    return (
        <button
            type="button"
            onClick={() => toggle(product, { variantId })}
            data-wishlist-id={product.productId}
            data-saved={saved === undefined ? undefined : String(saved)}
            aria-label={label}
            title={label}
            className={`flex items-center justify-center shrink-0 text-brand-content transition-colors duration-200 active:scale-90 ${STYLES[variant]} ${className}`}
        >
            <HeartIcon className={ICON_SIZES[variant]} />
        </button>
    );
}

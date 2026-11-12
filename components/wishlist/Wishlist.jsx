"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/products/PLP/ProductCard";
import SizeSelector from "@/components/products/PDP/SizeSelector";
import MultilineText from "@/components/MultilineText";
import { cartButtonState } from "@/components/products/cartButtonState";
import { useWishlistProducts } from "./useWishlistProducts";
import { useWishlistItems, useWishlistStore } from "@/lib/wishlistStore";
import { useCartStore } from "@/lib/cartStore";
import { imageUrl } from "@/lib/imageUrl";
import { preselectedVariant } from "@/lib/wishlist.mjs";
import { shopText, isOneSize } from "@/lib/config/shop.mjs";
import { textsConfig } from "@/config/texts.mjs";
import { pagesConfig } from "@/config/pages.mjs";
import { wishlistConfig } from "@/config/wishlist.mjs";

const texts = textsConfig.wishlist;
const GRID = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10";

// The wishlist page: the saved products as cards, with their current
// prices and stock. Products can be moved to the cart (with a size) or
// removed; products that are no longer in the shop are shown greyed out.
export default function Wishlist() {
    // undefined while the page hydrates
    const items = useWishlistItems();
    const { products, status, retry } = useWishlistProducts(items);
    // The last product moved to the cart: { title, count } (count
    // re-announces the message when the same title is moved again)
    const [moved, setMoved] = useState(null);

    const handleMoved = (title) => setMoved((previous) => ({ title, count: (previous?.count ?? 0) + 1 }));

    const hasItems = items !== undefined && items.length > 0;

    return (
        <div>
            {hasItems && (
                <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
                    <Link href="/products" className="hover:text-brand-content transition-colors">
                        Products
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-brand-content">{shopText(pagesConfig.wishlist.title)}</span>
                </nav>
            )}

            {/* Announced by screen readers when a product is moved; stays in
                place when the last product is moved and the wishlist is empty */}
            <div role="status" aria-live="polite">
                {moved && <MovedNotice key={moved.count} title={moved.title} />}
            </div>

            {items === undefined ? (
                <div className="min-h-[40vh]" />
            ) : !hasItems ? (
                <EmptyWishlist />
            ) : (
                <>
                    {status === "error" && <LoadError onRetry={retry} />}

                    <div className={GRID} aria-busy={status === "loading"}>
                        {items.map((item) => {
                            const product = products.get(item.productId);
                            if (product === undefined) {
                                // Not loaded (yet)
                                return status === "error" ? null : <LoadingCard key={item.productId} />;
                            }
                            if (product === null) return <UnavailableCard key={item.productId} item={item} />;
                            return <WishlistCard key={item.productId} item={item} product={product} onMoved={handleMoved} />;
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// A saved product with its size choice and the "Move to cart" button.
// item: the wishlist entry; product: its current product data.
function WishlistCard({ item, product, onMoved }) {
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const remove = useWishlistStore((state) => state.remove);
    const setSize = useWishlistStore((state) => state.setSize);

    // The size chosen on the product page or here (remembered in the
    // wishlist), or the only size of the product
    const variant = preselectedVariant(product, item.variantId);
    const activeVariants = product.variants?.filter((v) => v.active === true) ?? [];
    // No size choice for one-size products (e.g. accessories)
    const showSizes = activeVariants.length > 1 || (activeVariants.length === 1 && !isOneSize(activeVariants[0].size));

    const { soldOut, disabled, message } = cartButtonState({ product, variant, cartItems });

    const moveToCart = () => {
        if (disabled) return;
        addItem(product, variant);
        if (wishlistConfig.removeAfterMoveToCart) remove(product.productId);
        onMoved(product.title);
    };

    return (
        <ProductCard product={product} showWishlistButton>
            <div className="mt-auto pt-4 space-y-3">
                {showSizes && (
                    <SizeSelector variants={product.variants} value={variant} onChange={(v) => setSize(product.productId, v.variantId)} compact />
                )}
                <button
                    type="button"
                    onClick={moveToCart}
                    disabled={disabled}
                    className={`w-full py-2.5 px-2 font-light text-xs uppercase tracking-widest transition-colors duration-200 disabled:cursor-not-allowed
                        ${soldOut
                            ? "border border-brand-base-300 bg-transparent"
                            : "border border-brand-content bg-brand-content text-brand-content-inverse hover:bg-transparent hover:text-brand-content disabled:opacity-40"
                        }`}
                >
                    {message ?? shopText(texts.moveToCart)}
                </button>
            </div>
        </ProductCard>
    );
}

// A saved product that is no longer in the shop (hidden or deleted), shown
// greyed out with what was saved of it
function UnavailableCard({ item }) {
    const remove = useWishlistStore((state) => state.remove);
    const url = imageUrl(item.image, { width: 600, quality: 80 });

    return (
        <div className="flex flex-col text-brand-content">
            <div className="opacity-50 grayscale">
                <div className="relative aspect-[3/4] bg-brand-base-300 overflow-hidden mb-3">
                    {url && (
                        <Image
                            src={url}
                            alt={item.title ?? ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    )}
                </div>
                {item.title && (
                    <h3 className="font-heading font-light text-lg md:text-xl tracking-tight text-center">
                        {item.title}
                    </h3>
                )}
            </div>
            <p className="font-light text-xs uppercase tracking-widest text-center mt-1">
                {shopText(texts.unavailable)}
            </p>
            <div className="mt-auto pt-4">
                <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="w-full py-2.5 px-2 font-light text-xs uppercase tracking-widest border border-brand-content text-brand-content hover:bg-brand-content hover:text-brand-content-inverse transition-colors duration-200"
                >
                    {shopText(texts.remove)}
                </button>
            </div>
        </div>
    );
}

// Placeholder while a saved product is loading
function LoadingCard() {
    return (
        <div className="animate-pulse" aria-hidden="true">
            <div className="aspect-[3/4] bg-brand-base-300 mb-3" />
            <div className="h-5 w-2/3 mx-auto bg-brand-base-300" />
            <div className="h-4 w-1/4 mx-auto mt-2 bg-brand-base-300" />
        </div>
    );
}

function MovedNotice({ title }) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border border-brand-base-300 bg-brand-base-200 px-5 py-4 text-sm font-light">
            <span>{shopText(texts.movedToCart, { productTitle: title })}</span>
            <Link href="/cart" className="underline hover:text-brand-content transition-colors">
                {shopText(texts.viewCart)}
            </Link>
        </div>
    );
}

function LoadError({ onRetry }) {
    return (
        <div role="alert" className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border border-red-200 bg-red-50 text-red-800 px-5 py-4 text-sm font-light">
            <span>Your saved products could not be loaded.</span>
            <button type="button" onClick={onRetry} className="underline">
                Try again
            </button>
        </div>
    );
}

function EmptyWishlist() {
    return (
        <div className="flex flex-col items-center text-center">
            <p className="text-lg mb-6">
                <MultilineText text={shopText(texts.empty)} />
            </p>
            <Link
                href="/products"
                className="inline-block font-light text-xs uppercase tracking-widest border border-brand-content text-brand-content px-6 py-3 hover:bg-brand-content hover:text-brand-base-100 transition-colors duration-200"
            >
                {shopText(texts.emptyLink)}
            </Link>
        </div>
    );
}

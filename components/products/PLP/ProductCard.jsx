"use client";

import Image from "next/image";
import Link from "next/link";
import { imageUrl as getImageUrl } from "@/lib/imageUrl";
import { formatPrice } from "@/utils/formatPrice";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { wishlistConfig } from "@/config/wishlist.mjs";

// showWishlistButton: show the heart; defaults to showOnProductCards
// (config/wishlist.mjs). The wishlist page always shows it, to remove
// products. children: shown below the card, outside the link (e.g. the
// move-to-cart controls of the wishlist).
export default function ProductCard({ product, showWishlistButton = wishlistConfig.showOnProductCards, children }) {
    const showWishlist = wishlistConfig.enabled && showWishlistButton;
    const firstImage = product.images?.[0];
    const imageUrl = getImageUrl(firstImage, { width: 600, quality: 80 });
    const hasDiscount = !!product.discountedPrice;

    // The heart sits next to the link, not inside it (a button can't be
    // part of a link), and is placed over the image.
    return (
        <div className="group relative flex flex-col text-brand-content">
            <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-brand-base-300 overflow-hidden mb-3">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-content-subtle text-sm font-light">
                            No image
                        </div>
                    )}
                </div>
                <h3 className="font-heading font-light text-brand-content text-lg md:text-xl tracking-tight text-center">
                    {product.title}
                </h3>
                <div className="flex gap-2 justify-center items-center mt-0.5">
                    <p className="font-sans font-light text-sm">
                        {formatPrice(hasDiscount ? product.discountedPrice : product.price)}
                    </p>
                    {hasDiscount && (
                        <p className="font-sans font-light text-sm line-through">
                            {formatPrice(product.price)}
                        </p>
                    )}
                </div>
            </Link>
            {showWishlist && (
                <WishlistButton product={product} variant="card" className="absolute top-2 right-2" />
            )}
            {children}
        </div>
    );
}

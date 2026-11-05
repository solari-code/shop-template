"use client";

import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/client";
import { formatPrice } from "@/utils/formatPrice";

export default function ProductCard({ product }) {
    const firstImage = product.images?.[0];
    const imageUrl = firstImage ? urlFor(firstImage).width(600).quality(80).url() : null;
    const hasDiscount = !!product.discountedPrice;

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block text-brand-content"
        >
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-light">
                        No image
                    </div>
                )}
            </div>
            <h3 className="font-sans font-light text-brand-content text-lg md:text-xl tracking-tight text-center">
                {product.title}
            </h3>
            <div className="flex gap-2 justify-center items-center mt-0.5">
                <p className="font-sans font-light text-brand-content/80 text-sm">
                    {formatPrice(hasDiscount ? product.discountedPrice : product.price)}
                </p>
                {hasDiscount && (
                    <p className="font-sans font-light text-brand-content/40 text-sm line-through">
                        {formatPrice(product.price)}
                    </p>
                )}
            </div>
        </Link>
    );
}
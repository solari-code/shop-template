"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import SizeSelector from "./SizeSelector";
import AddToCartButton from "./AddToCartButton";
import { textsConfig } from "@/config/texts.mjs";
import { shopText, contactHref } from "@/lib/config/shop.mjs";

export default function ProductPDPInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div className="space-y-6 font-sans font-light text-brand-content">
      <h1 className="font-light text-2xl md:text-3xl tracking-wide">
        {product.title}
      </h1>

      <div className="flex items-center gap-3">
        <span className="font-light text-xl">
          {formatPrice(product.discountedPrice ?? product.price)}
        </span>
        {product.discountedPrice && (
          <span className="font-light text-base line-through">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {product.description && (
        <p className="font-light text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      )}

      {product.variants?.some((v) => v.active) && (
        <>
          <hr className="border-brand-base-300" />
          <SizeSelector
            variants={product.variants}
            value={selectedSize}
            onChange={setSelectedSize}
          />
        </>
      )}

      <hr className="border-brand-base-300" />

      <AddToCartButton product={product} selectedSize={selectedSize} />

      <p className="text-sm text-center">
        {shopText(textsConfig.sizeHelp)}{" "}
        <Link href={contactHref} className="underline hover:text-brand-content transition-colors">
          {shopText(textsConfig.contactLink)}
        </Link>
      </p>
    </div>
  );
}
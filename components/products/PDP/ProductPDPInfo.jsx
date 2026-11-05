"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import SizeSelector from "./SizeSelector";
import { useCartStore } from "@/lib/cartStore";
import AddToCartButton from "./AddToCartButton";

export default function ProductPDPInfo({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const { items, addItem } = useCartStore();

  const cartItem = items.find(
    i => i.productId === product.productId && i.variantId === selectedSize?.variantId
  );
  const quantityInCart = cartItem?.quantity ?? 0;
  const isMaxStock = cartItem ? quantityInCart >= selectedSize?.stock : false;

  const buttonLabel = !selectedSize
    ? "Select a size"
    : isMaxStock
      ? "All available stock is already in your cart"
      : "Add to cart";

  const handleAddToCart = () => {
    if (!selectedSize || isMaxStock) return;
    addItem(product, selectedSize);
  };

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
          <span className="font-light text-base line-through text-brand-content/40">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {product.description && (
        <p className="font-light text-sm leading-relaxed text-brand-content/70 whitespace-pre-line">
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

      <p className="text-sm text-brand-content/50 text-center">
        Can't find your size?{" "}
        <Link href="/#contact" className="underline hover:text-brand-content transition-colors">
          Write to me
        </Link>
      </p>
    </div>
  );
}
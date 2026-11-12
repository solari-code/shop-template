"use client";

import { sizeLabel } from "@/lib/config/shop.mjs";

// compact: smaller and centred, for product cards (the wishlist)
export default function SizeSelector({ variants = [], value, onChange, compact = false }) {
  const activeVariants = (variants || []).filter((v) => v.active === true);

  return (
    <div className={compact ? "text-center" : ""}>
      <p className={`font-light text-xs uppercase tracking-widest text-brand-content ${compact ? "mb-2" : "mb-3"}`}>
        Size
      </p>
      <div className={`flex flex-wrap ${compact ? "gap-1.5 justify-center" : "gap-2"}`}>
        {activeVariants.map((variant) => {
          const isSelected = value?.variantId === variant.variantId;
          const outOfStock = variant.stock === 0;

          return (
            <button
              key={variant.variantId ?? variant.size}
              type="button"
              disabled={outOfStock}
              onClick={() => !outOfStock && onChange?.(variant)}
              className={`
                ${compact ? "min-w-[36px] py-1.5 px-2 text-xs" : "min-w-[44px] py-2.5 px-3 text-sm"} font-light border transition-colors duration-200
                ${outOfStock ? "cursor-not-allowed opacity-40 border-brand-base-300 line-through" : "border-brand-content text-brand-content"}
                ${!outOfStock && !isSelected ? "hover:bg-brand-base-300" : ""}
                ${isSelected ? "bg-brand-content text-brand-content-inverse border-brand-content" : ""}
              `}
            >
              {sizeLabel(variant.size)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function SizeSelector({ variants = [], value, onChange }) {
  const activeVariants = (variants || []).filter((v) => v.active === true);

  return (
    <div>
      <p className="font-light text-xs uppercase tracking-widest mb-3 text-brand-content">
        Size
      </p>
      <div className="flex flex-wrap gap-2">
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
                min-w-[44px] py-2.5 px-3 font-light text-sm border transition-colors duration-200
                ${outOfStock ? "cursor-not-allowed opacity-40 border-brand-base-300 text-brand-content/60 line-through" : "border-brand-content text-brand-content"}
                ${!outOfStock && !isSelected ? "hover:bg-brand-base-300" : ""}
                ${isSelected ? "bg-brand-content text-white border-brand-content" : ""}
              `}
            >
              {variant.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

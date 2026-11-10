"use client";

const filterButtonBase = "font-sans font-light text-brand-content border rounded-sm px-4 py-2 transition-colors";
const filterButtonActive = "bg-brand-content text-brand-content-inverse border-brand-content";
const filterButtonInactive = "bg-transparent border-brand-content hover:bg-brand-base-200";

// activeCategories: [{ slug, title }] in the order of config/commerce.mjs
export default function CategoriesFilter({ activeCategories, selectedCategory, onCategoryChange }) {
    if (!activeCategories?.length) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
                type="button"
                onClick={() => onCategoryChange("")}
                className={`${filterButtonBase} ${!selectedCategory ? filterButtonActive : filterButtonInactive}`}
            >
                All
            </button>
            {activeCategories.map(({ slug, title }) => (
                <button
                    type="button"
                    key={slug}
                    onClick={() => onCategoryChange(slug)}
                    className={`${filterButtonBase} ${selectedCategory === slug ? filterButtonActive : filterButtonInactive}`}
                >
                    {title}
                </button>
            ))}
        </div>
    );
}

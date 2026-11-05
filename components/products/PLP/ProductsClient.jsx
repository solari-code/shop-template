"use client";

import { useSearchParams, usePathname } from "next/navigation";
import CategoriesFilter from "./CatgeoriesFilter";
import ProductGrid from "./ProductGrid";

export default function ProductsClient({ products, activeCategories }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedCategory = searchParams.get("category") || "";

    const handleCategoryChange = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.categories?.includes(selectedCategory))
        : products;

    return (
        <>
            <CategoriesFilter
                activeCategories={activeCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
            {filteredProducts.length === 0 ? (
                <p className="font-sans font-light text-gray-500 text-center py-12">
                    {selectedCategory
                        ? "There are no products in this category."
                        : "There are no products at the moment."}
                </p>
            ) : (
                <ProductGrid products={filteredProducts} />
            )}
        </>
    );
}
"use client";

import { useEffect, useState } from "react";
import { getProductsByProductIds } from "@/actions/sanity";
import { useWishlistStore } from "@/lib/wishlistStore";

// Loads the current product data (prices, sizes, stock) of the saved
// products. Products that were already loaded are not loaded again, e.g.
// when one is removed; products saved in another tab are loaded when they
// show up.
//
// items: the wishlist entries, undefined while the page hydrates.
// Returns { products, status, retry }:
// - products: Map of productId -> product, or null if the product is no
//   longer in the shop. Products that are still loading are missing.
// - status: "loading", "error" (retry() tries again) or "ready"
export function useWishlistProducts(items) {
    const [products, setProducts] = useState(() => new Map());
    // The request that failed, so it isn't repeated until retry()
    const [failedRequest, setFailedRequest] = useState(null);
    const refresh = useWishlistStore((state) => state.refresh);

    const missing = (items ?? []).map((item) => item.productId).filter((id) => !products.has(id));
    const request = missing.length ? JSON.stringify(missing) : null;
    const failed = request !== null && request === failedRequest;

    useEffect(() => {
        if (request === null || failed) return;
        let current = true;
        const ids = JSON.parse(request);

        getProductsByProductIds(ids).then(
            (found) => {
                if (!current) return;
                // null: the products could not be loaded (not "unavailable")
                if (found === null) {
                    setFailedRequest(request);
                    return;
                }
                const byId = new Map(found.map((product) => [product.productId, product]));
                setProducts((previous) => {
                    const next = new Map(previous);
                    for (const id of ids) next.set(id, byId.get(id) ?? null);
                    return next;
                });
                // Keeps the saved titles and images up to date, for products
                // that leave the shop later
                refresh(found);
            },
            () => {
                if (current) setFailedRequest(request);
            },
        );
        return () => {
            current = false;
        };
    }, [request, failed, refresh]);

    const status = items === undefined || (request !== null && !failed) ? "loading" : failed ? "error" : "ready";
    return { products, status, retry: () => setFailedRequest(null) };
}

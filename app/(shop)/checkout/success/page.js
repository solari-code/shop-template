"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";
import Success from "@/components/Success";
import PageBanner from "@/components/PageBanner";
import { pageBanner } from "@/lib/config/shop.mjs";

export default function SuccessPage() {
    const clearCart = useCartStore(state => state.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <>
            <PageBanner {...pageBanner("checkoutSuccess")} height="300px" marginTop="72px" />
            <main className="bg-brand-base-100 pt-12 pb-12 flex  justify-center align-center">
                <Success />
            </main>
        </>
    );
}
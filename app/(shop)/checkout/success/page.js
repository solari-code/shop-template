"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";
import Success from "@/components/Success";
import PageBanner from "@/components/PageBanner";

export default function SuccessPage() {
    const clearCart = useCartStore(state => state.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <>
            <PageBanner image="/images/hero_6.jpeg" height="300px" title="Done 🤍" marginTop="72px" overlayOpacity={35} />
            <main className="bg-brand-base-100 pt-12 pb-12 flex  justify-center align-center">
                <Success />
            </main>
        </>
    );
}
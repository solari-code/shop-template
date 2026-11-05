import PageBanner from "@/components/PageBanner";
import Cart from "@/components/Cart";

export const metadata = {
    title: "Cart — Selva Studio",
    description: "Your shopping cart at Selva Studio.",
};

export default function CartPage() {
    return (
        <>
            <PageBanner image="/images/hero_6.jpeg" height="300px" title="Cart" marginTop="72px" overlayOpacity={35} />
            <main className="bg-brand-base-100 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <Cart />
                </div>
            </main>
        </>
    )
}
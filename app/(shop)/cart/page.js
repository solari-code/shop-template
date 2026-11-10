import PageBanner from "@/components/PageBanner";
import Cart from "@/components/Cart";
import { pageMetadata, pageBanner } from "@/lib/config/shop.mjs";

export const metadata = pageMetadata("cart");

export default function CartPage() {
    return (
        <>
            <PageBanner {...pageBanner("cart")} height="300px" marginTop="72px" />
            <main className="bg-brand-base-100 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <Cart />
                </div>
            </main>
        </>
    )
}
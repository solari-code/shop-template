import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import Wishlist from "@/components/wishlist/Wishlist";
import { pageMetadata, pageBanner } from "@/lib/config/shop.mjs";
import { wishlistConfig } from "@/config/wishlist.mjs";

// The page only exists when the wishlist is on (config/wishlist.mjs). Its
// content depends on the visitor's browser, so search engines skip it.
export const metadata = wishlistConfig.enabled
    ? { ...pageMetadata("wishlist"), robots: { index: false, follow: true } }
    : {};

export default function WishlistPage() {
    if (!wishlistConfig.enabled) notFound();

    return (
        <>
            <PageBanner {...pageBanner("wishlist")} height="300px" marginTop="72px" />
            <main className="bg-brand-base-100 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <Wishlist />
                </div>
            </main>
        </>
    );
}

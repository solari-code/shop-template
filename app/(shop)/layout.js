import { getActiveCategories } from "@/actions/sanity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { shopCategories } from "@/lib/config/shop.mjs";
import LocalModeBanner from "@/components/LocalModeBanner";
import PrepaintScript from "@/components/PrepaintScript";
import { isLocalMode } from "@/lib/shopMode";

export default async function ShopLayout({ children }) {

    // Categories that have products, in the order of config/commerce.mjs
    const activeCategories = shopCategories(await getActiveCategories());

    return (
        <>
            {/* Before the header: shows the saved cart and wishlist from the first frame */}
            <PrepaintScript />
            <Header categories={activeCategories} />
            {children}
            <Footer />
            {isLocalMode() && <LocalModeBanner />}
        </>
    );
}
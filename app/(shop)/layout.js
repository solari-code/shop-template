import { getActiveCategories } from "@/actions/sanity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { shopCategories } from "@/lib/config/shop.mjs";
import LocalModeBanner from "@/components/LocalModeBanner";
import { isLocalMode } from "@/lib/shopMode";

export default async function ShopLayout({ children }) {

    // Categories that have products, in the order of config/commerce.mjs
    const activeCategories = shopCategories(await getActiveCategories());

    return (
        <>
            <Header categories={activeCategories} />
            {children}
            <Footer />
            {isLocalMode() && <LocalModeBanner />}
        </>
    );
}
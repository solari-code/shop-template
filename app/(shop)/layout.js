import { getActiveCategories } from "@/actions/sanity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories as allCategories } from "@/sanity/schemaTypes/categories";
import LocalModeBanner from "@/components/LocalModeBanner";
import { isLocalMode } from "@/lib/shopMode";

export default async function ShopLayout({ children }) {

    const activeSlugs = await getActiveCategories();
    const activeCategories = allCategories.filter(c => activeSlugs.includes(c.slug));

    return (
        <>
            <Header categories={activeCategories} />
            {children}
            <Footer />
            {isLocalMode() && <LocalModeBanner />}
        </>
    );
}
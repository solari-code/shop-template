import Header from "@/components/Header";
import PageBanner from "@/components/PageBanner";
import Footer from "@/components/Footer";
import ProductsClient from "@/components/products/PLP/ProductsClient";
import { getProducts, getActiveCategories } from "@/actions/sanity";
import { pageMetadata, pageBanner, shopCategories } from "@/lib/config/shop.mjs";

export const metadata = pageMetadata("products");

export default async function ProductsPage({ searchParams }) {
    const params = await searchParams;
    // const initialCategory = params?.category ?? "";

    const [products, activeSlugs] = await Promise.all([
        getProducts(),
        getActiveCategories(),
    ]);
    // Categories that have products, in the order of config/commerce.mjs
    const activeCategories = shopCategories(activeSlugs);

    return (
        <>
            <PageBanner {...pageBanner("products")} height="300px" marginTop="72px" />
            <main className="bg-brand-base-100 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <ProductsClient
                        products={products}
                        activeCategories={activeCategories}
                    />
                </div>
            </main>
        </>
    );
}
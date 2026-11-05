import Header from "@/components/Header";
import PageBanner from "@/components/PageBanner";
import Footer from "@/components/Footer";
import ProductsClient from "@/components/products/PLP/ProductsClient";
import { getProducts, getActiveCategories } from "@/actions/sanity";

export const metadata = {
    title: "Products — Selva Studio",
    description: "Handmade slow fashion pieces from upcycled fabrics. Selva Studio.",
};

export default async function ProductsPage({ searchParams }) {
    const params = await searchParams;
    // const initialCategory = params?.category ?? "";

    const [products, activeCategories] = await Promise.all([
        getProducts(),
        getActiveCategories(),
    ]);

    return (
        <>
            <PageBanner image="/images/hero_2.jpeg" height="300px" title="Products" marginTop="72px" overlayOpacity={35} />
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
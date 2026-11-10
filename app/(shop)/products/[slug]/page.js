import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/sanity";
import ProductGallery from "@/components/products/PDP/ProductGallery";
import ProductPDPInfo from "@/components/products/PDP/ProductPDPInfo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    // The root layout adds the shop name
    title: product.title,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mt-[72px] bg-brand-base-100 font-sans font-light text-brand-content">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-8 md:py-12">
        <nav
          className="flex items-center gap-2 text-sm mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            href="/products"
            className="hover:text-brand-content transition-colors"
          >
            Products
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-brand-content truncate max-w-[200px] md:max-w-none">
            {product.title}
          </span>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="flex flex-col">
            <ProductGallery images={product.images} title={product.title} />
          </div>
          <div className="flex flex-col">
            <ProductPDPInfo product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}

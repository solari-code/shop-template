import ProductCard from "./ProductCard";

export default function ProductGrid({ products, title }) {
    console.log({ products })

    return (
        <div>
            {title && (
                <h2 className="font-sans font-light text-2xl text-brand-content text-center mb-8">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}

/** All active products for the products grid */
export const PRODUCTS_QUERY = `*[_type == "product" && active == true] | order(_createdAt desc) {
  _id,
  title,
  "handle": slug.current,
  images,
  price,
  discountedPrice,
  categories
}`

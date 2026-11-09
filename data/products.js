// Example products for local mode.
//
// These are shaped like the product documents in Sanity (see
// sanity/schemaTypes/product.js and variant.js), so the shop code treats
// them the same way. Edit freely: changes show up after a page reload.
//
// Differences from real Sanity data:
// - Images carry a local URL (`asset.url`, a path under /public) instead of
//   a reference to a Sanity asset. This matches the shape Sanity returns for
//   a dereferenced asset (`asset->`).
// - Stock here is the starting stock. Sales in local mode are recorded in
//   .local-data/store.json and subtracted from it; delete that folder to
//   reset the stock.
//
// The products cover the cases the shop needs to handle: a sale price, a
// sold-out product, hidden (inactive) sizes, a hidden product, a one-size
// accessory, products in several categories and sizes with a stock of 1.

function image(key, url) {
    return {
        _type: 'image',
        _key: key,
        asset: {
            _type: 'sanity.imageAsset',
            _id: `image-local-${key}`,
            url,
        },
    }
}

function variant(variantId, size, stock, active = true) {
    return {
        _type: 'variant',
        _key: variantId,
        variantId,
        size,
        stock,
        active,
    }
}

export const localProducts = [
    {
        _id: 'local-product-moss-linen-dress',
        _type: 'product',
        _createdAt: '2026-03-01T10:00:00Z',
        productId: 'prod_Mq7kP2xA',
        title: 'Moss Linen Dress',
        slug: { _type: 'slug', current: 'moss-linen-dress' },
        description: 'A loose midi dress cut from a vintage linen tablecloth.\nSoft, breathable and made to be worn all summer.',
        categories: ['dresses'],
        images: [
            image('moss-1', '/images/home/slider/5.jpeg'),
            image('moss-2', '/images/home/slider/9.jpeg'),
            image('moss-3', '/images/about.jpeg'),
        ],
        price: 180,
        variants: [
            variant('var_Ld3nQ8we', 'S', 2),
            variant('var_Ld3nQ8wf', 'M', 1),
            variant('var_Ld3nQ8wg', 'L', 0),
        ],
        active: true,
    },
    {
        _id: 'local-product-terracotta-wrap-skirt',
        _type: 'product',
        _createdAt: '2026-02-26T10:00:00Z',
        productId: 'prod_Tr4pW9sK',
        title: 'Terracotta Wrap Skirt',
        slug: { _type: 'slug', current: 'terracotta-wrap-skirt' },
        description: 'A wrap skirt in warm terracotta cotton, sewn from leftover curtain fabric.\nOn sale: last pieces of this batch.',
        categories: ['skirts'],
        images: [
            image('terracotta-1', '/images/home/slider/10.jpeg'),
            image('terracotta-2', '/images/home/slider/4.jpeg'),
        ],
        price: 120,
        discountedPrice: 95,
        variants: [
            variant('var_Tw2kS7aa', 'XS', 1),
            variant('var_Tw2kS7ab', 'S', 3),
            variant('var_Tw2kS7ac', 'M', 2),
        ],
        active: true,
    },
    {
        _id: 'local-product-forest-corset-top',
        _type: 'product',
        _createdAt: '2026-02-20T10:00:00Z',
        productId: 'prod_Fc8tB3nZ',
        title: 'Forest Corset Top',
        slug: { _type: 'slug', current: 'forest-corset-top' },
        description: 'A structured corset top in deep green, patched together from velvet offcuts.\nOnly one piece per size.',
        categories: ['corsets', 'blouses'],
        images: [
            image('forest-1', '/images/home/slider/11.jpg'),
            image('forest-2', '/images/home/slider/3.jpeg'),
        ],
        price: 140,
        variants: [
            variant('var_Fc1pR4ma', 'S', 1),
            variant('var_Fc1pR4mb', 'M', 1),
        ],
        active: true,
    },
    {
        _id: 'local-product-patchwork-tote-bag',
        _type: 'product',
        _createdAt: '2026-02-14T10:00:00Z',
        productId: 'prod_Pt5bG6hQ',
        title: 'Patchwork Tote Bag',
        slug: { _type: 'slug', current: 'patchwork-tote-bag' },
        description: 'A roomy tote bag made from fabric scraps of past collections. Every bag is different.',
        categories: ['accessories'],
        images: [
            image('tote-1', '/images/home/slider/2.jpeg'),
        ],
        price: 45,
        variants: [
            variant('var_Pt9oS1za', 'One size', 5),
        ],
        active: true,
    },
    {
        _id: 'local-product-sand-wide-leg-pants',
        _type: 'product',
        _createdAt: '2026-02-08T10:00:00Z',
        productId: 'prod_Sw3lH8vD',
        title: 'Sand Wide-Leg Pants',
        slug: { _type: 'slug', current: 'sand-wide-leg-pants' },
        description: 'High-waisted wide-leg pants in sand-coloured cotton twill with a hidden side zip.\nSize XL is paused (inactive) and hidden from the shop.',
        categories: ['pants'],
        images: [
            image('sand-1', '/images/home/slider/6.jpeg'),
            image('sand-2', '/images/home/slider/1.jpg'),
        ],
        price: 130,
        variants: [
            variant('var_Sw6pT2ka', 'M', 2),
            variant('var_Sw6pT2kb', 'L', 2),
            variant('var_Sw6pT2kc', 'XL', 1, false),
        ],
        active: true,
    },
    {
        _id: 'local-product-clay-button-shirt',
        _type: 'product',
        _createdAt: '2026-02-02T10:00:00Z',
        productId: 'prod_Cb2sJ4rM',
        title: 'Clay Button Shirt',
        slug: { _type: 'slug', current: 'clay-button-shirt' },
        description: 'An oversized shirt in clay-coloured poplin with mismatched vintage buttons.\nSold out in all sizes.',
        categories: ['shirts'],
        images: [
            image('clay-1', '/images/home/slider/7.jpg'),
            image('clay-2', '/images/home/slider/8.jpg'),
        ],
        price: 110,
        variants: [
            variant('var_Cb7hN3qa', 'S', 0),
            variant('var_Cb7hN3qb', 'M', 0),
            variant('var_Cb7hN3qc', 'L', 0),
        ],
        active: true,
    },
    {
        _id: 'local-product-olive-puff-blouse',
        _type: 'product',
        _createdAt: '2026-01-27T10:00:00Z',
        productId: 'prod_Op6bK1yW',
        title: 'Olive Puff Blouse',
        slug: { _type: 'slug', current: 'olive-puff-blouse' },
        description: 'A light blouse with puff sleeves, made from an upcycled olive silk dress.\nOn sale, one piece left.',
        categories: ['blouses'],
        images: [
            image('olive-1', '/images/home/slider/12.webp'),
            image('olive-2', '/images/home/slider/13.webp'),
        ],
        price: 90,
        discountedPrice: 70,
        variants: [
            variant('var_Op4vX8da', 'S', 2, false),
            variant('var_Op4vX8db', 'M', 1),
        ],
        active: true,
    },
    {
        // Hidden product (active: false): not listed and its page returns 404.
        _id: 'local-product-archive-denim-jacket',
        _type: 'product',
        _createdAt: '2026-01-20T10:00:00Z',
        productId: 'prod_Ad9jE5uT',
        title: 'Archive Denim Jacket',
        slug: { _type: 'slug', current: 'archive-denim-jacket' },
        description: 'A patched denim jacket from an earlier collection, currently hidden from the shop.',
        categories: ['dresses', 'accessories'],
        images: [
            image('denim-1', '/images/hero_1.jpeg'),
        ],
        price: 160,
        variants: [
            variant('var_Ad2cL7ea', 'M', 1),
        ],
        active: false,
    },
]

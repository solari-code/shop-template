// Currency, product categories and sizes.
//
// Careful when changing these on a shop that already has products:
// - currency: product prices are plain numbers and are NOT converted.
// - category slugs and size values are stored on the products in Sanity.
//   Changing one hides it on existing products; change the title or label
//   instead, which is only used for display.

export const commerceConfig = {
    // ISO 4217 currency code, e.g. 'USD', 'EUR', 'GBP', 'JPY'.
    // Prices are formatted with siteConfig.locale.
    currency: 'USD',

    // Product categories, in the order they are shown in the shop menu and
    // the category filter. slug: lowercase letters, digits and dashes.
    categories: [
        { slug: 'accessories', title: 'Accessories' },
        { slug: 'blouses', title: 'Blouses' },
        { slug: 'shirts', title: 'Shirts' },
        { slug: 'corsets', title: 'Corsets' },
        { slug: 'skirts', title: 'Skirts' },
        { slug: 'pants', title: 'Pants' },
        { slug: 'dresses', title: 'Dresses' },
    ],

    // Sizes that can be chosen for a product in the Studio, in this order.
    // label is optional (defaults to value). Mark at most one size as
    // oneSize: it is shown without the "Size" prefix (e.g. for accessories).
    sizes: [
        { value: 'One size', oneSize: true },
        { value: 'XS' },
        { value: 'S' },
        { value: 'M' },
        { value: 'L' },
        { value: 'XL' },
        { value: 'XXL' },
    ],
}

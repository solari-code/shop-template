// Page titles, descriptions and banner images, the menu and the footer.
//
// Page titles get the shop name added: "Products — Selva Studio".
// Texts can use {shopName}, {ownerName}, {ownerFirstName}, {shopEmail} and
// {tagline}. Images are files in /public.

export const pagesConfig = {
    products: {
        title: 'Products',
        description: 'Handmade slow fashion pieces from upcycled fabrics. {shopName}.',
        banner: { title: 'Products', image: '/images/hero_2.jpeg' },
    },
    cart: {
        title: 'Cart',
        description: 'Your shopping cart at {shopName}.',
        banner: { title: 'Cart', image: '/images/hero_6.jpeg' },
    },
    // Only needed when the wishlist is on (config/wishlist.mjs)
    wishlist: {
        title: 'Wishlist',
        description: 'Your saved pieces at {shopName}.',
        banner: { title: 'Wishlist', image: '/images/hero_6.jpeg' },
    },
    checkoutSuccess: {
        banner: { title: 'Done 🤍', image: '/images/hero_6.jpeg' },
    },
    privacy: {
        title: 'Privacy Policy',
        description: 'Privacy policy of {shopName}.',
        banner: { title: 'Privacy Policy', image: '/images/hero_6.jpeg' },
    },
    terms: {
        title: 'Terms of Service',
        description: 'Terms of service of {shopName}.',
        banner: { title: 'Terms of Service', image: '/images/hero_6.jpeg' },
    },
}

// Side menu. href: a page ('/products'), a homepage section ('/#about'),
// or an external link ('https://...'). showCategories lists the product
// categories below the item. Links to the wishlist are hidden while it is
// turned off (config/wishlist.mjs).
export const navigation = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', showCategories: true },
    { label: 'About', href: '/#about' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
    { label: 'Contact', href: '/#contact' },
]

export const footerConfig = {
    backgroundImage: '/images/hero_5.jpeg',
}

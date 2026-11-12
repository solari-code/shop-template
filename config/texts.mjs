// Texts written in the shop's own voice. Generic labels ("Add to cart",
// "Subtotal", ...) are part of the components.
//
// All texts can use {shopName}, {ownerName}, {ownerFirstName}, {shopEmail}
// and {tagline}. Some can use more, noted next to them. A line break (\n)
// starts a new line.

export const textsConfig = {
    // Link to the contact section, e.g. "Any questions? Write to me"
    contactLink: 'Write to me',

    // Product page, below the add to cart button
    sizeHelp: "Can't find your size?",

    // Page after a successful payment
    orderSuccess: {
        heading: 'Thank you for your order!',
        text: "I've received your order and I'm preparing it with lots of care.\nI'll send you an email with the details.",
        questions: 'Any questions?',
    },

    // Wishlist (config/wishlist.mjs); only needed when the wishlist is on
    wishlist: {
        // Heart button on products, read out by screen readers and shown
        // as a tooltip. `remove` is also the button on products that are no
        // longer available.
        save: 'Save to wishlist',
        remove: 'Remove from wishlist',
        // Heart icon in the header, read out by screen readers
        headerLink: 'Wishlist',
        // Wishlist page without saved products, and the link below it
        empty: 'Your wishlist is empty.\nTap the heart on a piece you love to save it for later.',
        emptyLink: 'View products',
        // Button on the wishlist page (sizes are chosen on the card)
        moveToCart: 'Move to cart',
        // Shown after moving a product to the cart. Can also use {productTitle}
        movedToCart: '{productTitle} is now in your cart.',
        viewCart: 'View cart',
        // Products that are no longer in the shop
        unavailable: 'No longer available',
    },

    // Replies shown after sending the contact form
    contactForm: {
        sent: "Message sent! I'll get back to you soon.",
        missingFields: 'Please fill in all fields.',
        failed: 'Something went wrong. Please try again.',
    },

    // Order confirmation email to the customer
    orderConfirmationEmail: {
        subject: 'Thank you for your order at {shopName}! 🖤',
        heading: 'Thank you for your order!',
        // Can also use {customerName}
        greeting: "Hi {customerName}, I've received your order.",
        closing: "I'm preparing it with lots of care and will write to you soon with the shipping details. If you have any questions, reply to this email or write to me at {shopEmail}",
    },

    // Bottom of every email
    emailSignature: 'With love — {ownerFirstName}',
    emailFooter: '{shopName} — {tagline} 🖤',
}

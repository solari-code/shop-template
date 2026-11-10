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

// Homepage sections, shown in this order. Reorder, remove or repeat them.
//
// Each section needs a unique id (letters, digits, dashes); menu links like
// '/#about' point to it. Section types:
//
// hero     full-screen image with the light logo
//          image
// slider   image carousel with a heading and a link
//          eyebrow, heading, images, imageAlt (the number is added), link { label, href }
// about    image and text side by side
//          eyebrow, heading, text, image, imageAlt
// contact  contact form (and WhatsApp button if siteConfig.contact.whatsapp is set)
//          eyebrow, heading, text, messagePlaceholder, whatsappLabel, whatsappMessage
//
// Texts can use {shopName}, {ownerName}, {ownerFirstName}, {shopEmail} and
// {tagline}. A line break (\n) in `text` starts a new line.

export const homepageSections = [
    {
        type: 'hero',
        id: 'hero',
        image: '/images/hero_1.jpeg',
    },
    {
        type: 'slider',
        id: 'carousel',
        eyebrow: 'Handmade',
        heading: 'Pieces with intention',
        images: [
            '/images/home/slider/1.jpg',
            '/images/home/slider/3.jpeg',
            '/images/home/slider/5.jpeg',
            '/images/home/slider/6.jpeg',
            '/images/home/slider/7.jpg',
            '/images/home/slider/13.webp',
            '/images/home/slider/2.jpeg',
            '/images/home/slider/8.jpg',
            '/images/home/slider/9.jpeg',
            '/images/home/slider/4.jpeg',
            '/images/home/slider/10.jpeg',
            '/images/home/slider/11.jpg',
            '/images/home/slider/12.webp',
        ],
        imageAlt: '{shopName} outfit',
        link: { label: 'View the collection', href: '/products' },
    },
    {
        type: 'about',
        id: 'about',
        eyebrow: 'A little about me',
        heading: 'I make pieces that are meant to last and stay with you.',
        text: "I'm {ownerFirstName}. {shopName} started because I wanted to dress with purpose: pieces made by hand from carefully chosen upcycled fabrics. Every garment has a story before it reaches you, and I hope it keeps writing it with you.\nIf you're looking for something that fits well and tells a story, I'm here.",
        image: '/images/about.jpeg',
        imageAlt: '{ownerFirstName} — {shopName} slow fashion',
    },
    {
        type: 'contact',
        id: 'contact',
        eyebrow: 'Contact',
        heading: 'Need a special size or a costume?',
        text: 'Get in touch to ask about custom sizes or to request a special piece made just for you.',
        messagePlaceholder: 'Tell me what you need...',
        whatsappLabel: 'Contact via WhatsApp',
        whatsappMessage: "Hi, I'm interested in a special size or a one-of-a-kind piece.",
    },
]

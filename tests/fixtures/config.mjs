// A fixed, complete example config (the template's original values) for the
// tests. Tests use this instead of config/, so they pass whatever a shop
// sets in its own config. Keep it valid when the config check changes.

export const exampleConfig = {
    "site": {
        "name": "Selva Studio",
        "shortName": "Selva",
        "tagline": "Slow Fashion",
        "description": "Shop handmade slow fashion pieces from upcycled fabrics at Selva Studio.",
        "url": "https://example.com",
        "locale": "en-US",
        "owner": {
            "name": "Mara Silva",
            "firstName": "Mara"
        },
        "contact": {
            "email": "hello@example.com",
            "phone": "",
            "whatsapp": "10000000000"
        },
        "social": [
            {
                "type": "instagram",
                "url": "https://www.instagram.com/"
            }
        ],
        "logos": {
            "dark": "/images/logo/logo_black.png",
            "light": "/images/logo/logo_slowfashion_white.png",
            "openGraph": "/images/logo/openGraph_logo.png"
        },
        "emailSender": {
            "name": "Selva Studio",
            "address": "hello@example.com"
        }
    },
    "commerce": {
        "currency": "USD",
        "categories": [
            {
                "slug": "accessories",
                "title": "Accessories"
            },
            {
                "slug": "blouses",
                "title": "Blouses"
            },
            {
                "slug": "shirts",
                "title": "Shirts"
            },
            {
                "slug": "corsets",
                "title": "Corsets"
            },
            {
                "slug": "skirts",
                "title": "Skirts"
            },
            {
                "slug": "pants",
                "title": "Pants"
            },
            {
                "slug": "dresses",
                "title": "Dresses"
            }
        ],
        "sizes": [
            {
                "value": "One size",
                "oneSize": true
            },
            {
                "value": "XS"
            },
            {
                "value": "S"
            },
            {
                "value": "M"
            },
            {
                "value": "L"
            },
            {
                "value": "XL"
            },
            {
                "value": "XXL"
            }
        ]
    },
    "shipping": {
        "options": [
            {
                "id": "standard",
                "name": "Standard shipping",
                "amount": 8,
                "deliveryDays": {
                    "min": 5,
                    "max": 10
                }
            },
            {
                "id": "express",
                "name": "Express shipping",
                "amount": 15,
                "deliveryDays": {
                    "min": 3,
                    "max": 5
                }
            }
        ],
        "countries": [
            "US"
        ]
    },
    "theme": {
        "colors": {
            "base-100": "#ffffff",
            "base-200": "#f4f4f6",
            "base-300": "#e8e8ed",
            "content": "#1c1917",
            "primary": "#9567f3",
            "neutral": "#0b0809",
            "surface": "#ffffff",
            "content-inverse": "#ffffff",
            "content-soft": "#4b5563",
            "content-muted": "#6b7280",
            "content-subtle": "#9ca3af",
            "on-image": "#ffffff",
            "badge": "#ef4444",
            "badge-text": "#ffffff"
        },
        "fonts": {
            "body": "inter",
            "heading": "inter"
        },
        "overlays": {
            "hero": 35,
            "banner": 35,
            "footer": 10
        },
        "email": {
            "background": "#f5f5f5",
            "card": "#ffffff",
            "text": "#111111",
            "muted": "#888888",
            "light": "#bbbbbb",
            "border": "#e8e8e8",
            "borderLight": "#f0f0f0"
        }
    },
    "homepage": [
        {
            "type": "hero",
            "id": "hero",
            "image": "/images/hero_1.jpeg"
        },
        {
            "type": "slider",
            "id": "carousel",
            "eyebrow": "Handmade",
            "heading": "Pieces with intention",
            "images": [
                "/images/home/slider/1.jpg",
                "/images/home/slider/3.jpeg",
                "/images/home/slider/5.jpeg",
                "/images/home/slider/6.jpeg",
                "/images/home/slider/7.jpg",
                "/images/home/slider/13.webp",
                "/images/home/slider/2.jpeg",
                "/images/home/slider/8.jpg",
                "/images/home/slider/9.jpeg",
                "/images/home/slider/4.jpeg",
                "/images/home/slider/10.jpeg",
                "/images/home/slider/11.jpg",
                "/images/home/slider/12.webp"
            ],
            "imageAlt": "{shopName} outfit",
            "link": {
                "label": "View the collection",
                "href": "/products"
            }
        },
        {
            "type": "about",
            "id": "about",
            "eyebrow": "A little about me",
            "heading": "I make pieces that are meant to last and stay with you.",
            "text": "I'm {ownerFirstName}. {shopName} started because I wanted to dress with purpose: pieces made by hand from carefully chosen upcycled fabrics. Every garment has a story before it reaches you, and I hope it keeps writing it with you.\nIf you're looking for something that fits well and tells a story, I'm here.",
            "image": "/images/about.jpeg",
            "imageAlt": "{ownerFirstName} — {shopName} slow fashion"
        },
        {
            "type": "contact",
            "id": "contact",
            "eyebrow": "Contact",
            "heading": "Need a special size or a costume?",
            "text": "Get in touch to ask about custom sizes or to request a special piece made just for you.",
            "messagePlaceholder": "Tell me what you need...",
            "whatsappLabel": "Contact via WhatsApp",
            "whatsappMessage": "Hi, I'm interested in a special size or a one-of-a-kind piece."
        }
    ],
    "pages": {
        "products": {
            "title": "Products",
            "description": "Handmade slow fashion pieces from upcycled fabrics. {shopName}.",
            "banner": {
                "title": "Products",
                "image": "/images/hero_2.jpeg"
            }
        },
        "cart": {
            "title": "Cart",
            "description": "Your shopping cart at {shopName}.",
            "banner": {
                "title": "Cart",
                "image": "/images/hero_6.jpeg"
            }
        },
        "checkoutSuccess": {
            "banner": {
                "title": "Done 🤍",
                "image": "/images/hero_6.jpeg"
            }
        },
        "privacy": {
            "title": "Privacy Policy",
            "description": "Privacy policy of {shopName}.",
            "banner": {
                "title": "Privacy Policy",
                "image": "/images/hero_6.jpeg"
            }
        },
        "terms": {
            "title": "Terms of Service",
            "description": "Terms of service of {shopName}.",
            "banner": {
                "title": "Terms of Service",
                "image": "/images/hero_6.jpeg"
            }
        }
    },
    "navigation": [
        {
            "label": "Home",
            "href": "/"
        },
        {
            "label": "Products",
            "href": "/products",
            "showCategories": true
        },
        {
            "label": "About",
            "href": "/#about"
        },
        {
            "label": "Cart",
            "href": "/cart"
        },
        {
            "label": "Contact",
            "href": "/#contact"
        }
    ],
    "footer": {
        "backgroundImage": "/images/hero_5.jpeg"
    },
    "texts": {
        "contactLink": "Write to me",
        "sizeHelp": "Can't find your size?",
        "orderSuccess": {
            "heading": "Thank you for your order!",
            "text": "I've received your order and I'm preparing it with lots of care.\nI'll send you an email with the details.",
            "questions": "Any questions?"
        },
        "contactForm": {
            "sent": "Message sent! I'll get back to you soon.",
            "missingFields": "Please fill in all fields.",
            "failed": "Something went wrong. Please try again."
        },
        "orderConfirmationEmail": {
            "subject": "Thank you for your order at {shopName}! 🖤",
            "heading": "Thank you for your order!",
            "greeting": "Hi {customerName}, I've received your order.",
            "closing": "I'm preparing it with lots of care and will write to you soon with the shipping details. If you have any questions, reply to this email or write to me at {shopEmail}"
        },
        "emailSignature": "With love — {ownerFirstName}",
        "emailFooter": "{shopName} — {tagline} 🖤"
    }
}

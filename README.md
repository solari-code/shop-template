# Shop template

Online shop for a small fashion label, built with Next.js 16, Sanity and Stripe. The demo brand is the fictional **Selva Studio**, a slow-fashion label selling handmade pieces from upcycled fabrics. All images are placeholders.

## Features

- **Shop:** product list with category filter, product pages with image gallery, sizes and stock
- **Cart:** stored in the browser (zustand), respects the stock of each size
- **Checkout:** Stripe Checkout with shipping options; a webhook lowers the stock in Sanity and sends order emails
- **Content:** products are managed in Sanity Studio, embedded under `/admin`
- **Emails:** contact form, order notification for the shop owner and order confirmation for the customer (Resend)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Sanity, Stripe and Resend values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The studio is at [http://localhost:3000/admin](http://localhost:3000/admin).

The shop reads its products from Sanity, so without a Sanity project and dataset it shows no products.

## Environment variables

See [`.env.example`](.env.example):

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_URL` | Stripe success and cancel URLs |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | reading products, the studio |
| `SANITY_API_WRITE_TOKEN` | updating stock from the Stripe webhook |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | checkout and the webhook (`/api/webhook`) |
| `RESEND_API_KEY`, `NOTIFICATION_EMAIL` | contact form and order emails |

## Project structure

- `app/(shop)/`: shop pages (home, products, product detail, cart, checkout success, legal pages)
- `app/admin/`: Sanity Studio
- `app/api/webhook/`: Stripe webhook
- `actions/`: server actions for Sanity queries, Stripe checkout and emails
- `components/`: UI; `components/products/` holds the product list (PLP) and product page (PDP)
- `lib/cartStore.js`: cart state
- `sanity/`: Sanity config, schemas (`product`, `variant`, categories) and clients
- `config/site.js`: brand and contact details

## License

MIT, see [LICENSE](LICENSE). The bundled fonts in `app/fonts` (Inter, Bagel Fat One, Fraunces, Lora) are under the SIL Open Font License; each licence sits next to its font file. The placeholder logos are set in Bagel Fat One.

# Shop template

Online shop for a small fashion label, built with Next.js 16, Sanity and Stripe. The demo brand is the fictional **Selva Studio**, a slow-fashion label selling handmade pieces from upcycled fabrics. All images are placeholders.

## Features

- **Shop:** product list with category filter, product pages with image gallery, sizes and stock
- **Cart:** stored in the browser (zustand), respects the stock of each size
- **Checkout:** Stripe Checkout with shipping options; prices and stock are checked on the server before the checkout starts
- **Orders:** a webhook lowers the stock in Sanity and sends order emails, and skips orders it has already processed
- **Content:** products are managed in Sanity Studio, embedded under `/admin`
- **Emails:** contact form, order notification for the shop owner and order confirmation for the customer (Resend)
- **Local mode:** runs fully offline without any accounts: example products, a test checkout, and emails saved as files

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without a `.env.local` file the shop runs in **local mode** (see below): you can browse the example products, add them to the cart, check out with the test checkout and read the order emails, all offline.

To connect your own Sanity, Stripe and Resend accounts:

```bash
cp .env.example .env.local   # then fill in your values
npm run dev
```

The studio is at [http://localhost:3000/admin](http://localhost:3000/admin) (only when a Sanity project is configured).

## Shop modes

The shop runs in one of two modes:

| Mode | Products | Checkout | Emails |
| --- | --- | --- | --- |
| `live` | Sanity | Stripe Checkout | Resend |
| `local` | `data/products.js` | test checkout (`/test-checkout/...`) | console + files in `.local-data/emails/` |

By default the mode is detected from the environment: the shop runs **live** when `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` and `STRIPE_SECRET_KEY` are set, and **local** otherwise. The placeholder values of the old `.env.example` count as not set. To choose the mode yourself, set `SHOP_MODE=local` or `SHOP_MODE=live`.

The mode and the reason are logged during the build and on the first request, e.g. `[shop] Running in local mode (missing STRIPE_SECRET_KEY).` In live mode it also warns about missing optional keys (webhook secret, write token, Resend key, ...).

The mode is decided when the app is **built**: Next.js bakes `NEXT_PUBLIC_*` values into the build, and static pages are rendered at build time. Set the variables before `npm run build`, and rebuild after changing them (in development, restart `npm run dev`).

## Local mode

Local mode needs no accounts and no internet connection. A "Local mode" badge in the corner of the shop pages shows that it is active.

- **Products:** the example products are in [`data/products.js`](data/products.js), in the same shape as the Sanity documents. They cover sale prices, sold-out products, hidden sizes, a hidden product, a one-size accessory and sizes with a stock of 1. Edit the file to change them.
- **Stock and orders:** sales lower the stock locally. The changes are stored in `.local-data/store.json` (sold quantities, processed orders, test checkouts); `data/products.js` itself is never changed.
- **Test checkout:** "Go to checkout" opens a test checkout page instead of Stripe. The customer details are prefilled and can be edited. **Pay** simulates a successful payment and runs the same order flow as the Stripe webhook (lower stock, send emails). **Cancel** returns to the cart, like Stripe's back link.
- **Emails:** order emails and contact form messages are printed to the server console and saved as HTML files in `.local-data/emails/`. Open them in a browser to check the layout.
- **Reset:** `npm run reset-local` deletes `.local-data`, which puts the stock back to the values in `data/products.js` and removes the saved orders, checkouts and emails.
- **Studio:** without a Sanity project, `/admin` shows a short notice instead of the studio. (With Sanity configured, the studio works in both modes, e.g. to set up products before Stripe is ready.)

`.local-data/` is in `.gitignore`. If the folder can't be written (e.g. on a read-only server), local mode keeps the data in memory and resets it on restart.

## Going live

1. **Sanity:** create a project and dataset and set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. Create an API token with write access (Editor) and set it as `SANITY_API_WRITE_TOKEN`; the webhook needs it to update stock and to record processed orders.
2. **Stripe:** set `STRIPE_SECRET_KEY`. Add a webhook endpoint for `https://your-domain/api/webhook` with the event `checkout.session.completed` and set its signing secret as `STRIPE_WEBHOOK_SECRET`. Set `NEXT_PUBLIC_URL` to your site URL (used for the success and cancel redirects).
3. **Resend:** set `RESEND_API_KEY` and `NOTIFICATION_EMAIL` (where order and contact notifications go). The sender address is set in [`lib/email/config.js`](lib/email/config.js); its domain must be verified in Resend.
4. **Place a real test order** before opening the shop (see below).

### Before going live: place a real test order

The order flow is covered by automated checks against simulated Sanity, Stripe and Resend services, but not against the real ones. Before opening the shop, place one order end to end with your real accounts:

1. Use your Stripe **test** keys (`sk_test_...`) and forward webhooks to your machine with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   Set the `whsec_...` secret it prints as `STRIPE_WEBHOOK_SECRET`, then build and start the shop.
2. Buy a product with the test card `4242 4242 4242 4242` (any future date, any CVC).
3. Check that:
   - you land on the success page and the cart is empty
   - the server log shows `[order] Order #... processed: stock updated for ... item(s), emails sent.`
   - the stock of the product went down in the studio
   - a `processedCheckout` document was created with `status: "completed"` (see [Checking processed orders](#checking-processed-orders))
   - both emails arrived, with the shipping address and the prices that were paid
4. Resend the same event (`stripe events resend evt_...`, or "Resend" in the Stripe dashboard). The log should show `was already processed, skipping the duplicate.` and the stock must not change again.
5. Afterwards, switch to the live keys and live webhook. Optionally place one small real order and refund it in the Stripe dashboard.

## How orders are processed

- **Checkout:** before the checkout starts, the cart is checked against the current product data ([`lib/checkout/validateCart.js`](lib/checkout/validateCart.js)). If a price changed, a size is sold out or unavailable, or there isn't enough stock, the checkout is not started: the cart shows what changed and is updated with the current prices and quantities. The prices charged always come from the product data, never from the browser. The ordered items and their prices are stored in the Stripe session metadata (split over several keys, so large carts fit).
- **Order flow:** the Stripe webhook and the local test checkout both hand paid orders to [`lib/orders/processOrder.js`](lib/orders/processOrder.js), which lowers the stock and sends the order emails.
- **Duplicates:** each order is recorded before anything else happens: in live mode as a hidden `processedCheckout.<session id>` document in Sanity, in local mode in `.local-data/store.json`. If Stripe delivers the same event again, the order is skipped.
- **If the order can't be recorded** (e.g. Sanity is unreachable or the write token is missing), nothing is done and the webhook answers with an error, so Stripe retries the event later (Stripe retries for up to three days and shows the failures in its dashboard).
- **If something fails after that** (a product was deleted, stock ran out, an email could not be sent), the rest of the order is still processed. Every problem is logged under `[order] ... was processed with problems` and saved on the order record (`status: "completed_with_problems"`, `problems: [...]`). These orders are **not** retried automatically; check them by hand.
- **Drafts:** the webhook updates the published product. If a product has unpublished changes in the studio, publishing them later restores the stock value from the draft, so publish or discard drafts of products that are on sale.

### Checking processed orders

The `processedCheckout` documents are not listed in the studio. To see them, query the dataset with the Sanity CLI:

```bash
npx sanity documents query '*[_type == "processedCheckout"] | order(claimedAt desc)'
```

Or add the Vision tool (`@sanity/vision` is already installed) to the `plugins` in `sanity.config.js` and run the same query under `/admin/vision`.

## Environment variables

See [`.env.example`](.env.example). None are needed for local mode.

| Variable | Used for |
| --- | --- |
| `SHOP_MODE` | `local` or `live`; leave empty to detect it from the keys |
| `NEXT_PUBLIC_URL` | Stripe success and cancel URLs |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | reading products, the studio |
| `SANITY_API_WRITE_TOKEN` | updating stock and recording processed orders from the Stripe webhook |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | checkout and the webhook (`/api/webhook`) |
| `RESEND_API_KEY`, `NOTIFICATION_EMAIL` | contact form and order emails |

## Project structure

- `app/(shop)/`: shop pages (home, products, product detail, cart, checkout success, legal pages)
- `app/test-checkout/`: the test checkout (local mode only)
- `app/admin/`: Sanity Studio
- `app/api/webhook/`: Stripe webhook
- `actions/`: server actions for product queries, checkout, the test checkout and the contact form
- `components/`: UI; `components/products/` holds the product list (PLP) and product page (PDP)
- `config/`: brand and contact details (`site.js`), shipping options (`shipping.js`)
- `data/products.js`: example products for local mode
- `lib/shopMode.js`: decides between local and live mode
- `lib/catalog/`: product data from Sanity or from the local example products
- `lib/payments/`: Stripe Checkout and the local test checkout
- `lib/checkout/`: price and stock check before checkout
- `lib/orders/`: shared order flow, duplicate protection, reading Stripe sessions
- `lib/email/`: email templates and sending (Resend, or console and files locally)
- `lib/local/`: the local data file (`.local-data/store.json`)
- `lib/cartStore.js`: cart state
- `sanity/`: Sanity config, schemas (`product`, `variant`, categories) and clients
- `scripts/reset-local.mjs`: resets local mode (`npm run reset-local`)

## License

MIT, see [LICENSE](LICENSE). The bundled fonts in `app/fonts` (Inter, Bagel Fat One, Fraunces, Lora) are under the SIL Open Font License; each licence sits next to its font file. The placeholder logos are set in Bagel Fat One.

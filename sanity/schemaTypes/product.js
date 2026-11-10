import { nanoid } from "nanoid";
import { commerceConfig } from "../../config/commerce.mjs";
import { shopCurrency, formatPrice } from "../../lib/config/shop.mjs";
import { currencyInfo } from "../../lib/config/money.mjs";

// Decimals a price may have in the shop currency (e.g. 2 for USD, 0 for JPY)
const priceDecimals = currencyInfo(shopCurrency).decimals;

const product = {
  name: "product",
  title: "Product",
  type: "document",

  groups: [
    { name: "info", title: "Information" },
    { name: "media", title: "Images" },
    { name: "pricing", title: "Pricing" },
    { name: "variants", title: "Sizes & stock" },
    { name: "meta", title: "Meta" },
  ],

  fields: [
    // ── INFORMATION ───────────────────────────────
    {
      name: "title",
      title: "Product name",
      type: "string",
      group: "info",
      validation: Rule => Rule.required()
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "info",
      options: { source: "title" },
      validation: Rule => Rule.required()
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "info",
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      group: "info",
      of: [{ type: "string" }],
      options: {
        // From config/commerce.mjs
        list: commerceConfig.categories.map(c => ({ title: c.title, value: c.slug })),
        layout: "grid",
      },
      validation: Rule => Rule.required().min(1)
    },

    // ── IMAGES ────────────────────────────────────
    {
      name: "images",
      title: "Images",
      type: "array",
      group: "media",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
      validation: Rule => Rule.required().min(1)
    },

    // ── PRICING ───────────────────────────────────
    {
      name: "price",
      title: `Price (${shopCurrency})`,
      type: "number",
      group: "pricing",
      validation: Rule => Rule.required().min(0).precision(priceDecimals)
    },
    {
      name: "discountedPrice",
      title: `Sale price (${shopCurrency})`,
      description: "Only fill in if the product is on sale",
      type: "number",
      group: "pricing",
      validation: Rule => Rule.min(0).precision(priceDecimals),
    },

    // ── SIZES & STOCK ─────────────────────────────
    {
      name: "variants",
      title: "Sizes",
      type: "array",
      group: "variants",
      of: [{ type: "variant" }],
      validation: Rule => Rule.required().min(1)
    },

    // ── META ──────────────────────────────────────
    {
      name: "active",
      title: "Product active",
      description: "Turn off to hide the product from the shop",
      type: "boolean",
      group: "meta",
      initialValue: true
    },
    {
      name: "productId",
      type: "string",
      title: "Product ID",
      group: "meta",
      initialValue: () => `prod_${nanoid(8)}`,
      readOnly: true,
      hidden: () => true,
      validation: Rule => Rule.required()
    },
  ],

  preview: {
    select: {
      title: "title",
      media: "images.0.asset",
      price: "price",
      discountedPrice: "discountedPrice",
    },
    prepare({ title, media, price, discountedPrice }) {
      return {
        title,
        media,
        subtitle: price == null
          ? undefined
          : discountedPrice
            ? `${formatPrice(discountedPrice)} (was ${formatPrice(price)})`
            : formatPrice(price)
      };
    },
  },
}

export default product

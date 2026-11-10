import { nanoid } from "nanoid";
import { commerceConfig } from "../../config/commerce.mjs";
import { sizeLabel } from "../../lib/config/shop.mjs";

const variant = {
    name: "variant",
    title: "Size",
    type: "object",
    fields: [
        {
            name: "variantId",
            type: "string",
            title: "Variant ID",
            initialValue: () => `var_${nanoid(8)}`,
            readOnly: true,
            hidden: () => true,
            validation: Rule => Rule.required()
        },
        {
            name: "size",
            title: "Size",
            type: "string",
            options: {
                // From config/commerce.mjs
                list: commerceConfig.sizes.map(s => ({ title: s.label ?? s.value, value: s.value })),
                layout: "radio",
                direction: "horizontal",
            },
            validation: Rule => Rule.required()
        },
        {
            name: "stock",
            title: "Stock",
            type: "number",
            initialValue: 1,
            validation: Rule => Rule.required().min(0)
        },
        {
            name: "active",
            title: "Size active",
            description: "Turn off to hide this size without deleting it",
            type: "boolean",
            initialValue: true
        }
    ],
    preview: {
        select: { size: "size", stock: "stock", active: "active" },
        prepare({ size, stock, active }) {
            return {
                title: sizeLabel(size),
                subtitle: `Stock: ${stock} · ${active ? "✓ Active" : "✗ Inactive"}`,
            }
        }
    }
}

export default variant

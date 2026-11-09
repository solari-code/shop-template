import { notFound } from "next/navigation";
import { isLocalMode } from "@/lib/shopMode";
import { getCheckout } from "@/lib/payments/local";
import { shippingCountries, shippingOptions } from "@/config/shipping";
import TestCheckout from "@/components/checkout/TestCheckout";

// Local test checkout: replaces Stripe Checkout in local mode.
// Outside the (shop) layout on purpose, like Stripe's hosted page.

export const metadata = {
    title: "Test checkout — Selva Studio",
    robots: { index: false, follow: false },
};

export default async function TestCheckoutPage({ params }) {
    if (!isLocalMode()) notFound();

    const { id } = await params;
    const checkout = await getCheckout(id);
    if (!checkout) notFound();

    return (
        <TestCheckout
            checkout={checkout}
            shippingOptions={shippingOptions}
            countries={shippingCountries}
        />
    );
}

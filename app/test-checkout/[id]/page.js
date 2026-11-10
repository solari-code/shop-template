import { notFound } from "next/navigation";
import { isLocalMode } from "@/lib/shopMode";
import { getCheckout } from "@/lib/payments/local";
import { shippingCountries, shippingOptions } from "@/config/shipping.mjs";
import TestCheckout from "@/components/checkout/TestCheckout";
import { siteConfig } from "@/config/site.mjs";
import { countryName } from "@/lib/checkout/address.mjs";

// Local test checkout: replaces Stripe Checkout in local mode.
// Outside the (shop) layout on purpose, like Stripe's hosted page.

export const metadata = {
    title: "Test checkout",
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
            // Names are looked up here, so server and browser show the same text
            countries={shippingCountries.map(code => ({ code, name: countryName(code, siteConfig.locale) }))}
        />
    );
}

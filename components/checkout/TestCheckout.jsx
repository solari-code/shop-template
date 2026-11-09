"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { siteConfig } from "@/config/site";
import { imageUrl } from "@/lib/imageUrl";
import { cancelTestCheckout, payTestCheckout } from "@/actions/testCheckout";

// Example customer, so a test order is one click away. All fields can be edited.
const TEST_CUSTOMER = {
    email: "test.customer@example.com",
    name: "Test Customer",
    line1: "123 Test Street",
    line2: "",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
};

const COUNTRY_NAMES = { US: "United States" };

const inputClass =
    "w-full px-3 py-2.5 border border-brand-base-300 bg-white text-sm font-light text-brand-content focus:outline-none focus:border-brand-content/50 transition-colors";
const labelClass = "block text-xs uppercase tracking-widest text-brand-content/60 mb-1.5";

export default function TestCheckout({ checkout, shippingOptions, countries }) {
    const [values, setValues] = useState({ ...TEST_CUSTOMER, country: countries[0] });
    // A paid checkout shows the shipping that was chosen when paying
    const [shippingOptionId, setShippingOptionId] = useState(checkout.shippingOptionId ?? shippingOptions[0]?.id);
    const [state, payAction, isPaying] = useActionState(payTestCheckout, null);

    const shipping = shippingOptions.find(o => o.id === shippingOptionId);
    const subtotal = checkout.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + (shipping?.amount ?? 0);
    const isOpen = checkout.status === "open";
    const isPaid = checkout.status === "paid";

    const field = (name) => ({
        name,
        id: `checkout-${name}`,
        value: values[name],
        onChange: (e) => setValues(v => ({ ...v, [name]: e.target.value })),
        className: inputClass,
    });

    return (
        <div className="min-h-screen bg-white font-sans font-light text-brand-content">
            <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-xs md:text-sm text-center px-4 py-2">
                <span className="font-normal uppercase tracking-widest">Test checkout</span>
                <span className="mx-2" aria-hidden>·</span>
                Local mode: no real payment is made. This page stands in for Stripe Checkout.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[calc(100vh-37px)]">
                {/* Order summary */}
                <section className="bg-brand-base-200 px-6 py-10 md:px-12 md:py-16" aria-label="Order summary">
                    <div className="max-w-md md:ml-auto space-y-8">
                        {/* Centred like in the header, so any logo file lines up */}
                        <div className="text-center space-y-6">
                            <Image
                                src="/images/logo/logo_black.png"
                                width={150}
                                height={26}
                                alt={siteConfig.name}
                                className="h-[22px] w-auto object-contain mx-auto"
                            />
                            <div>
                                <p className="text-sm text-brand-content/60">{isPaid ? `Paid to ${siteConfig.name}` : `Pay ${siteConfig.name}`}</p>
                                <p className="text-4xl tracking-tight mt-1">{formatPrice(total)}</p>
                                <p className="text-xs text-brand-content/50 mt-2">Order {checkout.orderNumber}</p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {checkout.items.map(item => {
                                const src = imageUrl(item.image, { width: 120, quality: 80 });
                                return (
                                    <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 items-center">
                                        <div className="relative w-14 aspect-[3/4] shrink-0 overflow-hidden bg-brand-base-300">
                                            {src && <Image src={src} alt={item.title} fill sizes="56px" className="object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">{item.title}</p>
                                            <p className="text-xs text-brand-content/60">
                                                {item.size === "One size" ? item.size : `Size ${item.size}`} · Qty {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </li>
                                );
                            })}
                        </ul>

                        <dl className="border-t border-brand-base-300 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-brand-content/60">Subtotal</dt>
                                <dd>{formatPrice(subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-brand-content/60">{shipping?.name ?? "Shipping"}</dt>
                                <dd>{formatPrice(shipping?.amount ?? 0)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-brand-base-300 pt-3 text-base">
                                <dt>{isPaid ? "Total paid" : "Total due"}</dt>
                                <dd>{formatPrice(total)}</dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* Payment form */}
                <section className="px-6 py-10 md:px-12 md:py-16" aria-label="Payment details">
                    <div className="max-w-md">
                        {isOpen ? (
                            <form action={payAction} className="space-y-8">
                                <input type="hidden" name="checkoutId" value={checkout.id} />
                                <input type="hidden" name="shippingOption" value={shippingOptionId ?? ""} />

                                <fieldset className="space-y-4">
                                    <legend className="text-base mb-4">Contact</legend>
                                    <div>
                                        <label htmlFor="checkout-email" className={labelClass}>Email</label>
                                        <input type="email" required autoComplete="email" {...field("email")} />
                                    </div>
                                </fieldset>

                                <fieldset className="space-y-4">
                                    <legend className="text-base mb-4">Shipping address</legend>
                                    <div>
                                        <label htmlFor="checkout-name" className={labelClass}>Full name</label>
                                        <input type="text" required autoComplete="name" {...field("name")} />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-country" className={labelClass}>Country</label>
                                        <select {...field("country")}>
                                            {countries.map(code => (
                                                <option key={code} value={code}>{COUNTRY_NAMES[code] ?? code}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-line1" className={labelClass}>Address</label>
                                        <input type="text" required autoComplete="address-line1" {...field("line1")} />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-line2" className={labelClass}>Apartment, suite (optional)</label>
                                        <input type="text" autoComplete="address-line2" {...field("line2")} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-3 sm:col-span-1">
                                            <label htmlFor="checkout-city" className={labelClass}>City</label>
                                            <input type="text" required autoComplete="address-level2" {...field("city")} />
                                        </div>
                                        <div>
                                            <label htmlFor="checkout-state" className={labelClass}>State</label>
                                            <input type="text" required autoComplete="address-level1" {...field("state")} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label htmlFor="checkout-postalCode" className={labelClass}>ZIP</label>
                                            <input type="text" required autoComplete="postal-code" {...field("postalCode")} />
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className="text-base mb-4">Shipping method</legend>
                                    <div className="border border-brand-base-300 divide-y divide-brand-base-300">
                                        {shippingOptions.map(option => (
                                            <label
                                                key={option.id}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm ${shippingOptionId === option.id ? "bg-brand-base-200" : ""}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shippingOptionChoice"
                                                    value={option.id}
                                                    checked={shippingOptionId === option.id}
                                                    onChange={() => setShippingOptionId(option.id)}
                                                    className="accent-brand-content"
                                                />
                                                <span className="flex-1">
                                                    {option.name}
                                                    <span className="block text-xs text-brand-content/50">
                                                        {option.deliveryDays.min}–{option.deliveryDays.max} business days
                                                    </span>
                                                </span>
                                                <span>{formatPrice(option.amount)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend className="text-base mb-4">Payment</legend>
                                    <p className="border border-dashed border-brand-content/30 bg-brand-base-200 px-4 py-3 text-sm text-brand-content/70">
                                        Test payment, no card needed. <strong className="font-normal text-brand-content">Pay</strong> simulates
                                        a successful payment: the stock is lowered and the order emails are saved
                                        in <code className="text-xs whitespace-nowrap">.local-data/emails/</code>.
                                    </p>
                                </fieldset>

                                {state?.error && (
                                    <p role="alert" className="text-sm text-red-700 border border-red-200 bg-red-50 px-4 py-3">
                                        {state.error}
                                    </p>
                                )}

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isPaying}
                                        className="w-full py-3 text-sm uppercase tracking-widest border border-brand-content bg-brand-content text-white hover:bg-transparent hover:text-brand-content transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {isPaying ? "Processing…" : `Pay ${formatPrice(total)}`}
                                    </button>
                                    <button
                                        type="submit"
                                        formAction={cancelTestCheckout}
                                        formNoValidate
                                        disabled={isPaying}
                                        className="w-full py-3 text-sm uppercase tracking-widest border border-brand-base-300 text-brand-content/70 hover:border-brand-content hover:text-brand-content transition-colors duration-200 disabled:opacity-50"
                                    >
                                        Cancel and return to cart
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <ClosedCheckout status={checkout.status} />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function ClosedCheckout({ status }) {
    const paid = status === "paid";
    return (
        <div className="space-y-4">
            <h1 className="text-2xl tracking-wide">
                {paid ? "This checkout was already paid" : "This checkout was cancelled"}
            </h1>
            <p className="text-sm text-brand-content/70">
                {paid
                    ? "The order has been placed. Paying again is not possible."
                    : "Nothing was bought. Go back to the cart to start a new checkout."}
            </p>
            <Link
                href={paid ? "/products" : "/cart"}
                className="inline-block text-xs uppercase tracking-widest border border-brand-content px-6 py-3 hover:bg-brand-content hover:text-white transition-colors duration-200"
            >
                {paid ? "Continue shopping" : "Back to cart"}
            </Link>
        </div>
    );
}

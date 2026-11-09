"use client";

import { useCartStore } from "@/lib/cartStore";
import { formatPrice } from "@/utils/formatPrice";
import { imageUrl } from "@/lib/imageUrl";
import Image from "next/image";
import Link from "next/link";
import { createCheckoutSession } from "@/actions/checkout"
import { useEffect, useRef, useState, useTransition } from 'react'

export default function Cart() {
    const { items, increaseItem, decreaseItem, removeItem, getTotal, replaceItems } = useCartStore();

    const [isPending, startTransition] = useTransition()
    // Messages from the checkout check: { issues: [...] } or { error }
    const [notice, setNotice] = useState(null)
    const noticeRef = useRef(null)

    // The checkout button is below the cart, so bring the messages into view
    useEffect(() => {
        if (notice) noticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [notice])

    const handleCheckout = async () => {
        setNotice(null)
        startTransition(async () => {
            // Redirects to the checkout if the cart is up to date; otherwise
            // returns the issues and the corrected cart.
            const result = await createCheckoutSession(items)
            if (result?.cart) replaceItems(result.cart)
            if (result?.issues?.length || result?.error) {
                setNotice({ issues: result.issues ?? [], error: result.error })
            }
        })
    }

    const noticeBox = notice && <CheckoutNotice notice={notice} />

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center">
                {noticeBox && <div ref={noticeRef} className="w-full max-w-3xl mb-8 scroll-mt-24">{noticeBox}</div>}
                <p className="text-lg text-brand-content/80 mb-6">Your cart is empty.</p>
                <Link
                    href="/products"
                    className="inline-block font-light text-xs uppercase tracking-widest border border-brand-content text-brand-content px-6 py-3 hover:bg-brand-content hover:text-brand-base-100 transition-colors duration-200"
                >
                    View products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 max-w-3xl ">
            <nav className="flex items-center gap-2 text-sm text-brand-content/70 mb-6" aria-label="Breadcrumb">
                <Link href="/products" className="hover:text-brand-content transition-colors">
                    Products
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-brand-content">Cart</span>
            </nav>

            {/* <h1 className="font-light text-2xl md:text-3xl tracking-wide mb-8">Cart</h1> */}

            {noticeBox && <div ref={noticeRef} className="mb-8 scroll-mt-24">{noticeBox}</div>}

            <div className="space-y-0">
                {items.map((item) => (
                    <div
                        key={`${item.productId}-${item.variantId}`}
                        className="flex gap-4 md:gap-6 items-start py-6 border-b border-brand-base-300 first:pt-0 last:border-b-0"
                    >
                        <Link
                            href={`/products/${item.slug}`}
                            className="relative w-20 md:w-24 shrink-0 overflow-hidden bg-brand-base-300 aspect-[3/4]"
                        >
                            {imageUrl(item.image) ? (
                                <Image
                                    src={imageUrl(item.image, { width: 160, quality: 80 })}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-brand-content/50 text-xs font-light">
                                    No image
                                </div>
                            )}
                        </Link>

                        <div className="flex-1 min-w-0 space-y-3">
                            <p className="font-light text-brand-content text-base md:text-lg">
                                {item.title}
                            </p>
                            <p className="font-light text-xs uppercase tracking-widest text-brand-content/70">
                                {item.size === "One size" ? item.size : `Size ${item.size}`}
                            </p>
                            <p className="font-light text-brand-content">
                                {formatPrice(item.price * item.quantity)}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => decreaseItem(item.productId, item.variantId)}
                                    className="w-8 h-8 flex items-center justify-center border border-brand-content text-brand-content hover:bg-brand-base-300 transition-colors duration-200"
                                    aria-label="Decrease"
                                >
                                    −
                                </button>
                                <span className="font-light text-sm text-brand-content w-6 text-center">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => increaseItem(item.productId, item.variantId)}
                                    disabled={item.quantity >= item.stock}
                                    className="w-8 h-8 flex items-center justify-center border border-brand-content text-brand-content hover:bg-brand-base-300 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label="Increase"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="text-brand-content/30 hover:text-brand-content transition-colors shrink-0"
                            aria-label="Remove"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* <hr className="border-brand-base-300 my-8" /> */}

            <div className="border border-brand-base-300 bg-brand-base-300 p-6 space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-light text-xs uppercase tracking-widest text-brand-content/70">
                        Subtotal
                    </span>
                    <span className="font-light text-xl text-brand-content">
                        {formatPrice(getTotal())}
                    </span>
                </div>
                <p className="font-light text-sm text-brand-content/50 pt-2">
                    Shipping and taxes are calculated at checkout.
                </p>
            </div>

            <button
                onClick={handleCheckout}
                disabled={isPending}
                type="button"
                className="w-full mt-6 py-3 font-light text-sm uppercase tracking-widest border border-brand-content bg-brand-content text-white hover:bg-transparent hover:text-brand-content transition-colors duration-200"
            >
                {isPending ? "Redirecting..." : "Go to checkout"}
            </button>
        </div>
    );
}

function CheckoutNotice({ notice }) {
    if (notice.error) {
        return (
            <div role="alert" className="border border-red-200 bg-red-50 text-red-800 px-5 py-4 text-sm font-light">
                {notice.error}
            </div>
        );
    }
    return (
        <div role="alert" className="border border-amber-200 bg-amber-50 text-amber-900 px-5 py-4 text-sm font-light space-y-2">
            <p className="font-normal">Your cart was updated, please check it before continuing.</p>
            <ul className="list-disc pl-5 space-y-1">
                {notice.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                ))}
            </ul>
        </div>
    );
}

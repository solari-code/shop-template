// components/Header/Drawer.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Drawer({ isOpen, onClose, categories = [] }) {
    return (
        <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={!isOpen}
        >

            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/50"
            />


            {/* Drawer */}
            <aside
                className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-brand-base-200 text-brand-content p-6 z-[101] shadow-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Close Button */}
                {/* <div className="flex justify-end mb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-brand-content hover:bg-brand-base-300 rounded"
                        aria-label="Close menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div> */}
                <div className="flex justify-end pt-4 pr-4">
                    <button
                        onClick={onClose}
                        className="text-brand-content/40 hover:text-brand-content transition-colors"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <ul className="space-y-1 font-sans text-sm uppercase tracking-wider">
                    <li>
                        <Link href="/" onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/products" onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                            Products
                        </Link>
                        {categories.length > 0 && (
                            <ul className="ml-4 mt-1 space-y-1 border-l border-brand-base-300 pl-4">
                                {categories.map((cat) => (
                                    <li key={cat.slug}>
                                        <Link
                                            href={`/products?category=${cat.slug}`}
                                            onClick={onClose}
                                            className="block py-1.5 text-brand-content/80 hover:text-brand-content transition-colors"
                                        >
                                            {cat.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                    <li>
                        <Link href="/#about" onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/cart" onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                            Cart
                        </Link>
                    </li>
                    <li>
                        <Link href="/#contact" onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                            Contact
                        </Link>
                    </li>
                </ul>
            </aside>
        </div>
    );
}
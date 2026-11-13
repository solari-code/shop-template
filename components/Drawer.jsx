"use client";

import Link from "next/link";
import { navigation } from "@/config/pages.mjs";
import { wishlistConfig } from "@/config/wishlist.mjs";
import { themeConfig } from "@/config/theme.mjs";
import ThemeSwitcher from "./ThemeSwitcher";
import { shopText } from "@/lib/config/shop.mjs";
import { enabledFeatures, isHrefAvailable } from "@/lib/config/features.mjs";

// Links to pages of features that are turned off (e.g. the wishlist) are left out
const features = enabledFeatures({ wishlist: wishlistConfig });
const menuItems = navigation.filter((item) => isHrefAvailable(item.href, features));
const showThemeSwitcher = themeConfig.mode.switcher && themeConfig.mode.showInMenu;

// Side menu. The items come from `navigation` in config/pages.mjs;
// categories: [{ slug, title }] that have products.
export default function Drawer({ isOpen, onClose, categories = [] }) {
    return (
        <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={!isOpen}
        >

            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/50 dark:bg-black/70"
            />


            {/* Drawer */}
            {/* Scrolls when the links don't fit, e.g. on short phone screens */}
            <aside
                className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] overflow-y-auto overscroll-contain bg-brand-base-200 text-brand-content p-6 z-[101] shadow-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-end pt-4 pr-4">
                    <button
                        onClick={onClose}
                        className="hover:text-brand-content transition-colors"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <ul className="space-y-1 font-sans text-sm uppercase tracking-wider">
                    {menuItems.map((item, i) => (
                        <li key={`${i}-${item.href}`}>
                            <Link href={item.href} onClick={onClose} className="block py-2.5 hover:opacity-70 transition-opacity">
                                {shopText(item.label)}
                            </Link>
                            {item.showCategories && categories.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1 border-l border-brand-base-300 pl-4">
                                    {categories.map((cat) => (
                                        <li key={cat.slug}>
                                            <Link
                                                href={`/products?category=${cat.slug}`}
                                                onClick={onClose}
                                                className="block py-1.5 hover:text-brand-content transition-colors"
                                            >
                                                {cat.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Light and dark mode, below the links */}
                {showThemeSwitcher && (
                    // Hidden with the switcher when JavaScript is off
                    <div className="mt-6 pt-4 border-t border-brand-base-300" data-requires-js="">
                        <ThemeSwitcher
                            variant="menu"
                            className="flex items-center gap-3 py-2.5 font-sans text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
                            iconClassName="w-5 h-5"
                        />
                    </div>
                )}
            </aside>
        </div>
    );
}
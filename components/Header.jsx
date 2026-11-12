// components/Header/HeaderClient.jsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Drawer from "./Drawer";
import CountBadge from "./CountBadge";
import HeartIcon from "./wishlist/HeartIcon";
import { useCartCount } from "@/lib/cartStore";
import { useWishlistCount } from "@/lib/wishlistStore";
import { siteConfig } from "@/config/site.mjs";
import { wishlistConfig } from "@/config/wishlist.mjs";
import { textsConfig } from "@/config/texts.mjs";
import { shopText } from "@/lib/config/shop.mjs";

const showWishlist = wishlistConfig.enabled && wishlistConfig.showInHeader;

// Slightly smaller icons on the narrowest phones, so the logo stays centred
// between the menu button and the wishlist and cart icons
const ICON_SIZE = "w-8 h-8 max-[359px]:w-7 max-[359px]:h-7";
const ICON_LINK = "relative p-1 max-[359px]:p-0.5";

export default function HeaderClient({ categories = [] }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // undefined until the saved state is known (see components/CountBadge.jsx)
    const cartCount = useCartCount();
    const wishlistCount = useWishlistCount();

    useEffect(() => {
        if (!isHome) return;
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHome]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);
    const navBg = !isHome || isScrolled || menuOpen;
    const textClass = navBg ? "text-brand-content" : "text-brand-on-image";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full flex items-center transition duration-300 p-4 z-[50] ${navBg ? "bg-brand-surface shadow-md backdrop-blur-lg" : "bg-transparent"}`}
                aria-label="Main navigation"
            >
                {/* Both sides take the same width, so the logo stays centred */}
                <div className="flex-1 flex justify-start">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className={`p-1 ${textClass}`}
                        aria-label="Open menu"
                        aria-expanded={menuOpen}
                    >
                        <svg className={ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <Link href="/" className="flex items-center justify-center shrink-0 h-[26px] min-w-[150px]">
                    <span
                        className={`inline-flex items-center justify-center transition-opacity duration-300 ${navBg ? "opacity-100" : "opacity-0"}`}
                        style={{ maxHeight: "26px" }}
                    >
                        <Image
                            src={siteConfig.logos.dark}
                            width={150}
                            height={50}
                            alt={siteConfig.name}
                            className="h-[26px] w-auto object-contain object-center"
                            style={{ maxHeight: "26px" }}
                            priority
                        />
                    </span>
                </Link>

                <div className="flex-1 flex justify-end items-center gap-1 max-[359px]:gap-0">
                    {showWishlist && (
                        <Link href="/wishlist" className={`${ICON_LINK} ${textClass}`} aria-label={shopText(textsConfig.wishlist.headerLink)}>
                            <HeartIcon className={ICON_SIZE} />
                            <CountBadge name="wishlist" count={wishlistCount} />
                        </Link>
                    )}
                    <Link href="/cart" className={`${ICON_LINK} ${textClass}`} aria-label="Cart">
                        <svg className={ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <CountBadge name="cart" count={cartCount} />
                    </Link>
                </div>
            </nav>

            <Drawer
                isOpen={menuOpen}
                onClose={closeMenu}
                categories={categories}
            />
        </>
    );
}
// components/Header/HeaderClient.jsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Drawer from "./Drawer";
import { useCartStore } from "@/lib/cartStore";
import { siteConfig } from "@/config/site.mjs";

export default function HeaderClient({ categories = [] }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const items = useCartStore(state => state.items);
    const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
                className={`fixed top-0 left-0 w-full flex items-center justify-between transition duration-300 p-4 z-[50] ${navBg ? "bg-brand-surface shadow-md backdrop-blur-lg" : "bg-transparent"}`}
                aria-label="Main navigation"
            >
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className={`p-1 ${textClass}`}
                    aria-label="Open menu"
                    aria-expanded={menuOpen}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

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

                <Link href="/cart" className={`relative p-1 ${textClass}`} aria-label="Cart">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-brand-badge text-brand-badge-text text-xs font-medium rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </nav>

            <Drawer
                isOpen={menuOpen}
                onClose={closeMenu}
                categories={categories}
            />
        </>
    );
}
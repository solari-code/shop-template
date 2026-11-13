"use client";

import { useColorMode, setColorMode } from "@/lib/themeStore";
import { otherColorMode } from "@/lib/theme.mjs";
import { textsConfig } from "@/config/texts.mjs";
import { shopText } from "@/lib/config/shop.mjs";

// Switches between light and dark mode (config/theme.mjs: mode.switcher).
// Shows one icon, for the mode it switches to: a moon in light mode, a sun
// in dark mode.
//
// The icon and the label are chosen with CSS (the `dark:` variant), so they
// are right from the first frame, also while React doesn't know the saved
// mode yet (useColorMode is undefined during hydration).
//
// variant: "header" (icon only; the label is for screen readers and the
// tooltip), "menu" or "footer" (icon and label). Where it is shown is set
// in config/theme.mjs (mode.showInHeader, showInMenu, showInFooter).
export default function ThemeSwitcher({ variant = "header", className = "", iconClassName = "w-6 h-6" }) {
    const mode = useColorMode();
    const toDark = shopText(textsConfig.themeSwitcher.toDark);
    const toLight = shopText(textsConfig.themeSwitcher.toLight);
    const labelClass = variant === "header" ? "sr-only" : "";

    return (
        <button
            type="button"
            // Hidden when JavaScript is off (components/ThemeHead.jsx)
            data-requires-js=""
            onClick={() => setColorMode(otherColorMode(mode))}
            // Known after hydration; the visible label doesn't depend on it
            title={variant === "header" && mode ? (mode === "dark" ? toLight : toDark) : undefined}
            className={className}
        >
            <MoonIcon className={`${iconClassName} shrink-0 dark:hidden`} />
            <SunIcon className={`${iconClassName} shrink-0 hidden dark:block`} />
            {/* Hidden labels (display: none) are not read out either */}
            <span className={`${labelClass} dark:hidden`}>{toDark}</span>
            <span className={`${labelClass} hidden dark:inline`}>{toLight}</span>
        </button>
    );
}

function MoonIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    );
}

function SunIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

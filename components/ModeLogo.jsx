import Image from "next/image";
import { siteConfig } from "@/config/site.mjs";
import { themeConfig } from "@/config/theme.mjs";
import { colorModes } from "@/lib/config/theme.mjs";

// Logos for the modes the shop can show (config/site.mjs: logos.lightMode,
// logos.darkMode)
const logos = colorModes(themeConfig.mode).map((colorMode) => ({ colorMode, src: siteConfig.logos[`${colorMode}Mode`] }));
// With both modes, both logos are in the page and CSS shows the one of the
// current mode (the `dark:` variant), so the right one shows from the first
// frame, also before a saved choice is known to React.
const VISIBILITY = logos.length > 1 ? { light: "dark:hidden", dark: "hidden dark:block" } : { light: "", dark: "" };

// The shop logo for the header and the test checkout. Props go to
// next/image (width, height, className, style, priority).
export default function ModeLogo({ className = "", ...props }) {
    return logos.map(({ colorMode, src }) => (
        <Image
            key={colorMode}
            src={src}
            alt={siteConfig.name}
            className={`${className} ${VISIBILITY[colorMode]}`}
            {...props}
        />
    ));
}

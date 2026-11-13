import { themeConfig } from "@/config/theme.mjs";
import { themeStyleSheet } from "@/lib/config/theme.mjs";
import { themePrepaintScript } from "@/lib/prepaint.mjs";
import { THEME_STORAGE_KEY } from "@/lib/theme.mjs";

const styleSheet = themeStyleSheet(themeConfig);
const script = themeConfig.mode.switcher ? themePrepaintScript({ storageKey: THEME_STORAGE_KEY }) : null;

// Without JavaScript the switcher can't work, so it is hidden: elements
// marked with data-requires-js (the switcher and the space around it).
// Only applies when JavaScript is off, so nothing changes for everyone else.
const noScriptStyle = "<style>[data-requires-js]{display:none!important}</style>";

// In <head> of every page (app/layout.js): the theme colours of both modes,
// and, with the switcher on, the script that applies the visitor's saved
// mode before the page is drawn (lib/prepaint.mjs) and the style that hides
// the switcher when JavaScript is off.
export default function ThemeHead() {
    return (
        <>
            <style data-theme-colors="" dangerouslySetInnerHTML={{ __html: styleSheet }} />
            {script && <script dangerouslySetInnerHTML={{ __html: script }} />}
            {script && <noscript dangerouslySetInnerHTML={{ __html: noScriptStyle }} />}
        </>
    );
}

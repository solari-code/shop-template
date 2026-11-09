// Small badge shown on every shop page in local mode, so it's obvious that
// the shop isn't connected to Sanity, Stripe and Resend.
// Rendered by app/(shop)/layout.js; the test checkout has its own notice.
export default function LocalModeBanner() {
    return (
        <div
            role="status"
            className="fixed bottom-4 left-4 z-[60] max-w-[calc(100vw-2rem)] rounded-full border border-amber-300 bg-amber-100/95 px-4 py-2 text-xs font-light text-amber-900 shadow-md backdrop-blur-sm"
        >
            <span className="font-normal uppercase tracking-widest">Local mode</span>
            <span className="hidden sm:inline">
                <span className="mx-2" aria-hidden>·</span>
                Example products, test checkout, emails saved locally
            </span>
        </div>
    );
}

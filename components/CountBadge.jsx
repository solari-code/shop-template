// Number on a header icon (cart, wishlist). count: undefined until the saved
// state is known, then the pre-paint script shows the count (see
// lib/prepaint.mjs); hidden when 0.
export default function CountBadge({ name, count }) {
    return (
        <span
            data-count-badge={name}
            data-count={count}
            className="count-badge absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-brand-badge text-brand-badge-text text-xs font-medium rounded-full"
        >
            {count > 0 ? count : null}
        </span>
    );
}

import { prepaintScript } from "@/lib/prepaint.mjs";
import { CART_STORAGE_KEY } from "@/lib/cart.mjs";
import { WISHLIST_STORAGE_KEY } from "@/lib/wishlist.mjs";
import { wishlistConfig } from "@/config/wishlist.mjs";

// Shows the saved cart and wishlist state (header badges, filled hearts)
// from the first frame. Rendered at the top of the shop pages, so it runs
// before the header and the products are parsed. See lib/prepaint.mjs.
export default function PrepaintScript() {
    const script = prepaintScript({
        cartKey: CART_STORAGE_KEY,
        wishlistKey: wishlistConfig.enabled ? WISHLIST_STORAGE_KEY : null,
        wishlistMaxItems: wishlistConfig.maxItems,
    });
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

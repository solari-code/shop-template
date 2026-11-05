import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, variant) => {
                const items = get().items;
                const existing = items.find(
                    i => i.productId === product.productId && i.variantId === variant.variantId
                );

                if (existing) {
                    if (existing.quantity >= variant.stock) return;
                    set({
                        items: items.map(i =>
                            i.productId === product.productId && i.variantId === variant.variantId
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                    });
                } else {
                    set({
                        items: [...items, {
                            productId: product.productId,
                            variantId: variant.variantId,
                            title: product.title,
                            size: variant.size,
                            price: product.discountedPrice ?? product.price,
                            image: product.images?.[0],
                            slug: product.slug,
                            quantity: 1,
                            stock: variant.stock,
                        }]
                    });
                }
            },

            increaseItem: (productId, variantId) => {
                const items = get().items;
                const item = items.find(i => i.productId === productId && i.variantId === variantId);
                if (!item || item.quantity >= item.stock) return;
                set({
                    items: items.map(i =>
                        i.productId === productId && i.variantId === variantId
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                });
            },

            decreaseItem: (productId, variantId) => {
                const items = get().items;
                const item = items.find(i => i.productId === productId && i.variantId === variantId);
                if (!item) return;
                if (item.quantity <= 1) {
                    set({ items: items.filter(i => !(i.productId === productId && i.variantId === variantId)) });
                } else {
                    set({
                        items: items.map(i =>
                            i.productId === productId && i.variantId === variantId
                                ? { ...i, quantity: i.quantity - 1 }
                                : i
                        )
                    });
                }
            },

            removeItem: (productId, variantId) => set({
                items: get().items.filter(
                    i => !(i.productId === productId && i.variantId === variantId)
                )
            }),

            clearCart: () => set({ items: [] }),

            getTotal: () => get().items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        }),
        { name: 'shop-cart' }
    )
)
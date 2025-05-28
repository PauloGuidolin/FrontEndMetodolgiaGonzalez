// src/store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductoDTO } from '../components/dto/ProductoDTO';
import { ProductoDetalleDTO } from '../components/dto/ProductoDetalleDTO';


// Define la estructura de un ítem en el carrito
export interface CartItem {
    product: ProductoDTO; // <<--- ¡AGREGAMOS EL PRODUCTO COMPLETO AQUÍ!
    productDetail: ProductoDetalleDTO;
    quantity: number;
}

// Define la interfaz del estado del carrito
interface CartState {
    items: CartItem[];
    // Modificamos addToCart para que reciba el ProductoDTO también
    addToCart: (product: ProductoDTO, productDetail: ProductoDetalleDTO, quantity: number) => void;
    removeFromCart: (productDetailId: number) => void;
    updateQuantity: (productDetailId: number, newQuantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            // Recibe product y productDetail
            addToCart: (product, productDetail, quantity) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.productDetail.id === productDetail.id
                    );

                    if (existingItemIndex > -1) {
                        const updatedItems = state.items.map((item, index) =>
                            index === existingItemIndex
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                        return { items: updatedItems };
                    } else {
                        // Guarda el producto completo junto con el detalle
                        return { items: [...state.items, { product, productDetail, quantity }] };
                    }
                });
            },

            removeFromCart: (productDetailId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productDetail.id !== productDetailId),
                }));
            },

            updateQuantity: (productDetailId, newQuantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productDetail.id === productDetailId
                            ? { ...item, quantity: newQuantity }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    // Ahora accedemos a item.product directamente
                    const product = item.product;
                    let price = 0;

                    if (product) {
                        // El precio final ya está calculado en ProductoDTO y representa la promoción si existe
                        price = product.precioFinal || product.precioOriginal || 0;
                    }
                    return total + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
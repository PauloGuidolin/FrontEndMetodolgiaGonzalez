// src/store/mercadoPagoStore.ts

import { create } from 'zustand';
import { MercadoPagoPreferenceRequestDTO } from '../components/dto/MercadoPagoDTOs';
import { mercadoPagoService } from '../https/mercadoPagoService';

interface MercadoPagoState {
    initPoint: string | null;
    isLoading: boolean;
    error: string | null;
    createPreference: (data: MercadoPagoPreferenceRequestDTO) => Promise<void>;
    resetState: () => void;
}

export const useMercadoPagoStore = create<MercadoPagoState>((set) => ({
    initPoint: null,
    isLoading: false,
    error: null,

    createPreference: async (data) => {
        set({ isLoading: true, error: null, initPoint: null });
        try {
            // **IMPORTANTE:** Asegúrate de que `data.items`, `data.shippingCost`, y `data.montoTotal`
            // ya contengan los valores como strings con la precisión adecuada (ej. "123.45")
            // antes de llamar a `createPreference`. Esto se debe hacer en el componente
            // o hook que prepara los datos para esta función.
            // Ejemplo:
            // data.items = data.items.map(item => ({
            //    ...item,
            //    unitPrice: item.unitPrice.toFixed(2) // Si unitPrice fuera number inicialmente
            // }));
            // data.shippingCost = data.shippingCost.toFixed(2);
            // data.montoTotal = data.montoTotal.toFixed(2); // Si montoTotal fuera number inicialmente

            const response = await mercadoPagoService.createPreference(data);
            set({ initPoint: response.init_point, isLoading: false });
        } catch (err: any) {
            console.error("Error en useMercadoPagoStore al crear preferencia:", err);
            const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error al procesar el pago.";
            set({ error: errorMessage, isLoading: false });
            throw err;
        }
    },

    resetState: () => {
        set({
            initPoint: null,
            isLoading: false,
            error: null,
        });
    },
}));
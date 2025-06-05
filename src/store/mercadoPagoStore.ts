// src/store/mercadoPagoStore.ts

import { create } from 'zustand';
import { MercadoPagoPreferenceRequestDTO, MercadoPagoPreferenceResponseDTO } from '../components/dto/MercadoPagoDTOs';
import { mercadoPagoService } from '../https/mercadoPagoService';
// Asegúrate de que esta ruta a tus DTOs sea correcta.
// Si tus DTOs están en 'src/components/dto/', déjala como estaba: '../components/dto/MercadoPagoDTOs'
// Si están en 'src/types/dtos/', usa: '../types/dtos/MercadoPagoDTOs' (como en este ejemplo)


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
            // Los campos como unitPrice, shippingCost, montoTotal YA DEBERÍAN SER NUMBERS
            // en data: MercadoPagoPreferenceRequestDTO.
            // Por lo tanto, no es necesario hacer conversiones a string con toFixed(2) aquí.
            // Si en algún punto necesitas formatearlos para la UI, hazlo en ese momento.

            const response: MercadoPagoPreferenceResponseDTO = await mercadoPagoService.createPreference(data);
            set({ initPoint: response.initPoint, isLoading: false }); // <-- ¡Propiedad corregida a 'initPoint'!
        } catch (err: any) {
            console.error("Error en useMercadoPagoStore al crear preferencia:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al procesar el pago.";
            set({ error: errorMessage, isLoading: false });
            // Re-lanzar el error para que el componente que llama pueda manejarlo si es necesario
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
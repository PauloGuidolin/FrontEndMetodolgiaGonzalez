// src/store/discountStore.ts

import { create } from 'zustand';
// Asegúrate de que la ruta de importación de DescuentoDTO sea correcta.
import { discountService } from '../https/discountApi'; // Asumo que discountApi es el archivo que exporta discountService
import { DescuentoDTO } from '../components/dto/DescuentoDTO';

interface DiscountState {
    discounts: DescuentoDTO[];
    loading: boolean;
    error: string | null;

    selectedDiscount: DescuentoDTO | null;
    loadingDiscount: boolean;
    errorDiscount: string | null;

    fetchDiscounts: () => Promise<void>;
    fetchDiscountById: (id: number | string) => Promise<void>;
    addDiscount: (discountData: Partial<DescuentoDTO>) => Promise<void>; // Retorna void porque se refresca la lista
    updateDiscount: (discount: DescuentoDTO) => Promise<void>; // Retorna void porque se refresca la lista
    toggleDiscountActive: (id: number | string, currentStatus: boolean) => Promise<void>; // ID puede ser number o string
    clearSelectedDiscount: () => void;
}

export const useDiscountStore = create<DiscountState>((set, get) => ({
    discounts: [],
    loading: false,
    error: null,

    selectedDiscount: null,
    loadingDiscount: false,
    errorDiscount: null,

    fetchDiscounts: async () => {
        set({ loading: true, error: null });
        try {
            const discountsData = await discountService.getAll();
            set({ discounts: discountsData, loading: false });
        } catch (error) {
            console.error("Error fetching all discounts in store:", error);
            set({
                error: `Failed to load discounts: ${error instanceof Error ? error.message : String(error)}`,
                loading: false,
            });
        }
    },

    fetchDiscountById: async (id: number | string) => {
        set({ loadingDiscount: true, errorDiscount: null, selectedDiscount: null });
        try {
            const discountData = await discountService.getById(id);
            set({ selectedDiscount: discountData, loadingDiscount: false });
        } catch (error: any) {
            console.error(`Error fetching discount with ID ${id} in store:`, error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                `Failed to load discount with ID ${id}.`;
            set({
                errorDiscount: errorMessage,
                loadingDiscount: false,
                selectedDiscount: null,
            });
        }
    },

    addDiscount: async (discountData: Partial<DescuentoDTO>) => {
        set({ loading: true, error: null }); // Indicamos carga global para la operación
        try {
            await discountService.create(discountData);
            await get().fetchDiscounts(); // <-- REFRESCAR LA LISTA DESPUÉS DE CREAR
        } catch (error) {
            console.error("Error adding discount in store:", error);
            set({ error: `Failed to add discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        } finally {
            set({ loading: false }); // Asegurar que la carga termina
        }
    },

    updateDiscount: async (discount: DescuentoDTO) => {
        set({ loading: true, error: null }); // Indicamos carga global para la operación
        try {
            await discountService.update(discount);
            await get().fetchDiscounts(); // <-- REFRESCAR LA LISTA DESPUÉS DE ACTUALIZAR
        } catch (error) {
            console.error("Error updating discount in store:", error);
            set({ error: `Failed to update discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        } finally {
            set({ loading: false }); // Asegurar que la carga termina
        }
    },

    // --- ¡IMPORTANTE! REMOVEMOS deleteDiscount ---
    // La "eliminación" lógica ahora se maneja con toggleDiscountActive.
    // deleteDiscount: async (id: number | string) => { /* ... */ },

    // Implementación de la acción toggleDiscountActive
    // Ahora llama directamente al nuevo método toggleStatus del servicio
    toggleDiscountActive: async (id: number | string, currentStatus: boolean) => {
        set({ loadingDiscount: true, errorDiscount: null });
        try {
            // Llama directamente al método `toggleStatus` del servicio,
            // que a su vez llama al backend con el query parameter.
            await discountService.toggleStatus(id, currentStatus);
            
            // Después de la operación, REFRESCAMOS la lista completa de descuentos.
            // Esto asegura que la UI esté sincronizada con el estado actual del backend.
            await get().fetchDiscounts(); 

        } catch (error) {
            console.error(`Error toggling discount status for ID ${id} in store:`, error);
            set({
                errorDiscount: `Failed to toggle discount status: ${error instanceof Error ? error.message : String(error)}`,
                loadingDiscount: false,
            });
            throw error;
        } finally {
            set({ loadingDiscount: false }); // Asegurar que la carga termina
        }
    },

    clearSelectedDiscount: () => set({ selectedDiscount: null, errorDiscount: null, loadingDiscount: false }),
}));
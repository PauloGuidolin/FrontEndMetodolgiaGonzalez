// src/store/discountStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { DescuentoDTO } from '../components/dto/DescuentoDTO'; // Importar DescuentoDTO para consistencia
import { discountService } from '../https/discountApi';


// Definimos la interfaz para el estado de nuestro store de descuentos
interface DiscountState {
    // Estado para la lista general de descuentos
    discounts: DescuentoDTO[]; // Usar DescuentoDTO
    loading: boolean;
    error: string | null;

    // Estado para un descuento individual seleccionado o buscado
    selectedDiscount: DescuentoDTO | null; // Usar DescuentoDTO
    loadingDiscount: boolean;
    errorDiscount: string | null;

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todos los descuentos
    fetchDiscounts: () => Promise<void>;

    // Acción para obtener un descuento individual por ID
    fetchDiscountById: (id: number | string) => Promise<void>;

    // Acciones CRUD para gestionar descuentos
    addDiscount: (discountData: Partial<DescuentoDTO>) => Promise<DescuentoDTO>; // Usar DescuentoDTO
    updateDiscount: (discount: DescuentoDTO) => Promise<DescuentoDTO>; // Usar DescuentoDTO
    deleteDiscount: (id: number | string) => Promise<void>;

    // NUEVA ACCIÓN: Para activar/desactivar un descuento
    toggleDiscountActive: (id: number, currentStatus: boolean) => Promise<DescuentoDTO>;

    // Acción para limpiar el descuento seleccionado
    clearSelectedDiscount: () => void;
}

// Creamos el store usando la función create de Zustand
export const useDiscountStore = create<DiscountState>((set, get) => ({
    // Estado inicial para la lista general de descuentos
    discounts: [],
    loading: false,
    error: null,

    // Estado inicial para descuento individual
    selectedDiscount: null,
    loadingDiscount: false,
    errorDiscount: null,

    // Implementación de la acción fetchDiscounts
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

    // Implementación de la acción fetchDiscountById
    fetchDiscountById: async (id: number | string) => {
        set({ loadingDiscount: true, errorDiscount: null, selectedDiscount: null });
        try {
            const discountData = await discountService.getById(id);
            set({ selectedDiscount: discountData, loadingDiscount: false });
        } catch (error: any) { // Se tipa 'error' como 'any' para acceder a 'response'
            console.error(`Error fetching discount with ID ${id} in store:`, error);
            const errorMessage =
                error.response?.data?.message || // Si es un error de Axios con mensaje del backend
                error.message ||
                `Failed to load discount with ID ${id}.`;
            set({
                errorDiscount: errorMessage,
                loadingDiscount: false,
                selectedDiscount: null, // Asegura que selectedDiscount sea null en caso de error
            });
            // Opcional: Puedes volver a lanzar el error si necesitas que el componente que llama lo maneje también.
            // throw error;
        }
    },

    // Implementación de la acción addDiscount
    addDiscount: async (discountData: Partial<DescuentoDTO>) => { // Usar DescuentoDTO
        // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
        // set({ loading: true, error: null });
        try {
            const newDiscount = await discountService.create(discountData);
            // Si quieres actualizar la lista inmediatamente después de crear:
            set(state => ({ discounts: [...state.discounts, newDiscount] }));
            // set({ loading: false });
            return newDiscount; // Devuelve la entidad creada
        } catch (error) {
            console.error("Error adding discount in store:", error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to add discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error para manejo en el componente/llamador
        }
    },

    // Implementación de la acción updateDiscount
    updateDiscount: async (discount: DescuentoDTO) => { // Usar DescuentoDTO
        // Opcional: Estado de carga/error para CRUD
        // set({ loading: true, error: null });
        try {
            const updatedDiscount = await discountService.update(discount);
            // Actualizar la lista de descuentos en el store después de actualizar
            set(state => ({ discounts: state.discounts.map(d => d.id === updatedDiscount.id ? updatedDiscount : d) }));
            // set({ loading: false });
            return updatedDiscount; // Devuelve la entidad actualizada
        } catch (error) {
            console.error("Error updating discount in store:", error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to update discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error
        }
    },

    // Implementación de la acción deleteDiscount
    deleteDiscount: async (id: number | string) => {
        // Opcional: Estado de carga/error para CRUD
        // set({ loading: true, error: null });
        try {
            await discountService.delete(id);
            // Eliminar el descuento de la lista en el store después de eliminar
            set(state => ({ discounts: state.discounts.filter(d => d.id !== id) }));
            // set({ loading: false });
        } catch (error) {
            console.error(`Error deleting discount with ID ${id} in store:`, error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to delete discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error
        }
    },

    // NUEVA IMPLEMENTACIÓN DE LA ACCIÓN: toggleDiscountActive
    toggleDiscountActive: async (id: number, currentStatus: boolean) => {
        set({ loadingDiscount: true, errorDiscount: null });
        try {
            // 1. Obtener el descuento actual para tener todos sus datos
            const discountToUpdate = await discountService.getById(id);

            // 2. Modificar solo la propiedad 'active'
            const updatedDiscountData: DescuentoDTO = {
                ...discountToUpdate,
                activo: !currentStatus, // Invertir el estado actual (true -> false, false -> true)
            };

            // 3. Enviar la actualización completa usando el método 'update' (PUT)
            const updatedDiscount = await discountService.update(updatedDiscountData);

            // Actualiza la lista de descuentos en el store para reflejar el cambio
            set((state) => ({
                discounts: state.discounts.map((d) =>
                    d.id === updatedDiscount.id ? updatedDiscount : d
                ),
                selectedDiscount: updatedDiscount, // Si era el seleccionado, actualízalo también
                loadingDiscount: false,
            }));
            return updatedDiscount; // Devuelve el descuento actualizado
        } catch (error) {
            console.error(`Error toggling discount status for ID ${id} in store:`, error);
            set({
                errorDiscount: `Failed to toggle discount status: ${error instanceof Error ? error.message : String(error)}`,
                loadingDiscount: false,
            });
            throw error; // Relanza el error para que el componente que llama lo maneje
        }
    },

    // Implementación de la acción clearSelectedDiscount
    clearSelectedDiscount: () => set({ selectedDiscount: null, errorDiscount: null, loadingDiscount: false }),
}));
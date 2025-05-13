// Archivo: src/store/discountStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IDescuento } from '../types/IDescuento'; // Importa la interfaz de Descuento (asegúrate de la ruta)
import { discountService } from '../https/discountApi';


// Definimos la interfaz para el estado de nuestro store de descuentos
interface DiscountState {
  // Estado para la lista general de descuentos
  discounts: IDescuento[];
  loading: boolean;
  error: string | null;

  // Estado para un descuento individual seleccionado o buscado
  selectedDiscount: IDescuento | null;
  loadingDiscount: boolean;
  errorDiscount: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los descuentos
  fetchDiscounts: () => Promise<void>;

  // Acción para obtener un descuento individual por ID
  fetchDiscountById: (id: number | string) => Promise<void>;

  // Acciones CRUD para gestionar descuentos
  addDiscount: (discountData: Partial<IDescuento>) => Promise<IDescuento>;
  updateDiscount: (discount: IDescuento) => Promise<IDescuento>;
  deleteDiscount: (id: number | string) => Promise<void>;

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
      } catch (error) {
          console.error(`Error fetching discount with ID ${id} in store:`, error);
          set({
              errorDiscount: `Failed to load discount: ${error instanceof Error ? error.message : String(error)}`,
              loadingDiscount: false,
              selectedDiscount: null, // Asegura que selectedDiscount sea null en caso de error
          });
      }
  },

  // Implementación de la acción addDiscount
  addDiscount: async (discountData: Partial<IDescuento>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newDiscount = await discountService.create(discountData);
          // Opcional: Actualizar la lista de descuentos en el store después de crear
          // set(state => ({ discounts: [...state.discounts, newDiscount] }));
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
  updateDiscount: async (discount: IDescuento) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedDiscount = await discountService.update(discount);
           // Opcional: Actualizar la lista de descuentos en el store después de actualizar
           // set(state => ({ discounts: state.discounts.map(d => d.id === updatedDiscount.id ? updatedDiscount : d) }));
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
          // Opcional: Eliminar el descuento de la lista en el store después de eliminar
          // set(state => ({ discounts: state.discounts.filter(d => d.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting discount with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete discount: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedDiscount
  clearSelectedDiscount: () => set({ selectedDiscount: null, errorDiscount: null, loadingDiscount: false }),
}));

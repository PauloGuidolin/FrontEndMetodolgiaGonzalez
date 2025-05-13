// Archivo: src/store/provinceStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IProvincia } from '../types/IProvincia'; // Importa la interfaz de Provincia (asegúrate de la ruta)
import { provinceService } from '../https/provinceApi';


// Definimos la interfaz para el estado de nuestro store de provincias
interface ProvinceState {
  // Estado para la lista general de provincias
  provinces: IProvincia[];
  loading: boolean;
  error: string | null;

  // Estado para una provincia individual seleccionada o buscada
  selectedProvince: IProvincia | null;
  loadingProvince: boolean;
  errorProvince: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las provincias
  fetchProvinces: () => Promise<void>;

  // Acción para obtener una provincia individual por ID
  fetchProvinceById: (id: number | string) => Promise<void>;

  // Acciones CRUD para gestionar provincias (probablemente para ADMIN)
  addProvince: (provinceData: Partial<IProvincia>) => Promise<IProvincia>;
  updateProvince: (province: IProvincia) => Promise<IProvincia>;
  deleteProvince: (id: number | string) => Promise<void>;

  // Acción para limpiar la provincia seleccionada
  clearSelectedProvince: () => void;
}

// Creamos el store usando la función create de Zustand
export const useProvinceStore = create<ProvinceState>((set, get) => ({
  // Estado inicial para la lista general de provincias
  provinces: [],
  loading: false,
  error: null,

  // Estado inicial para provincia individual
  selectedProvince: null,
  loadingProvince: false,
  errorProvince: null,

  // Implementación de la acción fetchProvinces
  fetchProvinces: async () => {
    set({ loading: true, error: null });

    try {
      const provincesData = await provinceService.getAll();
      set({ provinces: provincesData, loading: false });
    } catch (error) {
      console.error("Error fetching all provinces in store:", error);
      set({
        error: `Failed to load provinces: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchProvinceById
  fetchProvinceById: async (id: number | string) => {
      set({ loadingProvince: true, errorProvince: null, selectedProvince: null });
      try {
          const provinceData = await provinceService.getById(id);
          set({ selectedProvince: provinceData, loadingProvince: false });
      } catch (error) {
          console.error(`Error fetching province with ID ${id} in store:`, error);
          set({
              errorProvince: `Failed to load province: ${error instanceof Error ? error.message : String(error)}`,
              loadingProvince: false,
              selectedProvince: null, // Asegura que selectedProvince sea null en caso de error
          });
      }
  },

  // Implementación de la acción addProvince
  addProvince: async (provinceData: Partial<IProvincia>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newProvince = await provinceService.create(provinceData);
          // Opcional: Actualizar la lista de provincias en el store después de crear
          // set(state => ({ provinces: [...state.provinces, newProvince] }));
          // set({ loading: false });
          return newProvince; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding province in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add province: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateProvince
  updateProvince: async (province: IProvincia) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedProvince = await provinceService.update(province);
           // Opcional: Actualizar la lista de provincias en el store después de actualizar
           // set(state => ({ provinces: state.provinces.map(p => p.id === updatedProvince.id ? updatedProvince : p) }));
           // set({ loading: false });
           return updatedProvince; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating province in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update province: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteProvince
  deleteProvince: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await provinceService.delete(id);
          // Opcional: Eliminar la provincia de la lista en el store después de eliminar
          // set(state => ({ provinces: state.provinces.filter(p => p.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting province with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete province: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedProvince
  clearSelectedProvince: () => set({ selectedProvince: null, errorProvince: null, loadingProvince: false }),
}));

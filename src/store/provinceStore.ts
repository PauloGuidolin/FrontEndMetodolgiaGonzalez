import { create } from 'zustand';
import { ProvinciaDTO } from '../components/dto/location'; // Assuming ProvinciaDTO is your IProvincia
import { provinceService } from '../https/provinceApi';

// Definimos la interfaz para el estado de nuestro store de provincias
interface ProvinceState {
  // Estado para la lista general de provincias
  provinces: ProvinciaDTO[]; // Using ProvinciaDTO for consistency with API
  loading: boolean;
  error: string | null;

  // Estado para una provincia individual seleccionada o buscada
  selectedProvince: ProvinciaDTO | null; // Using ProvinciaDTO
  loadingProvince: boolean;
  errorProvince: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las provincias
  fetchProvinces: () => Promise<void>;

  // Acción para obtener una provincia individual por ID
  fetchProvinceById: (id: number | string) => Promise<void>;

  // Acciones CRUD para gestionar provincias (probablemente para ADMIN)
  addProvince: (provinceData: Partial<ProvinciaDTO>) => Promise<ProvinciaDTO>;
  updateProvince: (province: ProvinciaDTO) => Promise<ProvinciaDTO>;
  deleteProvince: (id: number | string) => Promise<void>;
  activateProvince: (id: number | string) => Promise<ProvinciaDTO>; // Add activate action

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
  addProvince: async (provinceData: Partial<ProvinciaDTO>) => {
    try {
      const newProvince = await provinceService.create(provinceData);
      // Optional: Update the list in the store
      set((state) => ({ provinces: [...state.provinces, newProvince] }));
      return newProvince;
    } catch (error) {
      console.error("Error adding province in store:", error);
      throw error;
    }
  },

  // Implementación de la acción updateProvince
  updateProvince: async (province: ProvinciaDTO) => {
    try {
      // Corrected: Pass the ID and the province data separately
      const updatedProvince = await provinceService.update(province.id!, province); // Assuming id is always present for update
      // Optional: Update the list in the store
      set((state) => ({
        provinces: state.provinces.map((p) =>
          p.id === updatedProvince.id ? updatedProvince : p
        ),
      }));
      // If the updated province was the selected one, update it too
      if (get().selectedProvince?.id === updatedProvince.id) {
        set({ selectedProvince: updatedProvince });
      }
      return updatedProvince;
    } catch (error) {
      console.error("Error updating province in store:", error);
      throw error;
    }
  },

  // Implementación de la acción deleteProvince
  deleteProvince: async (id: number | string) => {
    try {
      await provinceService.delete(id);
      // Optional: Remove the province from the list in the store
      set((state) => ({ provinces: state.provinces.filter((p) => p.id !== id) }));
      // If the deleted province was the selected one, clear it
      if (get().selectedProvince?.id === id) {
        set({ selectedProvince: null });
      }
    } catch (error) {
      console.error(`Error deleting province with ID ${id} in store:`, error);
      throw error;
    }
  },

  // Implementación de la acción activateProvince
  activateProvince: async (id: number | string) => {
    try {
      const activatedProvince = await provinceService.activate(id);
      // Optional: Update the list in the store (e.g., set activo to true)
      set((state) => ({
        provinces: state.provinces.map((p) =>
          p.id === activatedProvince.id ? activatedProvince : p
        ),
      }));
      // If the activated province was the selected one, update it too
      if (get().selectedProvince?.id === activatedProvince.id) {
        set({ selectedProvince: activatedProvince });
      }
      return activatedProvince;
    } catch (error) {
      console.error(`Error activating province with ID ${id} in store:`, error);
      throw error;
    }
  },

  // Implementación de la acción clearSelectedProvince
  clearSelectedProvince: () => set({ selectedProvince: null, errorProvince: null, loadingProvince: false }),
}));
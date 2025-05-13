// Archivo: src/store/localityStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { ILocalidad } from '../types/ILocalidad'; // Importa la interfaz de Localidad (asegúrate de la ruta)
import { localityService } from '../https/localityApi';

// Definimos la interfaz para el estado de nuestro store de localidades
interface LocalityState {
  // Estado para la lista general de localidades
  localities: ILocalidad[];
  loading: boolean;
  error: string | null;

  // Estado para localidades asociadas a una provincia específica
  provinceLocalities: ILocalidad[];
  loadingProvince: boolean;
  errorProvince: string | null;
  // currentProvinceId: number | string | null; // Opcional: para rastrear de qué provincia son las localidades

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las localidades
  fetchLocalities: () => Promise<void>;

  // Acción para obtener localidades de una provincia específica
  fetchLocalitiesByProvinceId: (idProvincia: number | string) => Promise<void>;

  // Acciones CRUD para gestionar localidades (probablemente para ADMIN)
  addLocality: (localityData: Partial<ILocalidad>) => Promise<ILocalidad>;
  updateLocality: (locality: ILocalidad) => Promise<ILocalidad>;
  deleteLocality: (id: number | string) => Promise<void>;

  // Puedes añadir otras acciones si son necesarias
}

// Creamos el store usando la función create de Zustand
export const useLocalityStore = create<LocalityState>((set, get) => ({
  // Estado inicial
  localities: [],
  loading: false,
  error: null,

  provinceLocalities: [],
  loadingProvince: false,
  errorProvince: null,
  // currentProvinceId: null,

  // Implementación de la acción fetchLocalities
  fetchLocalities: async () => {
    set({ loading: true, error: null });

    try {
      const localitiesData = await localityService.getAll();
      set({ localities: localitiesData, loading: false });
    } catch (error) {
      console.error("Error fetching all localities in store:", error);
      set({
        error: `Failed to load localities: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchLocalitiesByProvinceId
  fetchLocalitiesByProvinceId: async (idProvincia: number | string) => {
      set({ loadingProvince: true, errorProvince: null /*, currentProvinceId: idProvincia*/ });

      try {
          const provinceLocalitiesData = await localityService.getAllByProvinciaId(idProvincia);
          set({ provinceLocalities: provinceLocalitiesData, loadingProvince: false });
      } catch (error) {
          console.error(`Error fetching localities for province ID ${idProvincia} in store:`, error);
          set({
              errorProvince: `Failed to load province localities: ${error instanceof Error ? error.message : String(error)}`,
              loadingProvince: false,
              // Opcional: Limpiar la lista de localidades de la provincia en caso de error
              // provinceLocalities: [],
          });
      }
  },

  // Implementación de la acción addLocality
  addLocality: async (localityData: Partial<ILocalidad>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newLocality = await localityService.create(localityData);
          // Opcional: Actualizar listas relevantes en el store después de crear
          // set(state => ({ localities: [...state.localities, newLocality] }));
          // set({ loading: false });
          return newLocality; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding locality in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateLocality
  updateLocality: async (locality: ILocalidad) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedLocality = await localityService.update(locality);
           // Opcional: Actualizar listas relevantes en el store después de actualizar
           // set(state => ({
           //     localities: state.localities.map(loc => loc.id === updatedLocality.id ? updatedLocality : loc),
           //     provinceLocalities: state.provinceLocalities.map(loc => loc.id === updatedLocality.id ? updatedLocality : loc), // Actualiza en la lista de provincia si está ahí
           // }));
           // set({ loading: false });
           return updatedLocality; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating locality in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteLocality
  deleteLocality: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await localityService.delete(id);
          // Opcional: Eliminar la localidad de las listas relevantes en el store después de eliminar
          // set(state => ({
          //     localities: state.localities.filter(loc => loc.id !== id),
          //     provinceLocalities: state.provinceLocalities.filter(loc => loc.id !== id)
          // }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting locality with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },
}));

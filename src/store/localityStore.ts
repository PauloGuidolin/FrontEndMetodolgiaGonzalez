// Archivo: src/store/localityStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { LocalidadDTO, ProvinciaDTO } from '../components/dto/location'; // Importar DTOs para consistencia
import { locationService } from '../https/localityApi';


// Definimos la interfaz para el estado de nuestro store de ubicación
interface LocalityState {
    // Estado para la lista general de localidades
    localities: LocalidadDTO[];
    loading: boolean;
    error: string | null;

    // Estado para localidades asociadas a una provincia específica
    provinceLocalities: LocalidadDTO[];
    loadingProvince: boolean;
    errorProvince: string | null;

    // Estado para un descuento individual seleccionado o buscado
    selectedLocality: LocalidadDTO | null; // Nuevo: para seleccionar una localidad
    loadingLocality: boolean;
    errorLocality: string | null;

    // Estado para las provincias
    provinces: ProvinciaDTO[];
    loadingProvinces: boolean;
    errorProvinces: string | null;

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todas las provincias
    fetchProvinces: () => Promise<void>;

    // Acción para obtener todas las localidades
    fetchLocalities: () => Promise<void>;

    // Acción para obtener una localidad individual por ID
    fetchLocalityById: (id: number | string) => Promise<void>;

    // Acción para obtener localidades de una provincia específica
    fetchLocalitiesByProvinceId: (idProvincia: number | string) => Promise<void>;

    // Acciones CRUD para gestionar localidades (AHORA HABILITADAS)
    addLocality: (localityData: Partial<LocalidadDTO>) => Promise<LocalidadDTO>;
    updateLocality: (locality: LocalidadDTO) => Promise<LocalidadDTO>;
    deleteLocality: (id: number | string) => Promise<void>;

    // Acción para limpiar la localidad seleccionada
    clearSelectedLocality: () => void;
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

    selectedLocality: null, // Inicialización
    loadingLocality: false,
    errorLocality: null,

    provinces: [],
    loadingProvinces: false,
    errorProvinces: null,

    // Implementación de la acción fetchProvinces
    fetchProvinces: async () => {
        set({ loadingProvinces: true, errorProvinces: null });
        try {
            const provincesData = await locationService.getAllProvincias();
            set({ provinces: provincesData, loadingProvinces: false });
        } catch (error: any) {
            console.error("Error fetching all provinces in store:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load provinces.";
            set({
                errorProvinces: errorMessage,
                loadingProvinces: false,
            });
        }
    },

    // Implementación de la acción fetchLocalities (ahora usa el nuevo método en locationService)
    fetchLocalities: async () => {
        set({ loading: true, error: null });
        try {
            const localitiesData = await locationService.getAllLocalidades();
            set({ localities: localitiesData, loading: false });
        } catch (error: any) {
            console.error("Error fetching all localities in store:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load localities.";
            set({
                error: errorMessage,
                loading: false,
            });
        }
    },

    // Implementación de la acción fetchLocalityById (nueva)
    fetchLocalityById: async (id: number | string) => {
        set({ loadingLocality: true, errorLocality: null, selectedLocality: null });
        try {
            const localityData = await locationService.getLocalidadById(id);
            set({ selectedLocality: localityData, loadingLocality: false });
        } catch (error: any) {
            console.error(`Error fetching locality with ID ${id} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load locality with ID ${id}.`;
            set({
                errorLocality: errorMessage,
                loadingLocality: false,
                selectedLocality: null,
            });
        }
    },

    // Implementación de la acción fetchLocalitiesByProvinceId
    fetchLocalitiesByProvinceId: async (idProvincia: number | string) => {
        set({ loadingProvince: true, errorProvince: null });

        try {
            const provinceLocalitiesData = await locationService.getLocalidadesByProvinciaId(Number(idProvincia));
            set({ provinceLocalities: provinceLocalitiesData, loadingProvince: false });
        } catch (error: any) {
            console.error(`Error fetching localities for province ID ${idProvincia} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load province localities for ID ${idProvincia}.`;
            set({
                errorProvince: errorMessage,
                loadingProvince: false,
            });
        }
    },

    // Implementación de la acción addLocality (HABILITADA)
    addLocality: async (localityData: Partial<LocalidadDTO>) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga para CRUD
        try {
            const newLocality = await locationService.createLocalidad(localityData);
            // Opcional: Actualizar la lista de localidades en el store
            // set(state => ({ localities: [...state.localities, newLocality] }));
            // set({ loading: false });
            return newLocality;
        } catch (error) {
            console.error("Error adding locality in store:", error);
            // set({ error: `Failed to add locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción updateLocality (HABILITADA)
    updateLocality: async (locality: LocalidadDTO) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga para CRUD
        try {
            const updatedLocality = await locationService.updateLocalidad(locality);
            // Opcional: Actualizar listas relevantes en el store
            // set(state => ({
            //     localities: state.localities.map(loc => loc.id === updatedLocality.id ? updatedLocality : loc),
            //     provinceLocalities: state.provinceLocalities.map(loc => loc.id === updatedLocality.id ? updatedLocality : loc),
            //     selectedLocality: state.selectedLocality?.id === updatedLocality.id ? updatedLocality : state.selectedLocality,
            // }));
            // set({ loading: false });
            return updatedLocality;
        } catch (error) {
            console.error("Error updating locality in store:", error);
            // set({ error: `Failed to update locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción deleteLocality (HABILITADA)
    deleteLocality: async (id: number | string) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga para CRUD
        try {
            await locationService.deleteLocalidad(id);
            // Opcional: Eliminar la localidad de las listas relevantes en el store
            // set(state => ({
            //     localities: state.localities.filter(loc => loc.id !== id),
            //     provinceLocalities: state.provinceLocalities.filter(loc => loc.id !== id),
            //     selectedLocality: state.selectedLocality?.id === id ? null : state.selectedLocality,
            // }));
            // set({ loading: false });
        } catch (error) {
            console.error(`Error deleting locality with ID ${id} in store:`, error);
            // set({ error: `Failed to delete locality: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción clearSelectedLocality
    clearSelectedLocality: () => set({ selectedLocality: null, errorLocality: null, loadingLocality: false }),
}));
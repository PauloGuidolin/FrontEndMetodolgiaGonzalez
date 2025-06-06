// src/store/talleStore.ts
import { create } from "zustand";

import { TalleDTO } from "../components/dto/TalleDTO"; // Asegúrate de la ruta correcta a tu DTO
import { talleService } from "../https/talleService"; // Asegúrate de que esta ruta sea correcta para tu talleService

interface TalleState {
    talles: TalleDTO[];
    loading: boolean;
    error: string | null;
    selectedTalle: TalleDTO | null;
}

interface TalleActions {
    fetchAllTalles: () => Promise<void>;
    fetchTalleById: (id: number | string) => Promise<void>;
    fetchTalleByName: (name: string) => Promise<void>;
    createTalle: (talleData: Partial<Omit<TalleDTO, 'id'>>) => Promise<TalleDTO>;
    updateTalle: (talleData: TalleDTO) => Promise<TalleDTO>;
    deactivateTalle: (id: number | string) => Promise<void>;
    // ¡EL CAMBIO CLAVE ESTÁ AQUÍ!
    // El método activateTalle ahora devuelve un Promise<TalleDTO>, no Promise<void>.
    activateTalle: (id: number | string) => Promise<TalleDTO>;
    clearSelectedTalle: () => void;
    clearError: () => void;
}

/**
 * @namespace useTalleStore
 * @description Un store de Zustand para manejar el estado global de los talles.
 * Permite a los componentes acceder y modificar la lista de talles,
 * el estado de carga y errores, y el talle seleccionado.
 */
export const useTalleStore = create<TalleState & TalleActions>((set) => ({
    talles: [],
    loading: false,
    error: null,
    selectedTalle: null,

    fetchAllTalles: async () => {
        set({ loading: true, error: null });
        try {
            const talles = await talleService.getAll();
            set({ talles, loading: false });
        } catch (error: any) {
            console.error("Error fetching all talles:", error);
            set({ error: `Error al cargar talles: ${error.message || String(error)}`, loading: false });
        }
    },

    fetchTalleById: async (id: number | string) => {
        set({ loading: true, error: null, selectedTalle: null });
        try {
            const talle = await talleService.getById(id);
            set({ selectedTalle: talle, loading: false });
        } catch (error: any) {
            console.error(`Error fetching talle by ID ${id}:`, error);
            set({ error: `Error al cargar talle por ID: ${error.message || String(error)}`, loading: false, selectedTalle: null });
        }
    },

    fetchTalleByName: async (name: string) => {
        set({ loading: true, error: null, selectedTalle: null });
        try {
            const talle = await talleService.getByName(name);
            set({ selectedTalle: talle, loading: false });
        } catch (error: any) {
            console.error(`Error fetching talle by name ${name}:`, error);
            set({ error: `Error al cargar talle por nombre: ${error.message || String(error)}`, loading: false, selectedTalle: null });
        }
    },

    createTalle: async (talleData: Partial<Omit<TalleDTO, 'id'>>) => {
        set({ loading: true, error: null });
        try {
            const newTalle = await talleService.create(talleData);
            set((state) => ({
                talles: [...state.talles, newTalle],
                loading: false,
            }));
            return newTalle;
        } catch (error: any) {
            console.error("Error creating talle:", error);
            set({ error: `Error al crear talle: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    updateTalle: async (talleData: TalleDTO) => {
        set({ loading: true, error: null });
        try {
            const updatedTalle = await talleService.update(talleData);
            set((state) => ({
                talles: state.talles.map((talle) =>
                    talle.id === updatedTalle.id ? updatedTalle : talle
                ),
                loading: false,
            }));
            return updatedTalle;
        } catch (error: any) {
            console.error(`Error updating talle with ID ${talleData.id}:`, error);
            set({ error: `Error al actualizar talle: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    deactivateTalle: async (id: number | string) => {
        set({ loading: true, error: null });
        try {
            await talleService.deactivate(id);
            set((state) => ({
                talles: state.talles.map((talle) =>
                    talle.id === id ? { ...talle, activo: false } : talle
                ),
                loading: false,
            }));
        } catch (error: any) {
            console.error(`Error deactivating talle with ID ${id}:`, error);
            set({ error: `Error al desactivar talle: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    activateTalle: async (id: number | string) => {
        set({ loading: true, error: null });
        try {
            const activatedTalle = await talleService.activate(id);
            set((state) => ({
                talles: state.talles.map((talle) =>
                    talle.id === activatedTalle.id ? activatedTalle : talle
                ),
                loading: false,
            }));
            return activatedTalle;
        } catch (error: any) {
            console.error(`Error activating talle with ID ${id}:`, error);
            set({ error: `Error al activar talle: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    clearSelectedTalle: () => set({ selectedTalle: null }),
    clearError: () => set({ error: null }),
}));
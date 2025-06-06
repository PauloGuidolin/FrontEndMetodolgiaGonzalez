// src/store/colorStore.ts
import { create } from "zustand";

import { ColorDTO } from "../components/dto/ColorDTO"; // Asegúrate de la ruta correcta a tu DTO
import { colorService } from "../https/colorService";


interface ColorState {
    colors: ColorDTO[];
    loading: boolean;
    error: string | null;
    selectedColor: ColorDTO | null;
}

interface ColorActions {
    fetchAllColors: () => Promise<void>;
    fetchColorById: (id: number | string) => Promise<void>;
    fetchColorByName: (name: string) => Promise<void>;
    createColor: (colorData: Partial<Omit<ColorDTO, 'id'>>) => Promise<ColorDTO>;
    updateColor: (colorData: ColorDTO) => Promise<ColorDTO>;
    deactivateColor: (id: number | string) => Promise<void>;
    activateColor: (id: number | string) => Promise<ColorDTO>;
    clearSelectedColor: () => void;
    clearError: () => void;
}

/**
 * @namespace useColorStore
 * @description Un store de Zustand para manejar el estado global de los colores.
 * Permite a los componentes acceder y modificar la lista de colores,
 * el estado de carga y errores, y el color seleccionado.
 */
export const useColorStore = create<ColorState & ColorActions>((set) => ({
    colors: [],
    loading: false,
    error: null,
    selectedColor: null,

    fetchAllColors: async () => {
        set({ loading: true, error: null });
        try {
            const colors = await colorService.getAll();
            set({ colors, loading: false });
        } catch (error: any) {
            console.error("Error fetching all colors:", error);
            set({ error: `Error al cargar colores: ${error.message || String(error)}`, loading: false });
        }
    },

    fetchColorById: async (id: number | string) => {
        set({ loading: true, error: null, selectedColor: null });
        try {
            const color = await colorService.getById(id);
            set({ selectedColor: color, loading: false });
        } catch (error: any) {
            console.error(`Error fetching color by ID ${id}:`, error);
            set({ error: `Error al cargar color por ID: ${error.message || String(error)}`, loading: false, selectedColor: null });
        }
    },

    fetchColorByName: async (name: string) => {
        set({ loading: true, error: null, selectedColor: null });
        try {
            const color = await colorService.getByName(name);
            set({ selectedColor: color, loading: false });
        } catch (error: any) {
            console.error(`Error fetching color by name ${name}:`, error);
            set({ error: `Error al cargar color por nombre: ${error.message || String(error)}`, loading: false, selectedColor: null });
        }
    },

    createColor: async (colorData: Partial<Omit<ColorDTO, 'id'>>) => {
        set({ loading: true, error: null });
        try {
            // ¡EL CAMBIO CLAVE ESTÁ AQUÍ!
            // Ahora se llama al método `create` del `colorService`,
            // que ya maneja la llamada `http.post` y el `COLOR_ENDPOINT`.
            const newColor = await colorService.create(colorData);
            set((state) => ({
                colors: [...state.colors, newColor],
                loading: false,
            }));
            return newColor;
        } catch (error: any) {
            console.error("Error creating color:", error);
            set({ error: `Error al crear color: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    updateColor: async (colorData: ColorDTO) => {
        set({ loading: true, error: null });
        try {
            const updatedColor = await colorService.update(colorData);
            set((state) => ({
                colors: state.colors.map((color) =>
                    color.id === updatedColor.id ? updatedColor : color
                ),
                loading: false,
            }));
            return updatedColor;
        } catch (error: any) {
            console.error(`Error updating color with ID ${colorData.id}:`, error);
            set({ error: `Error al actualizar color: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    deactivateColor: async (id: number | string) => {
        set({ loading: true, error: null });
        try {
            await colorService.deactivate(id);
            set((state) => ({
                colors: state.colors.map((color) =>
                    color.id === id ? { ...color, activo: false } : color
                ),
                loading: false,
            }));
        } catch (error: any) {
            console.error(`Error deactivating color with ID ${id}:`, error);
            set({ error: `Error al desactivar color: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    activateColor: async (id: number | string) => {
        set({ loading: true, error: null });
        try {
            const activatedColor = await colorService.activate(id);
            set((state) => ({
                colors: state.colors.map((color) =>
                    color.id === activatedColor.id ? activatedColor : color
                ),
                loading: false,
            }));
            return activatedColor;
        } catch (error: any) {
            console.error(`Error activating color with ID ${id}:`, error);
            set({ error: `Error al activar color: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    clearSelectedColor: () => set({ selectedColor: null }),
    clearError: () => set({ error: null }),
}));
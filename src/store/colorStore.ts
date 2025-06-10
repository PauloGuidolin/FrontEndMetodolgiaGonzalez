// src/store/colorStore.ts
import { create } from "zustand";

import { ColorDTO } from "../components/dto/ColorDTO"; // Asegúrate de la ruta correcta a tu DTO
import { colorService } from "../https/colorService"; // Asegúrate de la ruta correcta a tu colorService


interface ColorState {
    colors: ColorDTO[];
    loading: boolean;
    error: string | null;
    selectedColor: ColorDTO | null;
}

interface ColorActions {
    // Para la administración: carga todos los colores (activos e inactivos)
    fetchAllColors: () => Promise<void>;
    // Para la página principal: carga solo los colores activos
    fetchActiveColors: () => Promise<void>;
    fetchColorById: (id: number | string) => Promise<void>;
    fetchColorByName: (name: string) => Promise<void>;
    createColor: (colorData: Partial<Omit<ColorDTO, 'id'>>) => Promise<ColorDTO>;
    updateColor: (colorData: ColorDTO) => Promise<ColorDTO>;
    // deactivateColor y activateColor se mantienen si los usas para una acción directa,
    // pero toggleStatus es más versátil y podría reemplazarlos en la UI.
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

    // Método para cargar solo los colores activos (para la página principal o filtros de usuario)
    fetchActiveColors: async () => {
        set({ loading: true, error: null });
        try {
            const activeColors = await colorService.getActives(); // Llama a `/colores`
            set({ colors: activeColors, loading: false });
        } catch (error: any) {
            console.error("Error al cargar colores activos:", error);
            set({ error: `Error al cargar colores activos: ${error.message || String(error)}`, loading: false });
        }
    },

    // Método para cargar TODOS los colores (activos e inactivos) (para el panel de administración)
    fetchAllColors: async () => {
        set({ loading: true, error: null });
        try {
            const allColors = await colorService.getAll(); // Llama a `/colores/all`
            set({ colors: allColors, loading: false });
        } catch (error: any) {
            console.error("Error al cargar todos los colores:", error);
            set({ error: `Error al cargar todos los colores: ${error.message || String(error)}`, loading: false });
        }
    },

    fetchColorById: async (id: number | string) => {
        set({ loading: true, error: null, selectedColor: null });
        try {
            const color = await colorService.getById(id);
            set({ selectedColor: color, loading: false });
        } catch (error: any) {
            console.error(`Error al cargar color por ID ${id}:`, error);
            set({ error: `Error al cargar color por ID: ${error.message || String(error)}`, loading: false, selectedColor: null });
        }
    },

    fetchColorByName: async (name: string) => {
        set({ loading: true, error: null, selectedColor: null });
        try {
            const color = await colorService.getByName(name);
            set({ selectedColor: color, loading: false });
        } catch (error: any) {
            console.error(`Error al cargar color por nombre ${name}:`, error);
            set({ error: `Error al cargar color por nombre: ${error.message || String(error)}`, loading: false, selectedColor: null });
        }
    },

    createColor: async (colorData: Partial<Omit<ColorDTO, 'id'>>) => {
        set({ loading: true, error: null });
        try {
            const newColor = await colorService.create(colorData);
            set((state) => ({
                colors: [...state.colors, newColor], // Añade el nuevo color a la lista actual (asumiendo que se añadió como activo)
                loading: false,
            }));
            return newColor;
        } catch (error: any) {
            console.error("Error al crear color:", error);
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
            console.error(`Error al actualizar color con ID ${colorData.id}:`, error);
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
            console.error(`Error al desactivar color con ID ${id}:`, error);
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
            console.error(`Error al activar color con ID ${id}:`, error);
            set({ error: `Error al activar color: ${error.message || String(error)}`, loading: false });
            throw error;
        }
    },

    clearSelectedColor: () => set({ selectedColor: null }),
    clearError: () => set({ error: null }),
}));
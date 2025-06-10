// src/store/talleStore.ts
import { create } from "zustand";
import { TalleDTO } from "../components/dto/TalleDTO"; // Asegúrate de la ruta correcta a tu DTO
import { talleService } from "../https/talleService"; // Asegúrate de que esta ruta sea correcta para tu talleService
import { toast } from 'react-toastify'; // Importa toast para notificaciones

interface TalleState {
    talles: TalleDTO[];
    loading: boolean;
    error: string | null;
    selectedTalle: TalleDTO | null;
}

interface TalleActions {
    // Método para obtener solo los talles activos (para la UI de usuario final)
    fetchActiveTalles: () => Promise<void>; 
    // Método para obtener todos los talles (activos e inactivos, para vistas de administración)
    fetchAllTallesForAdmin: () => Promise<void>; 
    fetchTalleById: (id: number | string) => Promise<void>;
    fetchTalleByName: (name: string) => Promise<void>;
    createTalle: (talleData: Partial<Omit<TalleDTO, 'id'>>) => Promise<TalleDTO>;
    updateTalle: (talleData: TalleDTO) => Promise<TalleDTO>;
    toggleTalleStatus: (id: number | string, currentStatus: boolean, denominacion: string) => Promise<TalleDTO>; 
    clearSelectedTalle: () => void;
    clearError: () => void;
}

/**
 * @namespace useTalleStore
 * @description Un store de Zustand para manejar el estado global de los talles.
 * Permite a los componentes acceder y modificar la lista de talles,
 * el estado de carga y errores, y el talle seleccionado.
 */
export const useTalleStore = create<TalleState & TalleActions>((set, get) => ({
    talles: [],
    loading: false,
    error: null,
    selectedTalle: null,

    // --- NUEVO MÉTODO: Para obtener solo talles activos (para UI de usuario final) ---
    fetchActiveTalles: async () => {
        set({ loading: true, error: null });
        try {
            // Llama al método del servicio que solo trae los activos (GET /talles)
            const talles = await talleService.getAllActive();
            set({ talles, loading: false });
        } catch (error: any) {
            console.error("Error al cargar talles activos:", error);
            set({ error: `Error al cargar talles activos: ${error.message || String(error)}`, loading: false });
            toast.error("Error al cargar talles activos: " + (error.message || "Error desconocido"));
        }
    },

    // --- MÉTODO: Para obtener todos los talles (para vistas de administración) ---
    fetchAllTallesForAdmin: async () => { 
        set({ loading: true, error: null });
        try {
            // Llama al método del servicio que trae todos los talles (GET /talles/all)
            const talles = await talleService.getAllForAdmin();
            set({ talles, loading: false });
        } catch (error: any) {
            console.error("Error al cargar todos los talles (admin):", error);
            set({ error: `Error al cargar talles (admin): ${error.message || String(error)}`, loading: false });
            toast.error("Error al cargar todos los talles (admin): " + (error.message || "Error desconocido"));
        }
    },

    fetchTalleById: async (id: number | string) => {
        set({ loading: true, error: null, selectedTalle: null });
        try {
            // Este getById en el servicio está llamando a GET /talles/{id} que solo busca activos.
            const talle = await talleService.getById(id); 
            set({ selectedTalle: talle, loading: false });
        } catch (error: any) {
            console.error(`Error fetching talle by ID ${id}:`, error);
            set({ error: `Error al cargar talle por ID: ${error.message || String(error)}`, loading: false, selectedTalle: null });
            toast.error(`Error al cargar talle con ID ${id}: ` + (error.message || "Error desconocido"));
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
            toast.error(`Error al cargar talle con nombre ${name}: ` + (error.message || "Error desconocido"));
        }
    },

    createTalle: async (talleData: Partial<Omit<TalleDTO, 'id'>>) => {
        set({ loading: true, error: null });
        try {
            const newTalle = await talleService.create(talleData);
            // Si creas un talle, lo más probable es que sea activo por defecto.
            // Si estás en una vista de administración, lo añades a la lista.
            set((state) => ({
                talles: [...state.talles, newTalle], // Asume que quieres verlo inmediatamente en la lista "todos"
                loading: false,
            }));
            toast.success(`Talle "${newTalle.nombreTalle}" creado exitosamente.`);
            return newTalle;
        } catch (error: any) {
            console.error("Error creating talle:", error);
            set({ error: `Error al crear talle: ${error.message || String(error)}`, loading: false });
            toast.error("Error al crear talle: " + (error.message || "Error desconocido"));
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
            toast.success(`Talle "${updatedTalle.nombreTalle}" actualizado exitosamente.`);
            return updatedTalle;
        } catch (error: any) {
            console.error(`Error updating talle with ID ${talleData.id}:`, error);
            set({ error: `Error al actualizar talle: ${error.message || String(error)}`, loading: false });
            toast.error(`Error al actualizar talle: ` + (error.message || "Error desconocido"));
            throw error;
        }
    },

    toggleTalleStatus: async (id: number | string, currentStatus: boolean, denominacion: string) => {
        set({ loading: true, error: null });
        try {
            const updatedTalle = await talleService.toggleActiveStatus(id, currentStatus);
            
            // Actualiza el estado del store con el talle recibido del backend
            set((state) => ({
                talles: state.talles.map((talle) =>
                    talle.id === updatedTalle.id ? updatedTalle : talle
                ),
                loading: false,
            }));
            toast.success(`Talle "${denominacion}" ${updatedTalle.activo ? 'activado' : 'desactivado'} correctamente.`);
            return updatedTalle; 
        } catch (error: any) {
            console.error(`Error al alternar estado del talle ${id}:`, error);
            set({ error: `Error al alternar estado de talle "${denominacion}": ${error.message || String(error)}`, loading: false });
            toast.error(`Error al alternar estado de talle "${denominacion}": ` + (error.message || "Error desconocido"));
            throw error;
        }
    },

    clearSelectedTalle: () => set({ selectedTalle: null }),
    clearError: () => set({ error: null }),
}));
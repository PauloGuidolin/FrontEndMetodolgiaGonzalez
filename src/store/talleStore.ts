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
    fetchAllTalles: () => Promise<void>; // Ahora buscará todos los talles (activos e inactivos)
    fetchTalleById: (id: number | string) => Promise<void>;
    fetchTalleByName: (name: string) => Promise<void>;
    createTalle: (talleData: Partial<Omit<TalleDTO, 'id'>>) => Promise<TalleDTO>;
    updateTalle: (talleData: TalleDTO) => Promise<TalleDTO>;
    // Unificamos deactivateTalle y activateTalle en un solo método toggle
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

    // --- CAMBIO CLAVE AQUÍ: Llama a getAllForAdmin para obtener TODOS los talles ---
    fetchAllTalles: async () => {
        set({ loading: true, error: null });
        try {
            // Usa el nuevo método del servicio que trae todos los talles (activos e inactivos)
            const talles = await talleService.getAllForAdmin();
            set({ talles, loading: false });
        } catch (error: any) {
            console.error("Error fetching all talles:", error);
            set({ error: `Error al cargar talles: ${error.message || String(error)}`, loading: false });
            toast.error("Error al cargar talles: " + (error.message || "Error desconocido"));
        }
    },

    fetchTalleById: async (id: number | string) => {
        set({ loading: true, error: null, selectedTalle: null });
        try {
            // Este método del servicio getById solo debería traer activos según tu BaseService.
            // Si quieres que aquí traiga inactivos también, necesitarías un endpoint y un método en talleService.ts que use el
            // buscarPorIdIncluyendoInactivos del backend, o que tu getById en talleService llame a ese.
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
            set((state) => ({
                talles: [...state.talles, newTalle],
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

    /**
     * @method toggleTalleStatus
     * @description Alterna el estado activo/inactivo de un talle usando el servicio.
     * Este método del store ahora llama al endpoint /toggleStatus del backend,
     * que es el que gestiona el cambio de estado y devuelve la entidad actualizada.
     * @param {number | string} id El ID del talle.
     * @param {boolean} currentStatus El estado actual del talle.
     * @param {string} denominacion El nombre del talle (para notificaciones).
     * @returns {Promise<TalleDTO>} La promesa que resuelve con el TalleDTO actualizado.
     */
    toggleTalleStatus: async (id: number | string, currentStatus: boolean, denominacion: string) => {
        set({ loading: true, error: null });
        try {
            // Llama al método unificado en talleService, que a su vez usa el endpoint /toggleStatus del backend.
            // El backend recibe 'currentStatus' y lo invierte internamente.
            const updatedTalle = await talleService.toggleActiveStatus(id, currentStatus);
            
            // Actualiza el estado del store con el talle recibido del backend
            set((state) => ({
                talles: state.talles.map((talle) =>
                    talle.id === updatedTalle.id ? updatedTalle : talle
                ),
                loading: false,
            }));
            toast.success(`Talle "${denominacion}" ${updatedTalle.activo ? 'activado' : 'desactivado'} correctamente.`);
            return updatedTalle; // Devuelve el talle actualizado
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
// src/services/colorService.ts
import { http } from './httpService';
import { ColorDTO } from '../components/dto/ColorDTO';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const COLOR_ENDPOINT = `${API_BASE_URL}/colores`;

export const colorService = {

    /**
     * @method getActives
     * @description Obtiene una lista de SOLO los colores activos para la página principal.
     * Corresponde al endpoint GET /colores (heredado de BaseController).
     * @returns {Promise<ColorDTO[]>} Una promesa que resuelve con un array de ColorDTO.
     * @throws {Error} Si la solicitud falla.
     */
    getActives: async (): Promise<ColorDTO[]> => {
        try {
            const response = await http.get<ColorDTO[]>(COLOR_ENDPOINT); // Llama a /colores
            return response || [];
        } catch (error) {
            console.error("Error al obtener colores activos:", error);
            throw error;
        }
    },

    /**
     * @method getAll
     * @description Obtiene una lista de TODOS los colores (activos e inactivos) para la administración.
     * Corresponde al endpoint GET /colores/all (heredado de BaseController).
     * @returns {Promise<ColorDTO[]>} Una promesa que resuelve con un array de ColorDTO.
     * @throws {Error} Si la solicitud falla.
     */
    getAll: async (): Promise<ColorDTO[]> => {
        try {
            const response = await http.get<ColorDTO[]>(`${COLOR_ENDPOINT}/all`);
            return response || [];
        } catch (error) {
            console.error("Error al obtener todos los colores (activos e inactivos):", error);
            throw error;
        }
    },

    /**
     * @method getById
     * @description Obtiene un color específico por su ID.
     * Corresponde al endpoint GET /colores/{id} (heredado de BaseController).
     * @param {number | string} id El ID del color.
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con un ColorDTO.
     * @throws {Error} Si la solicitud falla o el color no se encuentra.
     */
    getById: async (id: number | string): Promise<ColorDTO> => {
        try {
            const response = await http.get<ColorDTO>(`${COLOR_ENDPOINT}/${id}`);
            if (!response) {
                throw new Error(`Color con ID ${id} no encontrado.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al obtener el color con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * @method getByName
     * @description Obtiene un color específico por su nombre (ej. "ROJO").
     * Corresponde al endpoint GET /colores/nombre/{nombre} (específico de ColorController).
     * @param {string} nombre El nombre del color.
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con un ColorDTO.
     * @throws {Error} Si la solicitud falla o el color no se encuentra.
     */
    getByName: async (nombre: string): Promise<ColorDTO> => {
        try {
            const response = await http.get<ColorDTO>(`${COLOR_ENDPOINT}/nombre/${nombre}`);
            if (!response) {
                throw new Error(`Color con nombre ${nombre} no encontrado.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al obtener el color con nombre ${nombre}:`, error);
            throw error;
        }
    },

    /**
     * @method create
     * @description Crea un nuevo color.
     * Corresponde al endpoint POST /colores (heredado de BaseController).
     * @param {Partial<Omit<ColorDTO, 'id'>>} colorData Los datos del color a crear.
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con el ColorDTO creado.
     * @throws {Error} Si la solicitud falla.
     */
    create: async (colorData: Partial<Omit<ColorDTO, 'id'>>): Promise<ColorDTO> => {
        try {
            const response = await http.post<ColorDTO>(COLOR_ENDPOINT, colorData);
            if (!response) {
                throw new Error("No se recibió respuesta al crear el color.");
            }
            return response;
        } catch (error) {
            console.error("Error al crear el color:", error);
            throw error;
        }
    },

    /**
     * @method update
     * @description Actualiza un color existente.
     * Corresponde al endpoint PUT /colores/{id} (heredado de BaseController).
     * @param {ColorDTO} colorData Los datos del color a actualizar (debe incluir el ID).
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con el ColorDTO actualizado.
     * @throws {Error} Si la solicitud falla o el color no se encuentra.
     */
    update: async (colorData: ColorDTO): Promise<ColorDTO> => {
        if (!colorData.id) {
            throw new Error("El ID del color es necesario para actualizar.");
        }
        try {
            const response = await http.put<ColorDTO>(`${COLOR_ENDPOINT}/${colorData.id}`, colorData);
            if (!response) {
                throw new Error(`No se recibió respuesta al actualizar el color con ID ${colorData.id}.`);
            }
            return response;
            } catch (error) {
            console.error(`Error al actualizar el color con ID ${colorData.id}:`, error);
            throw error;
        }
    },

    /**
     * @method toggleStatus
     * @description Cambia el estado 'activo' de un color (de activo a inactivo y viceversa).
     * Corresponde al endpoint PUT /colores/toggleStatus/{id}?currentStatus={currentStatus}
     * @param {number | string} id El ID del color a actualizar.
     * @param {boolean} currentStatus El estado 'activo' actual del color en el momento de la llamada.
     * @returns {Promise<void>} Una promesa que resuelve cuando el cambio de estado es exitoso.
     * @throws {Error} Si la solicitud falla.
     */
    toggleStatus: async (id: number | string, currentStatus: boolean): Promise<void> => {
        try {
            await http.put<void>(`${COLOR_ENDPOINT}/toggleStatus/${id}?currentStatus=${currentStatus}`);
        } catch (error) {
            console.error(`Error al cambiar el estado del color con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * @method deactivate
     * @description Desactiva lógicamente un color por su ID (soft delete).
     * Nota: Considerando que `toggleStatus` puede manejar esto, este método podría simplificarse
     * o ser un alias de `toggleStatus(id, true)`.
     * Corresponde al endpoint DELETE /colores/{id} (heredado de BaseController).
     * @param {number | string} id El ID del color a desactivar.
     * @returns {Promise<void>} Una promesa que resuelve cuando la desactivación es exitosa.
     * @throws {Error} Si la solicitud falla.
     */
    deactivate: async (id: number | string): Promise<void> => {
        try {
            await http.delete<void>(`${COLOR_ENDPOINT}/${id}`);
        } catch (error) {
            console.error(`Error al desactivar el color con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * @method activate
     * @description Activa un color por su ID.
     * Nota: Considerando que `toggleStatus` puede manejar esto, este método podría simplificarse
     * o ser un alias de `toggleStatus(id, false)`.
     * Corresponde al endpoint PUT /colores/activar/{id} (heredado de BaseController).
     * @param {number | string} id El ID del color a activar.
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con el ColorDTO activado.
     * @throws {Error} Si la solicitud falla.
     */
    activate: async (id: number | string): Promise<ColorDTO> => {
        try {
            const response = await http.put<ColorDTO>(`${COLOR_ENDPOINT}/activar/${id}`, undefined);
            if (!response) {
                throw new Error(`No se recibió respuesta al activar el color con ID ${id}.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al activar el color con ID ${id}:`, error);
            throw error;
        }
    },
};
// src/services/colorService.ts
import { http } from './httpService';
import { ColorDTO } from '../components/dto/ColorDTO'; // Asegúrate de que la ruta sea correcta

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const COLOR_ENDPOINT = `${API_BASE_URL}/colores`; // Coincide con @RequestMapping("/colores") en tu backend

/**
 * @namespace colorService
 * @description Servicio API para interactuar con los recursos de Color.
 * Proporciona métodos para listar, buscar, crear, actualizar, eliminar (lógicamente) y activar colores.
 */
export const colorService = {

    /**
     * @method getAll
     * @description Obtiene una lista de todos los colores activos.
     * Corresponde al endpoint GET /colores (heredado de BaseController).
     * @returns {Promise<ColorDTO[]>} Una promesa que resuelve con un array de ColorDTO.
     * @throws {Error} Si la solicitud falla.
     */
    getAll: async (): Promise<ColorDTO[]> => {
        try {
            const response = await http.get<ColorDTO[]>(COLOR_ENDPOINT);
            return response || [];
        } catch (error) {
            console.error("Error al obtener todos los colores:", error);
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
            // No es necesario desestructurar 'id' aquí, ya que el tipo Partial<Omit<ColorDTO, 'id'>>
            // ya garantiza que 'id' no se pasará. Simplemente enviamos los datos.
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
     * @method deactivate
     * @description Desactiva lógicamente un color por su ID (soft delete).
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
     * Corresponde al endpoint PUT /colores/activar/{id} (heredado de BaseController).
     * @param {number | string} id El ID del color a activar.
     * @returns {Promise<ColorDTO>} Una promesa que resuelve con el ColorDTO activado.
     * @throws {Error} Si la solicitud falla.
     */
    activate: async (id: number | string): Promise<ColorDTO> => {
        try {
            const response = await http.put<ColorDTO>(`${COLOR_ENDPOINT}/activar/${id}`, undefined); // PUT sin body, asumiendo que el backend no espera uno
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

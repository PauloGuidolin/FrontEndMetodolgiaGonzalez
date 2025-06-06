// src/services/talleService.ts
import { http } from './httpService';
import { TalleDTO } from '../components/dto/TalleDTO'; // Asegúrate de que la ruta sea correcta

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TALLE_ENDPOINT = `${API_BASE_URL}/talles`; // Coincide con @RequestMapping("/talles") en tu backend

/**
 * @namespace talleService
 * @description Servicio API para interactuar con los recursos de Talle.
 * Proporciona métodos para listar, buscar, crear, actualizar, eliminar (lógicamente) y activar talles.
 */
export const talleService = {

    /**
     * @method getAll
     * @description Obtiene una lista de todos los talles activos.
     * Corresponde al endpoint GET /talles (heredado de BaseController).
     * @returns {Promise<TalleDTO[]>} Una promesa que resuelve con un array de TalleDTO.
     * @throws {Error} Si la solicitud falla.
     */
    getAll: async (): Promise<TalleDTO[]> => {
        try {
            const response = await http.get<TalleDTO[]>(TALLE_ENDPOINT);
            return response || [];
        } catch (error) {
            console.error("Error al obtener todos los talles:", error);
            throw error;
        }
    },

    /**
     * @method getById
     * @description Obtiene un talle específico por su ID.
     * Corresponde al endpoint GET /talles/{id} (heredado de BaseController).
     * @param {number | string} id El ID del talle.
     * @returns {Promise<TalleDTO>} Una promesa que resuelve con un TalleDTO.
     * @throws {Error} Si la solicitud falla o el talle no se encuentra.
     */
    getById: async (id: number | string): Promise<TalleDTO> => {
        try {
            const response = await http.get<TalleDTO>(`${TALLE_ENDPOINT}/${id}`);
            if (!response) {
                throw new Error(`Talle con ID ${id} no encontrado.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al obtener el talle con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * @method getByName
     * @description Obtiene un talle específico por su nombre (ej. "M", "TALLE_40").
     * Corresponde al endpoint GET /talles/nombre/{nombre} (específico de TalleController).
     * @param {string} nombre El nombre del talle.
     * @returns {Promise<TalleDTO>} Una promesa que resuelve con un TalleDTO.
     * @throws {Error} Si la solicitud falla o el talle no se encuentra.
     */
    getByName: async (nombre: string): Promise<TalleDTO> => {
        try {
            const response = await http.get<TalleDTO>(`${TALLE_ENDPOINT}/nombre/${nombre}`);
            if (!response) {
                throw new Error(`Talle con nombre ${nombre} no encontrado.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al obtener el talle con nombre ${nombre}:`, error);
            throw error;
        }
    },

    /**
     * @method create
     * @description Crea un nuevo talle.
     * Corresponde al endpoint POST /talles (heredado de BaseController).
     * @param {Partial<Omit<TalleDTO, 'id'>>} talleData Los datos del talle a crear.
     * @returns {Promise<TalleDTO>} Una promesa que resuelve con el TalleDTO creado.
     * @throws {Error} Si la solicitud falla.
     */
    create: async (talleData: Partial<Omit<TalleDTO, 'id'>>): Promise<TalleDTO> => {
        try {
            // No es necesario desestructurar 'id' aquí, ya que el tipo Partial<Omit<TalleDTO, 'id'>>
            // ya garantiza que 'id' no se pasará. Simplemente enviamos los datos.
            const response = await http.post<TalleDTO>(TALLE_ENDPOINT, talleData);
            if (!response) {
                throw new Error("No se recibió respuesta al crear el talle.");
            }
            return response;
        } catch (error) {
            console.error("Error al crear el talle:", error);
            throw error;
        }
    },

    /**
     * @method update
     * @description Actualiza un talle existente.
     * Corresponde al endpoint PUT /talles/{id} (heredado de BaseController).
     * @param {TalleDTO} talleData Los datos del talle a actualizar (debe incluir el ID).
     * @returns {Promise<TalleDTO>} Una promesa que resuelve con el TalleDTO actualizado.
     * @throws {Error} Si la solicitud falla o el talle no se encuentra.
     */
    update: async (talleData: TalleDTO): Promise<TalleDTO> => {
        if (!talleData.id) {
            throw new Error("El ID del talle es necesario para actualizar.");
        }
        try {
            const response = await http.put<TalleDTO>(`${TALLE_ENDPOINT}/${talleData.id}`, talleData);
            if (!response) {
                throw new Error(`No se recibió respuesta al actualizar el talle con ID ${talleData.id}.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al actualizar el talle con ID ${talleData.id}:`, error);
            throw error;
        }
    },

    /**
     * @method deactivate
     * @description Desactiva lógicamente un talle por su ID (soft delete).
     * Corresponde al endpoint DELETE /talles/{id} (heredado de BaseController).
     * @param {number | string} id El ID del talle a desactivar.
     * @returns {Promise<void>} Una promesa que resuelve cuando la desactivación es exitosa.
     * @throws {Error} Si la solicitud falla.
     */
    deactivate: async (id: number | string): Promise<void> => {
        try {
            await http.delete<void>(`${TALLE_ENDPOINT}/${id}`);
        } catch (error) {
            console.error(`Error al desactivar el talle con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * @method activate
     * @description Activa un talle por su ID.
     * Corresponde al endpoint PUT /talles/activar/{id} (heredado de BaseController).
     * @param {number | string} id El ID del talle a activar.
     * @returns {Promise<TalleDTO>} Una promesa que resuelve con el TalleDTO activado.
     * @throws {Error} Si la solicitud falla.
     */
    activate: async (id: number | string): Promise<TalleDTO> => {
        try {
            const response = await http.put<TalleDTO>(`${TALLE_ENDPOINT}/activar/${id}`, undefined); // PUT sin body, asumiendo que el backend no espera uno
            if (!response) {
                throw new Error(`No se recibió respuesta al activar el talle con ID ${id}.`);
            }
            return response;
        } catch (error) {
            console.error(`Error al activar el talle con ID ${id}:`, error);
            throw error;
        }
    },
};

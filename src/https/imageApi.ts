// src/services/imageService.ts

import { ImagenDTO } from '../components/dto/ImagenDTO';
import { http } from './httpService'; // Importa el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verifica si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
    // En un proyecto real, considera una forma más robusta de manejar esto (ej. lanzar un error fatal al inicio de la app)
}

// Define el endpoint específico para imágenes
const IMAGE_ENDPOINT = `${API_BASE_URL}/imagen`; // Coincide con @RequestMapping("/imagen")

/**
 * Servicio API para interactuar con los recursos de Imagen.
 */
export const imageService = {

    /**
     * Obtiene todas las imágenes.
     * @returns Una Promesa que resuelve con un array de ImagenDTO.
     */
    getAll: async (): Promise<ImagenDTO[]> => {
        const url = IMAGE_ENDPOINT;
        return http.get<ImagenDTO[]>(url);
    },

    /**
     * Obtiene una imagen por su ID.
     * @param id El ID de la imagen.
     * @returns Una Promesa que resuelve con un ImagenDTO.
     */
    getById: async (id: number | string): Promise<ImagenDTO> => {
        const url = `${IMAGE_ENDPOINT}/${id}`;
        return http.get<ImagenDTO>(url);
    },

    /**
     * Crea una nueva imagen.
     * @param imageData Los datos de la imagen a crear (ImagenDTO o FormData).
     * @returns Una Promesa que resuelve con la imagen creada.
     */
    create: async (imageData: Partial<ImagenDTO> | FormData): Promise<ImagenDTO> => {
        const url = IMAGE_ENDPOINT;
        // Si imageData es FormData, Axios automáticamente establece el 'Content-Type' a 'multipart/form-data'.
        // Si es un objeto JSON, lo establecerá a 'application/json'.
        return http.post<ImagenDTO>(url, imageData);
    },

    /**
     * Actualiza una imagen existente.
     * @param imageData Los datos de la imagen a actualizar (debe incluir el ID).
     * @returns Una Promesa que resuelve con la imagen actualizada.
     */
    update: async (imageData: ImagenDTO): Promise<ImagenDTO> => {
        const url = IMAGE_ENDPOINT; // El ID va en el body gracias al BaseController
        return http.put<ImagenDTO>(url, imageData);
    },

    /**
     * Elimina una imagen por su ID.
     * @param id El ID de la imagen a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    delete: async (id: number | string): Promise<void> => {
        const url = `${IMAGE_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },
};
// src/services/discountService.ts

import { DescuentoDTO } from '../components/dto/DescuentoDTO';
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
    // En un proyecto real, considera una forma más robusta de manejar esto (ej. lanzar un error fatal al inicio de la app)
}

// Definimos el endpoint específico para descuentos
// Asumimos que httpService espera la URL completa, por eso concatenamos API_BASE_URL aquí.
const DISCOUNT_ENDPOINT = `${API_BASE_URL}/descuentos`;

/**
 * Servicio API para interactuar con los recursos de Descuento.
 */
export const discountService = {

    /**
     * Obtiene todos los descuentos.
     * @returns Una Promesa que resuelve con un array de DescuentoDTO.
     */
    getAll: async (): Promise<DescuentoDTO[]> => {
        const url = DISCOUNT_ENDPOINT;
        return http.get<DescuentoDTO[]>(url);
    },

    /**
     * Obtiene un descuento por su ID.
     * @param id El ID del descuento.
     * @returns Una Promesa que resuelve con un DescuentoDTO.
     */
    getById: async (id: number | string): Promise<DescuentoDTO> => {
        const url = `${DISCOUNT_ENDPOINT}/${id}`;
        // Se elimina el try-catch explícito aquí.
        // httpService (Axios) lanzará un error para respuestas 4xx/5xx,
        // el cual será manejado en la capa de la store o el componente.
        return http.get<DescuentoDTO>(url);
    },

    /**
     * Crea un nuevo descuento.
     * @param discountData Los datos del descuento a crear.
     * @returns Una Promesa que resuelve con el descuento creado.
     */
    create: async (discountData: Partial<DescuentoDTO>): Promise<DescuentoDTO> => {
        const url = DISCOUNT_ENDPOINT;
        return http.post<DescuentoDTO>(url, discountData);
    },

    /**
     * Actualiza un descuento existente.
     * @param discountData Los datos del descuento a actualizar (debe incluir el ID).
     * @returns Una Promesa que resuelve con el descuento actualizado.
     */
    update: async (discountData: DescuentoDTO): Promise<DescuentoDTO> => {
        const url = DISCOUNT_ENDPOINT; // El ID va en el body gracias a BaseController
        return http.put<DescuentoDTO>(url, discountData);
    },

    /**
     * Elimina un descuento por su ID.
     * @param id El ID del descuento a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    delete: async (id: number | string): Promise<void> => {
        const url = `${DISCOUNT_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },
};
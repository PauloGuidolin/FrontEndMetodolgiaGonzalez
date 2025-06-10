// src/services/discountService.ts
// Asegúrate de que la ruta sea correcta, no 'components/dto'
import { DescuentoDTO } from '../components/dto/DescuentoDTO';
import { http } from '../https/httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
    // Considera lanzar un error para detener la aplicación si la base URL es crítica.
    // throw new Error("VITE_API_BASE_URL no está definida. No se puede inicializar discountService.");
}

// Definimos el endpoint específico para descuentos
const DISCOUNT_ENDPOINT = `${API_BASE_URL}/descuentos`;

/**
 * Servicio API para interactuar con los recursos de Descuento.
 */
export const discountService = {

    /**
     * Obtiene todos los descuentos (activos e inactivos) para el panel de administración.
     * Corresponde al GET /descuentos del backend.
     * @returns Una Promesa que resuelve con un array de DescuentoDTO.
     */
    getAll: async (): Promise<DescuentoDTO[]> => {
        const url = DISCOUNT_ENDPOINT; // Ya apunta a /descuentos
        return http.get<DescuentoDTO[]>(url);
    },

    /**
     * Obtiene un descuento por su ID.
     * Corresponde al GET /descuentos/{id} del backend (que ahora incluye inactivos).
     * @param id El ID del descuento.
     * @returns Una Promesa que resuelve con un DescuentoDTO.
     */
    getById: async (id: number | string): Promise<DescuentoDTO> => {
        const url = `${DISCOUNT_ENDPOINT}/${id}`;
        return http.get<DescuentoDTO>(url);
    },

    /**
     * Crea un nuevo descuento.
     * Corresponde al POST /descuentos del backend.
     * @param discountData Los datos del descuento a crear.
     * @returns Una Promesa que resuelve con el descuento creado.
     */
    create: async (discountData: Partial<DescuentoDTO>): Promise<DescuentoDTO> => {
        const url = DISCOUNT_ENDPOINT;
        return http.post<DescuentoDTO>(url, discountData);
    },

    /**
     * Actualiza un descuento existente.
     * Corresponde al PUT /descuentos/{id} del backend.
     * @param discountData Los datos del descuento a actualizar (debe incluir el ID).
     * @returns Una Promesa que resuelve con el descuento actualizado.
     */
    update: async (discountData: DescuentoDTO): Promise<DescuentoDTO> => {
        const url = `${DISCOUNT_ENDPOINT}/${discountData.id}`;
        return http.put<DescuentoDTO>(url, discountData);
    },

    /**
     * Cambia el estado 'activo' de un descuento (lo activa o desactiva).
     * Corresponde al PUT /descuentos/toggleStatus/{id}?currentStatus={boolean} del backend.
     * @param id El ID del descuento.
     * @param currentStatus El estado actual del descuento (true si está activo, false si está inactivo).
     * Se envía al backend para que invierta el estado.
     * @returns Una Promesa que resuelve con el descuento actualizado.
     */
    toggleStatus: async (id: number | string, currentStatus: boolean): Promise<DescuentoDTO> => {
        const url = `${DISCOUNT_ENDPOINT}/toggleStatus/${id}?currentStatus=${currentStatus}`;
        // Para PUT con Query Params y sin body específico, puedes pasar un objeto vacío como data
        // o si el backend espera un body vacío, usar `undefined`.
        // Depende de cómo tu backend maneje PUT sin body. Si solo lee query params, esto está bien.
        return http.put<DescuentoDTO>(url); // Se envía la petición PUT
    },

    // --- REMOVEMOS el método 'delete' ---
    // Ya no lo necesitamos porque la eliminación lógica ahora se maneja
    // mediante `toggleStatus` desde el frontend.
    /*
    delete: async (id: number | string): Promise<void> => {
        const url = `${DISCOUNT_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },
    */
};
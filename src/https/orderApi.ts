// src/services/orderService.ts (CORREGIDO)

import { CreateOrdenCompraDTO, OrdenCompraDTO } from '../components/dto/OrdenCompraDTO';
import { UserDTO } from '../components/dto/UserDTO'; // UserDTO es necesario si lo usas en otros métodos o para tipos anidados
import { http } from './httpService'; // Importamos el servicio HTTP base


// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
    // En un proyecto real, considera una forma más robusta de manejar esto, ej. lanzar un error
}

// Definimos el endpoint específico para órdenes de compra
const ORDER_ENDPOINT = `${API_BASE_URL}/orden_compra`;
// Definimos el endpoint específico para operaciones DTO de órdenes de compra
const ORDER_DTO_ENDPOINT = `${ORDER_ENDPOINT}/dto`; // Nueva ruta para los DTOs

/**
 * Servicio API para interactuar con los recursos de OrdenCompra.
 * Estos endpoints probablemente requieren autenticación.
 */
export const orderService = {

    /**
     * Obtiene todas las órdenes de compra como DTOs.
     * Coincide con el endpoint GET /orden_compra/dto en el backend.
     * @returns Una Promesa que resuelve con un array de OrdenCompraDTO.
     * @throws Un error si la solicitud falla.
     */
    getAllDTO: async (): Promise<OrdenCompraDTO[]> => {
        const url = ORDER_DTO_ENDPOINT;
        return http.get<OrdenCompraDTO[]>(url);
    },

    /**
     * Obtiene una orden de compra por su ID como DTO.
     * Coincide con el endpoint GET /orden_compra/dto/{id} en el backend.
     * @param id El ID de la orden de compra.
     * @returns Una Promesa que resuelve con un OrdenCompraDTO.
     * @throws Un error si la solicitud falla o la orden no se encuentra.
     */
    getByIdDTO: async (id: number | string): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`;
        return http.get<OrdenCompraDTO>(url);
    },

    /**
     * Obtiene todas las órdenes de compra con una fecha específica.
     * Coincide con el endpoint GET /orden_compra/fecha?fecha={fecha} en OrdenCompraController.
     * Nota: Tu backend espera la fecha como String y la parsea a LocalDateTime.
     * Asegúrate de enviar la fecha en un formato ISO 8601 ("YYYY-MM-DDTHH:mm:ss").
     * @param fecha La fecha y hora de la compra (como string en formato compatible con LocalDateTime.parse).
     * @returns Una Promesa que resuelve con un array de OrdenCompraDTO.
     * @throws Un error si la solicitud falla.
     */
    getAllByFechaCompra: async (fecha: string): Promise<OrdenCompraDTO[]> => {
        const url = `${ORDER_ENDPOINT}/fecha?fecha=${encodeURIComponent(fecha)}`;
        const response = await http.get<OrdenCompraDTO[]>(url);
        return response || [];
    },

    /**
     * Crea una nueva orden de compra.
     * Coincide con el endpoint POST /orden_compra/dto en el backend.
     * @param orderData Los datos de la orden de compra a crear (CreateOrdenCompraDTO).
     * @returns Una Promesa que resuelve con la orden de compra creada (OrdenCompraDTO).
     * @throws Un error si la solicitud falla.
     */
    createDTO: async (orderData: CreateOrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = ORDER_DTO_ENDPOINT;
        // ¡CAMBIO CLAVE AQUÍ!
        // Enviamos directamente 'orderData' que ya es un CreateOrdenCompraDTO.
        // No necesitamos construir un OrdenCompraDTO completo aquí.
        return http.post<OrdenCompraDTO>(url, orderData);
    },

    /**
     * Actualiza una orden de compra existente.
     * Coincide con el endpoint PUT /orden_compra/dto/{id} en el backend.
     * @param id El ID de la orden de compra.
     * @param orderData Los datos de la orden de compra a actualizar.
     * @returns Una Promesa que resuelve con la orden de compra actualizada (OrdenCompraDTO).
     * @throws Un error si la solicitud falla.
     */
    updateDTO: async (id: number | string, orderData: OrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`;
        return http.put<OrdenCompraDTO>(url, orderData);
    },

    /**
     * Elimina una orden de compra por su ID (soft delete).
     * Coincide con el endpoint DELETE /orden_compra/{id} (heredado y sobreescrito en BaseController).
     * @param id El ID de la orden de compra a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     * @throws Un error si la solicitud falla.
     */
    delete: async (id: number | string): Promise<void> => {
        const url = `${ORDER_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    /**
     * Activa una orden de compra por su ID.
     * Coincide con el endpoint PUT /orden_compra/activar/{id} en BaseController.
     * @param id El ID de la orden de compra a activar.
     * @returns Una Promesa que resuelve con la orden de compra activada (OrdenCompraDTO).
     * @throws Un error si la solicitud falla.
     */
    activate: async (id: number | string): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_ENDPOINT}/activar/${id}`;
        return http.put<OrdenCompraDTO>(url, {}); // PUT requests often expect a body, even if empty
    },

    /**
     * Obtiene órdenes de compra por ID de usuario como DTOs.
     * Coincide con el endpoint GET /orden_compra/usuario/{userId} en el backend.
     * @param userId El ID del usuario.
     * @returns Una Promesa que resuelve con un array de OrdenCompraDTO.
     * @throws Un error si la solicitud falla.
     */
    getOrdersByUserIdDTO: async (userId: number | string): Promise<OrdenCompraDTO[]> => {
        const url = `${ORDER_ENDPOINT}/usuario/${userId}`;
        return http.get<OrdenCompraDTO[]>(url);
    },
};
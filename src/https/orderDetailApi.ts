// src/https/orderDetailApi.ts (O la ruta correcta para tu servicio de API de detalles de orden)

import { OrdenCompraDetalleDTO } from '../components/dto/OrdenCompraDetalleDTO'; // Asegúrate de esta ruta
import { http } from './httpService'; // Asumo que tienes un httpService base

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const ORDER_DETAIL_ENDPOINT = `${API_BASE_URL}/orden_compra_detalle`;

export const orderDetailService = {
    // Métodos CRUD básicos para la entidad principal (si los usas)
    // Coinciden con los endpoints heredados de BaseController si no hay /dto en el backend
    getAll: async (): Promise<OrdenCompraDetalleDTO[]> => {
        // Asumo que tu backend en /orden_compra_detalle ya devuelve DTOs o la lógica del servicio lo mapea.
        // Si tu backend usa /orden_compra_detalle/dto, el endpoint aquí debería ser ese.
        const url = `${ORDER_DETAIL_ENDPOINT}/dto`; // Usamos el endpoint /dto del backend
        return http.get<OrdenCompraDetalleDTO[]>(url);
    },

    getById: async (id: number | string): Promise<OrdenCompraDetalleDTO> => {
        const url = `<span class="math-inline">\{ORDER\_DETAIL\_ENDPOINT\}/dto/</span>{id}`; // Usamos el endpoint /dto/{id} del backend
        return http.get<OrdenCompraDetalleDTO>(url);
    },

    create: async (data: Partial<OrdenCompraDetalleDTO>): Promise<OrdenCompraDetalleDTO> => {
        const url = `${ORDER_DETAIL_ENDPOINT}/dto`; // Usamos el endpoint /dto del backend
        return http.post<OrdenCompraDetalleDTO>(url, data);
    },

    update: async (data: OrdenCompraDetalleDTO): Promise<OrdenCompraDetalleDTO> => {
        const url = `<span class="math-inline">\{ORDER\_DETAIL\_ENDPOINT\}/dto/</span>{data.id}`; // Usamos el endpoint /dto/{id} del backend (asumo que el ID está en el cuerpo y también en la URL para PUT DTO)
        return http.put<OrdenCompraDetalleDTO>(url, data);
    },

    delete: async (id: number | string): Promise<void> => {
        const url = `<span class="math-inline">\{ORDER\_DETAIL\_ENDPOINT\}/</span>{id}`; // Asumo que el DELETE es sobre la entidad base, no /dto
        return http.delete<void>(url);
    },

    // Métodos específicos de OrdenCompraDetalleController
    getAllByOrdenCompraId: async (orderId: number | string): Promise<OrdenCompraDetalleDTO[]> => {
        const url = `<span class="math-inline">\{ORDER\_DETAIL\_ENDPOINT\}/orden/</span>{orderId}`;
        try {
            const response = await http.get<OrdenCompraDetalleDTO[]>(url);
            return response || [];
        } catch (error) {
            if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Si el backend devuelve 404 para no encontrado
            }
            throw error;
        }
    },

    getAllByProductoDetalleId: async (productDetailId: number | string): Promise<OrdenCompraDetalleDTO[]> => {
        const url = `<span class="math-inline">\{ORDER\_DETAIL\_ENDPOINT\}/producto\_detalle/</span>{productDetailId}`;
        try {
            const response = await http.get<OrdenCompraDetalleDTO[]>(url);
            return response || [];
        } catch (error) {
            if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Si el backend devuelve 404 para no encontrado
            }
            throw error;
        }
    }
};
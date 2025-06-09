// src/https/orderDetailApi.ts

import { OrdenCompraDetalleDTO } from '../components/dto/OrdenCompraDetalleDTO';
import { http } from './httpService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const ORDER_DETAIL_ENDPOINT = `${API_BASE_URL}/orden_compra_detalle`;

export const orderDetailService = {
    getAll: async (): Promise<OrdenCompraDetalleDTO[]> => {
        // Asegúrate de que el backend tenga GET /orden_compra_detalle/dto
        const url = `${ORDER_DETAIL_ENDPOINT}/dto`;
        return http.get<OrdenCompraDetalleDTO[]>(url);
    },

    getById: async (id: number | string): Promise<OrdenCompraDetalleDTO> => {
        // Asegúrate de que el backend tenga GET /orden_compra_detalle/dto/{id}
        const url = `${ORDER_DETAIL_ENDPOINT}/dto/${id}`;
        return http.get<OrdenCompraDetalleDTO>(url);
    },

    create: async (data: Partial<OrdenCompraDetalleDTO>): Promise<OrdenCompraDetalleDTO> => {
        // Asegúrate de que el backend tenga POST /orden_compra_detalle/dto
        const url = `${ORDER_DETAIL_ENDPOINT}/dto`;
        return http.post<OrdenCompraDetalleDTO>(url, data);
    },

    update: async (data: OrdenCompraDetalleDTO): Promise<OrdenCompraDetalleDTO> => {
        // Asegúrate de que el backend tenga PUT /orden_compra_detalle/dto/{id}
        const url = `${ORDER_DETAIL_ENDPOINT}/dto/${data.id}`;
        return http.put<OrdenCompraDetalleDTO>(url, data);
    },

    delete: async (id: number | string): Promise<void> => {
        // Asegúrate de que el backend tenga DELETE /orden_compra_detalle/{id}
        // Si tienes DELETE /orden_compra_detalle/dto/{id}, usa esa URL.
        const url = `${ORDER_DETAIL_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    getAllByOrdenCompraId: async (orderId: number | string): Promise<OrdenCompraDetalleDTO[]> => {
        // Asegúrate de que el backend tenga GET /orden_compra_detalle/orden/{orderId}
        const url = `${ORDER_DETAIL_ENDPOINT}/orden/${orderId}`;
        try {
            const response = await http.get<OrdenCompraDetalleDTO[]>(url);
            return response || [];
        } catch (error) {
            if (error instanceof Error && error.message.includes('Status: 404')) {
                return [];
            }
            throw error;
        }
    },

    getAllByProductoDetalleId: async (productDetailId: number | string): Promise<OrdenCompraDetalleDTO[]> => {
        // Asegúrate de que el backend tenga GET /orden_compra_detalle/producto_detalle/{productDetailId}
        const url = `${ORDER_DETAIL_ENDPOINT}/producto_detalle/${productDetailId}`;
        try {
            const response = await http.get<OrdenCompraDetalleDTO[]>(url);
            return response || [];
        } catch (error) {
            if (error instanceof Error && error.message.includes('Status: 404')) {
                return [];
            }
            throw error;
        }
    }
};
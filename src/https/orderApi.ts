// src/https/orderApi.ts

import { CreateOrdenCompraDTO, OrdenCompraDTO } from '../components/dto/OrdenCompraDTO'; // Importa UserInfoDTO
// import { UserDTO } from '../components/dto/UserDTO'; // Si UserDTO es redundante con UserInfoDTO, podrías eliminarlo.

import { http } from './httpService';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const ORDER_ENDPOINT = `${API_BASE_URL}/orden_compra`;
const ORDER_DTO_ENDPOINT = `${ORDER_ENDPOINT}/dto`; // /orden_compra/dto

export const orderService = {
    getAllDTO: async (): Promise<OrdenCompraDTO[]> => {
        const url = ORDER_DTO_ENDPOINT;
        return http.get<OrdenCompraDTO[]>(url);
    },

    getByIdDTO: async (id: number | string): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`; // /orden_compra/dto/{id}
        return http.get<OrdenCompraDTO>(url);
    },

    getAllByFechaCompra: async (fecha: string): Promise<OrdenCompraDTO[]> => {
        // En el backend, el endpoint es /orden_compra/fecha
        const url = `${ORDER_ENDPOINT}/fecha?fecha=${encodeURIComponent(fecha)}`;
        const response = await http.get<OrdenCompraDTO[]>(url);
        return response || [];
    },

    createDTO: async (orderData: CreateOrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = ORDER_DTO_ENDPOINT; // /orden_compra/dto (POST)
        return http.post<OrdenCompraDTO>(url, orderData);
    },

    updateDTO: async (id: number | string, orderData: OrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`; // /orden_compra/dto/{id} (PUT)
        return http.put<OrdenCompraDTO>(url, orderData);
    },

    delete: async (id: number | string): Promise<void> => {
        // En el backend, el endpoint es /orden_compra/{id} (DELETE)
        const url = `${ORDER_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    // activate: async (id: number | string): Promise<OrdenCompraDTO> => {
    //     // *** ELIMINADO: No hay endpoint /activar/{id} en el backend según el código proporcionado.
    //     // Si lo necesitas, debes implementarlo en el backend primero.
    //     throw new Error("El método 'activate' no está implementado en el backend.");
    // },

    getOrdersByUserIdDTO: async (userId: number | string): Promise<OrdenCompraDTO[]> => {
        // En el backend, el endpoint es /orden_compra/usuario/{userId}
        const url = `${ORDER_ENDPOINT}/usuario/${userId}`;
        return http.get<OrdenCompraDTO[]>(url);
    },

    // --- NUEVO MÉTODO PARA ACTUALIZAR ESTADO DE ORDEN ---
    updateOrderStatus: async (ordenId: number | string, estado: string, mpPaymentId: string | null): Promise<OrdenCompraDTO> => {
        // En el backend, el endpoint es PUT /orden_compra/{ordenId}/estado
        const url = `${ORDER_ENDPOINT}/${ordenId}/estado`;
        const payload = {
            estado: estado,
            mpPaymentId: mpPaymentId // Puede ser null
        };
        return http.put<OrdenCompraDTO>(url, payload);
    }
};
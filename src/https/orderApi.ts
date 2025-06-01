// src/https/orderApi.ts (Renombrado de src/services/orderService.ts)

import { CreateOrdenCompraDTO, OrdenCompraDTO } from '../components/dto/OrdenCompraDTO';
import { UserDTO } from '../components/dto/UserDTO'; // UserDTO es necesario si lo usas en otros métodos o para tipos anidados
import { http } from './httpService';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const ORDER_ENDPOINT = `${API_BASE_URL}/orden_compra`;
const ORDER_DTO_ENDPOINT = `${ORDER_ENDPOINT}/dto`;

export const orderService = { // Exporta orderService tal cual lo importas
    // ... todos los métodos de tu orderService actual ...
    getAllDTO: async (): Promise<OrdenCompraDTO[]> => {
        const url = ORDER_DTO_ENDPOINT;
        return http.get<OrdenCompraDTO[]>(url);
    },

    getByIdDTO: async (id: number | string): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`;
        return http.get<OrdenCompraDTO>(url);
    },

    getAllByFechaCompra: async (fecha: string): Promise<OrdenCompraDTO[]> => {
        const url = `${ORDER_ENDPOINT}/fecha?fecha=${encodeURIComponent(fecha)}`;
        const response = await http.get<OrdenCompraDTO[]>(url);
        return response || [];
    },

    createDTO: async (orderData: CreateOrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = ORDER_DTO_ENDPOINT;
        return http.post<OrdenCompraDTO>(url, orderData);
    },

    updateDTO: async (id: number | string, orderData: OrdenCompraDTO): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_DTO_ENDPOINT}/${id}`;
        return http.put<OrdenCompraDTO>(url, orderData);
    },

    delete: async (id: number | string): Promise<void> => {
        const url = `${ORDER_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    activate: async (id: number | string): Promise<OrdenCompraDTO> => {
        const url = `${ORDER_ENDPOINT}/activar/${id}`;
        return http.put<OrdenCompraDTO>(url, {});
    },

    getOrdersByUserIdDTO: async (userId: number | string): Promise<OrdenCompraDTO[]> => {
        const url = `${ORDER_ENDPOINT}/usuario/${userId}`;
        return http.get<OrdenCompraDTO[]>(url);
    },
};
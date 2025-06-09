// src/store/orderStore.ts

import { create } from 'zustand';
import { OrdenCompraDTO, CreateOrdenCompraDTO } from '../components/dto/OrdenCompraDTO';
import { orderService } from '../https/orderApi'; // Asegúrate de que la ruta sea correcta

// Definimos la interfaz para el estado de nuestro store de ordenes de compra
interface OrderState {
    orders: OrdenCompraDTO[];
    loading: boolean;
    error: string | null;

    selectedOrder: OrdenCompraDTO | null;
    loadingOrder: boolean;
    errorOrder: string | null;

    ordersByDate: OrdenCompraDTO[];
    loadingOrdersByDate: boolean;
    errorOrdersByDate: string | null;

    ordersByUser: OrdenCompraDTO[];
    loadingOrdersByUser: boolean;
    errorOrdersByUser: string | null;

    fetchOrders: () => Promise<void>;
    fetchOrderById: (id: number | string) => Promise<void>;
    fetchOrdersByDate: (fecha: string) => Promise<void>;
    fetchOrdersByUserId: (userId: number | string) => Promise<void>;

    addOrder: (orderData: CreateOrdenCompraDTO) => Promise<OrdenCompraDTO>;
    updateOrder: (id: number | string, orderData: OrdenCompraDTO) => Promise<OrdenCompraDTO>;
    deleteOrder: (id: number | string) => Promise<void>;
    // activateOrder: (id: number | string) => Promise<OrdenCompraDTO>; // <<< ELIMINADA: No hay método en orderApi.ts

    clearSelectedOrder: () => void;
}

// Creamos el store usando la función create de Zustand
export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    loading: false,
    error: null,

    selectedOrder: null,
    loadingOrder: false,
    errorOrder: null,

    ordersByDate: [],
    loadingOrdersByDate: false,
    errorOrdersByDate: null,

    ordersByUser: [],
    loadingOrdersByUser: false,
    errorOrdersByUser: null,

    fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
            const ordersData = await orderService.getAllDTO();
            set({ orders: ordersData, loading: false });
        } catch (error: any) {
            console.error("Error fetching all orders in store:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load orders.";
            set({
                error: errorMessage,
                loading: false,
            });
        }
    },

    fetchOrderById: async (id: number | string) => {
        set({ loadingOrder: true, errorOrder: null, selectedOrder: null });
        try {
            const orderData = await orderService.getByIdDTO(id);
            set({ selectedOrder: orderData, loadingOrder: false });
        } catch (error: any) {
            console.error(`Error fetching order with ID ${id} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load order: ${id}.`;
            set({
                errorOrder: errorMessage,
                loadingOrder: false,
                selectedOrder: null,
            });
        }
    },

    fetchOrdersByDate: async (fecha: string) => {
        set({ loadingOrdersByDate: true, errorOrdersByDate: null });
        try {
            const ordersData = await orderService.getAllByFechaCompra(fecha);
            set({ ordersByDate: ordersData, loadingOrdersByDate: false });
        } catch (error: any) {
            console.error(`Error fetching orders by date ${fecha} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load orders by date: ${fecha}.`;
            set({
                errorOrdersByDate: errorMessage,
                loadingOrdersByDate: false,
                ordersByDate: [],
            });
        }
    },

    fetchOrdersByUserId: async (userId: number | string) => {
        set({ loadingOrdersByUser: true, errorOrdersByUser: null });
        try {
            const ordersData = await orderService.getOrdersByUserIdDTO(userId);
            set({ ordersByUser: ordersData, loadingOrdersByUser: false });
        } catch (error: any) {
            console.error(`Error fetching orders by user ID ${userId} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load orders for user: ${userId}.`;
            set({
                errorOrdersByUser: errorMessage,
                loadingOrdersByUser: false,
                ordersByUser: [],
            });
        }
    },

    addOrder: async (orderData: CreateOrdenCompraDTO) => {
        try {
            const newOrder = await orderService.createDTO(orderData);
            // Opcional: Actualizar la lista de órdenes en el store después de crear
            set(state => ({ orders: [...state.orders, newOrder] })); // <<< DESCOMENTADO
            return newOrder;
        } catch (error) {
            console.error("Error adding order in store:", error);
            throw error;
        }
    },

    updateOrder: async (id: number | string, orderData: OrdenCompraDTO) => {
        try {
            const updatedOrder = await orderService.updateDTO(id, orderData);
            // Opcional: Actualizar listas relevantes en el store
            set(state => ({
                orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o),
                selectedOrder: state.selectedOrder?.id === updatedOrder.id ? updatedOrder : state.selectedOrder,
            })); // <<< DESCOMENTADO
            return updatedOrder;
        } catch (error) {
            console.error("Error updating order in store:", error);
            throw error;
        }
    },

    deleteOrder: async (id: number | string) => {
        try {
            await orderService.delete(id);
            // Opcional: Eliminar la orden de las listas relevantes en el store
            set(state => ({
                orders: state.orders.filter(o => o.id !== id),
                selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
            })); // <<< DESCOMENTADO
        } catch (error) {
            console.error(`Error deleting order with ID ${id} in store:`, error);
            throw error;
        }
    },

    // activateOrder: async (id: number | string) => { // <<< ELIMINADA
    //     try {
    //         const activatedOrder = await orderService.activate(id);
    //         set(state => ({
    //             orders: state.orders.map(o => o.id === activatedOrder.id ? activatedOrder : o),
    //             selectedOrder: state.selectedOrder?.id === activatedOrder.id ? activatedOrder : state.selectedOrder,
    //         }));
    //         return activatedOrder;
    //     } catch (error) {
    //         console.error(`Error activating order with ID ${id} in store:`, error);
    //         throw error;
    //     }
    // },

    clearSelectedOrder: () => set({ selectedOrder: null, errorOrder: null, loadingOrder: false }),
}));
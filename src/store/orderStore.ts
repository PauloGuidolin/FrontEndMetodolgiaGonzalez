// Archivo: src/store/orderStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { OrdenCompraDTO, CreateOrdenCompraDTO } from '../components/dto/OrdenCompraDTO'; // Importa los DTOs
import { orderService } from '../https/orderApi'; // Asegúrate de que la ruta sea correcta (anteriormente era services/orderService.ts)

// Definimos la interfaz para el estado de nuestro store de ordenes de compra
interface OrderState {
    // Estado para la lista general de ordenes de compra (ej. para un panel de administración)
    orders: OrdenCompraDTO[]; // Usar OrdenCompraDTO
    loading: boolean;
    error: string | null;

    // Estado para un orden individual seleccionado o buscado
    selectedOrder: OrdenCompraDTO | null; // Usar OrdenCompraDTO
    loadingOrder: boolean;
    errorOrder: string | null;

    // Estado para ordenes de compra obtenidas por fecha
    ordersByDate: OrdenCompraDTO[]; // Usar OrdenCompraDTO
    loadingOrdersByDate: boolean;
    errorOrdersByDate: string | null;
    // dateFilter: string | null; // Opcional: para rastrear la fecha del filtro

    // Estado para órdenes de compra obtenidas por usuario
    ordersByUser: OrdenCompraDTO[]; // Nuevo estado
    loadingOrdersByUser: boolean; // Nuevo estado
    errorOrdersByUser: string | null; // Nuevo estado

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todas las ordenes de compra (usando DTOs)
    fetchOrders: () => Promise<void>;

    // Acción para obtener una orden de compra individual por ID (usando DTOs)
    fetchOrderById: (id: number | string) => Promise<void>;

    // Acción para obtener ordenes de compra por fecha
    fetchOrdersByDate: (fecha: string) => Promise<void>;

    // Acción para obtener órdenes de compra por ID de usuario
    fetchOrdersByUserId: (userId: number | string) => Promise<void>;

    // Acciones CRUD para gestionar ordenes de compra
    // Para crear, usamos CreateOrdenCompraDTO
    addOrder: (orderData: CreateOrdenCompraDTO) => Promise<OrdenCompraDTO>;
    // Para actualizar, usamos OrdenCompraDTO completo
    updateOrder: (id: number | string, orderData: OrdenCompraDTO) => Promise<OrdenCompraDTO>;
    deleteOrder: (id: number | string) => Promise<void>;
    activateOrder: (id: number | string) => Promise<OrdenCompraDTO>; // Acción para activar

    // Acción para limpiar la orden seleccionada
    clearSelectedOrder: () => void;
}

// Creamos el store usando la función create de Zustand
export const useOrderStore = create<OrderState>((set, get) => ({
    // Estado inicial para la lista general de ordenes de compra
    orders: [],
    loading: false,
    error: null,

    // Estado inicial para orden individual
    selectedOrder: null,
    loadingOrder: false,
    errorOrder: null,

    // Estado inicial para ordenes por fecha
    ordersByDate: [],
    loadingOrdersByDate: false,
    errorOrdersByDate: null,

    // Estado inicial para ordenes por usuario
    ordersByUser: [],
    loadingOrdersByUser: false,
    errorOrdersByUser: null,

    // Implementación de la acción fetchOrders (usando getAllDTO)
    fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
            const ordersData = await orderService.getAllDTO(); // Llama a getAllDTO
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

    // Implementación de la acción fetchOrderById (usando getByIdDTO)
    fetchOrderById: async (id: number | string) => {
        set({ loadingOrder: true, errorOrder: null, selectedOrder: null });
        try {
            const orderData = await orderService.getByIdDTO(id); // Llama a getByIdDTO
            set({ selectedOrder: orderData, loadingOrder: false });
        } catch (error: any) {
            console.error(`Error fetching order with ID ${id} in store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Failed to load order: ${id}.`;
            set({
                errorOrder: errorMessage,
                loadingOrder: false,
                selectedOrder: null, // Asegura que selectedOrder sea null en caso de error
            });
        }
    },

    // Implementación de la acción fetchOrdersByDate
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
                ordersByDate: [], // Limpiar la lista en caso de error
            });
        }
    },

    // Implementación de la acción fetchOrdersByUserId (Nueva)
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

    // Implementación de la acción addOrder (usando createDTO)
    addOrder: async (orderData: CreateOrdenCompraDTO) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga/error específico para CRUD
        try {
            const newOrder = await orderService.createDTO(orderData); // Llama a createDTO
            // Opcional: Actualizar la lista de órdenes en el store después de crear
            // set(state => ({ orders: [...state.orders, newOrder] }));
            // set({ loading: false });
            return newOrder;
        } catch (error) {
            console.error("Error adding order in store:", error);
            // set({ error: `Failed to add order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción updateOrder (usando updateDTO)
    updateOrder: async (id: number | string, orderData: OrdenCompraDTO) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga/error específico para CRUD
        try {
            const updatedOrder = await orderService.updateDTO(id, orderData); // Llama a updateDTO
            // Opcional: Actualizar listas relevantes en el store
            // set(state => ({
            //     orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o),
            //     selectedOrder: state.selectedOrder?.id === updatedOrder.id ? updatedOrder : state.selectedOrder,
            // }));
            // set({ loading: false });
            return updatedOrder;
        } catch (error) {
            console.error("Error updating order in store:", error);
            // set({ error: `Failed to update order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción deleteOrder (usando delete del BaseController)
    deleteOrder: async (id: number | string) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga/error específico para CRUD
        try {
            await orderService.delete(id); // Llama a delete (del BaseController)
            // Opcional: Eliminar la orden de las listas relevantes en el store
            // set(state => ({
            //     orders: state.orders.filter(o => o.id !== id),
            //     selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
            // }));
            // set({ loading: false });
        } catch (error) {
            console.error(`Error deleting order with ID ${id} in store:`, error);
            // set({ error: `Failed to delete order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción activateOrder (usando activate del BaseController)
    activateOrder: async (id: number | string) => {
        // set({ loading: true, error: null }); // Opcional: estado de carga/error específico para CRUD
        try {
            const activatedOrder = await orderService.activate(id); // Llama a activate (del BaseController)
            // Opcional: Actualizar la orden en las listas relevantes
            // set(state => ({
            //     orders: state.orders.map(o => o.id === activatedOrder.id ? activatedOrder : o),
            //     selectedOrder: state.selectedOrder?.id === activatedOrder.id ? activatedOrder : state.selectedOrder,
            // }));
            // set({ loading: false });
            return activatedOrder;
        } catch (error) {
            console.error(`Error activating order with ID ${id} in store:`, error);
            // set({ error: `Failed to activate order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error;
        }
    },

    // Implementación de la acción clearSelectedOrder
    clearSelectedOrder: () => set({ selectedOrder: null, errorOrder: null, loadingOrder: false }),
}));
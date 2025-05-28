// Archivo: src/store/orderDetailStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { OrdenCompraDetalleDTO } from '../components/dto/OrdenCompraDetalleDTO'; // Asumo que tienes un DTO para esto
import { orderDetailService } from '../https/orderDetailApi'; // Asegúrate de que esta ruta sea correcta

// Definimos la interfaz para el estado de nuestro store de detalles de orden de compra
interface OrderDetailState {
    // Estado para la lista general de detalles de orden de compra (ej. para un panel de administración)
    orderDetails: OrdenCompraDetalleDTO[]; // Usar el DTO
    loading: boolean;
    error: string | null;

    // Estado para un detalle individual seleccionado o buscado
    selectedOrderDetail: OrdenCompraDetalleDTO | null; // Usar el DTO
    loadingOrderDetail: boolean;
    errorOrderDetail: string | null;

    // Estado para detalles de ordenes de compra asociados a una OrdenCompra padre
    orderDetailsByOrderId: OrdenCompraDetalleDTO[]; // Usar el DTO
    loadingByOrder: boolean;
    errorByOrder: string | null;

    // Estado para detalles de ordenes de compra asociados a un ProductoDetalle
    orderDetailsByProductDetailId: OrdenCompraDetalleDTO[]; // Usar el DTO
    loadingByProductDetail: boolean;
    errorByProductDetail: string | null;

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todos los detalles de orden de compra (usando el endpoint DTO si lo hay)
    fetchOrderDetails: () => Promise<void>;

    // Acción para obtener un detalle individual por ID (usando el endpoint DTO si lo hay)
    fetchOrderDetailById: (id: number | string) => Promise<void>;

    // Acción para obtener detalles por ID de OrdenCompra padre
    fetchOrderDetailsByOrderId: (orderId: number | string) => Promise<void>;

    // Acción para obtener detalles por ID de ProductoDetalle
    fetchOrderDetailsByProductDetailId: (productDetailId: number | string) => Promise<void>;

    // Acciones CRUD para gestionar detalles de orden de compra
    addOrderDetail: (orderDetailData: Partial<OrdenCompraDetalleDTO>) => Promise<OrdenCompraDetalleDTO>;
    updateOrderDetail: (orderDetail: OrdenCompraDetalleDTO) => Promise<OrdenCompraDetalleDTO>;
    deleteOrderDetail: (id: number | string) => Promise<void>;

    // Acción para limpiar el detalle seleccionado
    clearSelectedOrderDetail: () => void;
}

// Creamos el store usando la función create de Zustand
export const useOrderDetailStore = create<OrderDetailState>((set, get) => ({
    // Estado inicial para la lista general de detalles
    orderDetails: [],
    loading: false,
    error: null,

    // Estado inicial para detalle individual
    selectedOrderDetail: null,
    loadingOrderDetail: false,
    errorOrderDetail: null,

    // Estado inicial para detalles por ID de OrdenCompra
    orderDetailsByOrderId: [],
    loadingByOrder: false,
    errorByOrder: null,

    // Estado inicial para detalles por ID de ProductoDetalle
    orderDetailsByProductDetailId: [],
    loadingByProductDetail: false,
    errorByProductDetail: null,

    // Implementación de la acción fetchOrderDetails
    fetchOrderDetails: async () => {
        set({ loading: true, error: null });
        try {
            // Asumo que orderDetailService.getAll() ahora devuelve DTOs
            const orderDetailsData = await orderDetailService.getAll();
            set({ orderDetails: orderDetailsData, loading: false });
        } catch (error: any) {
            console.error("Error al obtener todos los detalles de orden en la store:", error);
            const errorMessage = error.response?.data?.message || error.message || "Fallo al cargar los detalles de orden.";
            set({
                error: errorMessage,
                loading: false,
            });
        }
    },

    // Implementación de la acción fetchOrderDetailById
    fetchOrderDetailById: async (id: number | string) => {
        set({ loadingOrderDetail: true, errorOrderDetail: null, selectedOrderDetail: null });
        try {
            // Asumo que orderDetailService.getById() ahora devuelve un DTO
            const orderDetailData = await orderDetailService.getById(id);
            set({ selectedOrderDetail: orderDetailData, loadingOrderDetail: false });
        } catch (error: any) {
            console.error(`Error al obtener detalle de orden con ID ${id} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar el detalle de orden con ID ${id}.`;
            set({
                errorOrderDetail: errorMessage,
                loadingOrderDetail: false,
                selectedOrderDetail: null, // Asegura que selectedOrderDetail sea null en caso de error
            });
        }
    },

    // Implementación de la acción fetchOrderDetailsByOrderId
    fetchOrderDetailsByOrderId: async (orderId: number | string) => {
        set({ loadingByOrder: true, errorByOrder: null });
        try {
            // Asumo que orderDetailService.getAllByOrdenCompraId() devuelve DTOs
            const orderDetailsData = await orderDetailService.getAllByOrdenCompraId(orderId);
            set({ orderDetailsByOrderId: orderDetailsData, loadingByOrder: false });
        } catch (error: any) {
            console.error(`Error al obtener detalles de orden para el ID de orden ${orderId} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar los detalles de orden por ID de orden: ${orderId}.`;
            set({
                errorByOrder: errorMessage,
                loadingByOrder: false,
                orderDetailsByOrderId: [], // Limpiar la lista en caso de error
            });
        }
    },

    // Implementación de la acción fetchOrderDetailsByProductDetailId
    fetchOrderDetailsByProductDetailId: async (productDetailId: number | string) => {
        set({ loadingByProductDetail: true, errorByProductDetail: null });
        try {
            // Asumo que orderDetailService.getAllByProductoDetalleId() devuelve DTOs
            const orderDetailsData = await orderDetailService.getAllByProductoDetalleId(productDetailId);
            set({ orderDetailsByProductDetailId: orderDetailsData, loadingByProductDetail: false });
        } catch (error: any) {
            console.error(`Error al obtener detalles de orden para el ID de producto detalle ${productDetailId} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar los detalles de orden por ID de producto detalle: ${productDetailId}.`;
            set({
                errorByProductDetail: errorMessage,
                loadingByProductDetail: false,
                orderDetailsByProductDetailId: [], // Limpiar la lista en caso de error
            });
        }
    },

    // Implementación de la acción addOrderDetail
    addOrderDetail: async (orderDetailData: Partial<OrdenCompraDetalleDTO>) => {
        try {
            const newOrderDetail = await orderDetailService.create(orderDetailData);
            return newOrderDetail;
        } catch (error) {
            console.error("Error al agregar detalle de orden en la store:", error);
            throw error;
        }
    },

    // Implementación de la acción updateOrderDetail
    updateOrderDetail: async (orderDetail: OrdenCompraDetalleDTO) => {
        try {
            const updatedOrderDetail = await orderDetailService.update(orderDetail);
            return updatedOrderDetail;
        } catch (error) {
            console.error("Error al actualizar detalle de orden en la store:", error);
            throw error;
        }
    },

    // Implementación de la acción deleteOrderDetail
    deleteOrderDetail: async (id: number | string) => {
        try {
            await orderDetailService.delete(id);
        } catch (error) {
            console.error(`Error al eliminar detalle de orden con ID ${id} en la store:`, error);
            throw error;
        }
    },

    // Implementación de la acción clearSelectedOrderDetail
    clearSelectedOrderDetail: () => set({ selectedOrderDetail: null, errorOrderDetail: null, loadingOrderDetail: false }),
}));
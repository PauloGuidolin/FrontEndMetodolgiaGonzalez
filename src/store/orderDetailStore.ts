// src/store/orderDetailStore.ts

import { create } from 'zustand';
import { OrdenCompraDetalleDTO } from '../components/dto/OrdenCompraDetalleDTO';
import { orderDetailService } from '../https/orderDetailApi';

interface OrderDetailState {
    orderDetails: OrdenCompraDetalleDTO[];
    loading: boolean;
    error: string | null;

    selectedOrderDetail: OrdenCompraDetalleDTO | null;
    loadingOrderDetail: boolean;
    errorOrderDetail: string | null;

    orderDetailsByOrderId: OrdenCompraDetalleDTO[];
    loadingByOrder: boolean;
    errorByOrder: string | null;

    orderDetailsByProductDetailId: OrdenCompraDetalleDTO[];
    loadingByProductDetail: boolean;
    errorByProductDetail: string | null;

    fetchOrderDetails: () => Promise<void>;
    fetchOrderDetailById: (id: number | string) => Promise<void>;
    fetchOrderDetailsByOrderId: (orderId: number | string) => Promise<void>;
    fetchOrderDetailsByProductDetailId: (productDetailId: number | string) => Promise<void>;

    addOrderDetail: (orderDetailData: Partial<OrdenCompraDetalleDTO>) => Promise<OrdenCompraDetalleDTO>;
    updateOrderDetail: (orderDetail: OrdenCompraDetalleDTO) => Promise<OrdenCompraDetalleDTO>;
    deleteOrderDetail: (id: number | string) => Promise<void>;

    clearSelectedOrderDetail: () => void;
}

export const useOrderDetailStore = create<OrderDetailState>((set, get) => ({
    orderDetails: [],
    loading: false,
    error: null,

    selectedOrderDetail: null,
    loadingOrderDetail: false,
    errorOrderDetail: null,

    orderDetailsByOrderId: [],
    loadingByOrder: false,
    errorByOrder: null,

    orderDetailsByProductDetailId: [],
    loadingByProductDetail: false,
    errorByProductDetail: null,

    fetchOrderDetails: async () => {
        set({ loading: true, error: null });
        try {
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

    fetchOrderDetailById: async (id: number | string) => {
        set({ loadingOrderDetail: true, errorOrderDetail: null, selectedOrderDetail: null });
        try {
            const orderDetailData = await orderDetailService.getById(id);
            set({ selectedOrderDetail: orderDetailData, loadingOrderDetail: false });
        } catch (error: any) {
            console.error(`Error al obtener detalle de orden con ID ${id} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar el detalle de orden con ID ${id}.`;
            set({
                errorOrderDetail: errorMessage,
                loadingOrderDetail: false,
                selectedOrderDetail: null,
            });
        }
    },

    fetchOrderDetailsByOrderId: async (orderId: number | string) => {
        set({ loadingByOrder: true, errorByOrder: null });
        try {
            const orderDetailsData = await orderDetailService.getAllByOrdenCompraId(orderId);
            set({ orderDetailsByOrderId: orderDetailsData, loadingByOrder: false });
        } catch (error: any) {
            console.error(`Error al obtener detalles de orden para el ID de orden ${orderId} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar los detalles de orden por ID de orden: ${orderId}.`;
            set({
                errorByOrder: errorMessage,
                loadingByOrder: false,
                orderDetailsByOrderId: [],
            });
        }
    },

    fetchOrderDetailsByProductDetailId: async (productDetailId: number | string) => {
        set({ loadingByProductDetail: true, errorByProductDetail: null });
        try {
            const orderDetailsData = await orderDetailService.getAllByProductoDetalleId(productDetailId);
            set({ orderDetailsByProductDetailId: orderDetailsData, loadingByProductDetail: false });
        } catch (error: any) {
            console.error(`Error al obtener detalles de orden para el ID de producto detalle ${productDetailId} en la store:`, error);
            const errorMessage = error.response?.data?.message || error.message || `Fallo al cargar los detalles de orden por ID de producto detalle: ${productDetailId}.`;
            set({
                errorByProductDetail: errorMessage,
                loadingByProductDetail: false,
                orderDetailsByProductDetailId: [],
            });
        }
    },

    addOrderDetail: async (orderDetailData: Partial<OrdenCompraDetalleDTO>) => {
        try {
            const newOrderDetail = await orderDetailService.create(orderDetailData);
            return newOrderDetail;
        } catch (error) {
            console.error("Error al agregar detalle de orden en la store:", error);
            throw error;
        }
    },

    updateOrderDetail: async (orderDetail: OrdenCompraDetalleDTO) => {
        try {
            const updatedOrderDetail = await orderDetailService.update(orderDetail);
            return updatedOrderDetail;
        } catch (error) {
            console.error("Error al actualizar detalle de orden en la store:", error);
            throw error;
        }
    },

    deleteOrderDetail: async (id: number | string) => {
        try {
            await orderDetailService.delete(id);
        } catch (error) {
            console.error(`Error al eliminar detalle de orden con ID ${id} en la store:`, error);
            throw error;
        }
    },

    clearSelectedOrderDetail: () => set({ selectedOrderDetail: null, errorOrderDetail: null, loadingOrderDetail: false }),
}));
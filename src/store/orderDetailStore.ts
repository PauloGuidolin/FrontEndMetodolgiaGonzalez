// Archivo: src/store/orderDetailStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IOrdenCompraDetalle } from '../types/IOrdenCompraDetalle'; // Importa la interfaz de OrdenCompraDetalle (asegúrate de la ruta)
import { orderDetailService } from '../https/orderDetailApi';

// Definimos la interfaz para el estado de nuestro store de detalles de orden de compra
interface OrderDetailState {
  // Estado para la lista general de detalles de orden de compra (ej. para un panel de administración)
  orderDetails: IOrdenCompraDetalle[];
  loading: boolean;
  error: string | null;

  // Estado para un detalle individual seleccionado o buscado
  selectedOrderDetail: IOrdenCompraDetalle | null;
  loadingOrderDetail: boolean;
  errorOrderDetail: string | null;

  // Estado para detalles de ordenes de compra asociados a una OrdenCompra padre
  orderDetailsByOrderId: IOrdenCompraDetalle[];
  loadingByOrder: boolean;
  errorByOrder: string | null;
  // currentOrderId: number | string | null; // Opcional: para rastrear de qué orden son los detalles

  // Estado para detalles de ordenes de compra asociados a un ProductoDetalle
  orderDetailsByProductDetailId: IOrdenCompraDetalle[];
  loadingByProductDetail: boolean;
  errorByProductDetail: string | null;
  // currentProductDetailId: number | string | null; // Opcional: para rastrear de qué producto detalle son los detalles

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los detalles de orden de compra
  fetchOrderDetails: () => Promise<void>;

  // Acción para obtener un detalle individual por ID
  fetchOrderDetailById: (id: number | string) => Promise<void>;

  // Acción para obtener detalles por ID de OrdenCompra padre
  fetchOrderDetailsByOrderId: (orderId: number | string) => Promise<void>;

  // Acción para obtener detalles por ID de ProductoDetalle
  fetchOrderDetailsByProductDetailId: (productDetailId: number | string) => Promise<void>;

  // Acciones CRUD para gestionar detalles de orden de compra (probablemente para ADMIN o procesos internos)
  // Nota: Crear/actualizar/eliminar detalles de orden generalmente se hace a través de la OrdenCompra padre en el backend.
  // Estas acciones aquí serían si tuvieras endpoints directos para CRUD de detalles.
  addOrderDetail: (orderDetailData: Partial<IOrdenCompraDetalle>) => Promise<IOrdenCompraDetalle>;
  updateOrderDetail: (orderDetail: IOrdenCompraDetalle) => Promise<IOrdenCompraDetalle>;
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
  // currentOrderId: null,

  // Estado inicial para detalles por ID de ProductoDetalle
  orderDetailsByProductDetailId: [],
  loadingByProductDetail: false,
  errorByProductDetail: null,
  // currentProductDetailId: null,

  // Implementación de la acción fetchOrderDetails
  fetchOrderDetails: async () => {
    set({ loading: true, error: null });

    try {
      const orderDetailsData = await orderDetailService.getAll();
      set({ orderDetails: orderDetailsData, loading: false });
    } catch (error) {
      console.error("Error fetching all order details in store:", error);
      set({
        error: `Failed to load order details: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchOrderDetailById
  fetchOrderDetailById: async (id: number | string) => {
      set({ loadingOrderDetail: true, errorOrderDetail: null, selectedOrderDetail: null });
      try {
          const orderDetailData = await orderDetailService.getById(id);
          set({ selectedOrderDetail: orderDetailData, loadingOrderDetail: false });
      } catch (error) {
          console.error(`Error fetching order detail with ID ${id} in store:`, error);
          set({
              errorOrderDetail: `Failed to load order detail: ${error instanceof Error ? error.message : String(error)}`,
              loadingOrderDetail: false,
              selectedOrderDetail: null, // Asegura que selectedOrderDetail sea null en caso de error
          });
      }
  },

   // Implementación de la acción fetchOrderDetailsByOrderId
  fetchOrderDetailsByOrderId: async (orderId: number | string) => {
      set({ loadingByOrder: true, errorByOrder: null /*, currentOrderId: orderId*/ });
      try {
          const orderDetailsData = await orderDetailService.getAllByOrdenCompraId(orderId);
          set({ orderDetailsByOrderId: orderDetailsData, loadingByOrder: false });
      } catch (error) {
          console.error(`Error fetching order details for order ID ${orderId} in store:`, error);
           set({
              errorByOrder: `Failed to load order details by order ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingByOrder: false,
              orderDetailsByOrderId: [], // Limpiar la lista en caso de error
          });
      }
  },

   // Implementación de la acción fetchOrderDetailsByProductDetailId
  fetchOrderDetailsByProductDetailId: async (productDetailId: number | string) => {
      set({ loadingByProductDetail: true, errorByProductDetail: null /*, currentProductDetailId: productDetailId*/ });
      try {
          const orderDetailsData = await orderDetailService.getAllByProductoDetalleId(productDetailId);
          set({ orderDetailsByProductDetailId: orderDetailsData, loadingByProductDetail: false });
      } catch (error) {
          console.error(`Error fetching order details for product detail ID ${productDetailId} in store:`, error);
           set({
              errorByProductDetail: `Failed to load order details by product detail ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingByProductDetail: false,
              orderDetailsByProductDetailId: [], // Limpiar la lista en caso de error
          });
      }
  },

  // Implementación de la acción addOrderDetail (si tuvieras un endpoint directo)
  addOrderDetail: async (orderDetailData: Partial<IOrdenCompraDetalle>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newOrderDetail = await orderDetailService.create(orderDetailData);
          // Opcional: Actualizar listas relevantes en el store después de crear
          // set(state => ({ orderDetails: [...state.orderDetails, newOrderDetail] }));
          // set({ loading: false });
          return newOrderDetail; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding order detail in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add order detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateOrderDetail (si tuvieras un endpoint directo)
  updateOrderDetail: async (orderDetail: IOrdenCompraDetalle) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedOrderDetail = await orderDetailService.update(orderDetail);
           // Opcional: Actualizar listas relevantes en el store después de actualizar
           // set(state => ({ orderDetails: state.orderDetails.map(od => od.id === updatedOrderDetail.id ? updatedOrderDetail : od) }));
           // set({ loading: false });
           return updatedOrderDetail; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating order detail in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update order detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteOrderDetail (si tuvieras un endpoint directo)
  deleteOrderDetail: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await orderDetailService.delete(id);
          // Opcional: Eliminar el detalle de las listas relevantes en el store después de eliminar
          // set(state => ({
          //     orderDetails: state.orderDetails.filter(od => od.id !== id),
          //     orderDetailsByOrderId: state.orderDetailsByOrderId.filter(od => od.id !== id),
          //     orderDetailsByProductDetailId: state.orderDetailsByProductDetailId.filter(od => od.id !== id),
          // }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting order detail with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete order detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedOrderDetail
  clearSelectedOrderDetail: () => set({ selectedOrderDetail: null, errorOrderDetail: null, loadingOrderDetail: false }),
}));

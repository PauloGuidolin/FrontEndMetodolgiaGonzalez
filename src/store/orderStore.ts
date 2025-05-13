// Archivo: src/store/orderStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IOrdenCompra } from '../types/IOrdenCompra'; // Importa la interfaz de OrdenCompra (asegúrate de la ruta)
import { orderService } from '../https/orderApi';

// Definimos la interfaz para el estado de nuestro store de ordenes de compra
interface OrderState {
  // Estado para la lista general de ordenes de compra (ej. para un panel de administración)
  orders: IOrdenCompra[];
  loading: boolean;
  error: string | null;

  // Estado para un orden individual seleccionado o buscado
  selectedOrder: IOrdenCompra | null;
  loadingOrder: boolean;
  errorOrder: string | null;

  // Estado para ordenes de compra obtenidas por fecha
  ordersByDate: IOrdenCompra[];
  loadingOrdersByDate: boolean;
  errorOrdersByDate: string | null;
  // dateFilter: string | null; // Opcional: para rastrear la fecha del filtro

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las ordenes de compra
  fetchOrders: () => Promise<void>;

  // Acción para obtener una orden de compra individual por ID
  fetchOrderById: (id: number | string) => Promise<void>;

  // Acción para obtener ordenes de compra por fecha
  fetchOrdersByDate: (fecha: string) => Promise<void>;

  // Acciones CRUD para gestionar ordenes de compra (probablemente para ADMIN o procesos internos)
  addOrder: (orderData: Partial<IOrdenCompra>) => Promise<IOrdenCompra>;
  updateOrder: (order: IOrdenCompra) => Promise<IOrdenCompra>;
  deleteOrder: (id: number | string) => Promise<void>;

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
  // dateFilter: null,

  // Implementación de la acción fetchOrders
  fetchOrders: async () => {
    set({ loading: true, error: null });

    try {
      const ordersData = await orderService.getAll();
      set({ orders: ordersData, loading: false });
    } catch (error) {
      console.error("Error fetching all orders in store:", error);
      set({
        error: `Failed to load orders: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchOrderById
  fetchOrderById: async (id: number | string) => {
      set({ loadingOrder: true, errorOrder: null, selectedOrder: null });
      try {
          const orderData = await orderService.getById(id);
          set({ selectedOrder: orderData, loadingOrder: false });
      } catch (error) {
          console.error(`Error fetching order with ID ${id} in store:`, error);
          set({
              errorOrder: `Failed to load order: ${error instanceof Error ? error.message : String(error)}`,
              loadingOrder: false,
              selectedOrder: null, // Asegura que selectedOrder sea null en caso de error
          });
      }
  },

   // Implementación de la acción fetchOrdersByDate
  fetchOrdersByDate: async (fecha: string) => {
      set({ loadingOrdersByDate: true, errorOrdersByDate: null /*, dateFilter: fecha*/ });
      try {
          const ordersData = await orderService.getAllByFechaCompra(fecha);
          set({ ordersByDate: ordersData, loadingOrdersByDate: false });
      } catch (error) {
          console.error(`Error fetching orders by date ${fecha} in store:`, error);
           set({
              errorOrdersByDate: `Failed to load orders by date: ${error instanceof Error ? error.message : String(error)}`,
              loadingOrdersByDate: false,
              ordersByDate: [], // Limpiar la lista en caso de error
          });
      }
  },

  // Implementación de la acción addOrder
  addOrder: async (orderData: Partial<IOrdenCompra>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newOrder = await orderService.create(orderData);
          // Opcional: Actualizar listas relevantes en el store después de crear
          // set(state => ({ orders: [...state.orders, newOrder] }));
          // set({ loading: false });
          return newOrder; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding order in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateOrder
  updateOrder: async (order: IOrdenCompra) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedOrder = await orderService.update(order);
           // Opcional: Actualizar listas relevantes en el store después de actualizar
           // set(state => ({ orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o) }));
           // set({ loading: false });
           return updatedOrder; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating order in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteOrder
  deleteOrder: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await orderService.delete(id);
          // Opcional: Eliminar la orden de las listas relevantes en el store después de eliminar
          // set(state => ({ orders: state.orders.filter(o => o.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting order with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete order: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedOrder
  clearSelectedOrder: () => set({ selectedOrder: null, errorOrder: null, loadingOrder: false }),
}));

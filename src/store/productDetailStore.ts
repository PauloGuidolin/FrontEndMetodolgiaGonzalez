// Archivo: src/store/productDetailStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IProductoDetalle } from '../types/IProductoDetalle'; // Importa la interfaz de ProductoDetalle (asegúrate de la ruta)
import { Color } from '../types/IColor'; // Importa los enums si los usas en parámetros
import { Talle } from '../types/ITalle';
import { productDetailService } from '../https/productDetailApi';


// Definimos la interfaz para el estado de nuestro store de detalles de producto
interface ProductDetailState {
  // Estado para la lista general de detalles de producto (ej. para un panel de administración)
  productDetails: IProductoDetalle[];
  loading: boolean;
  error: string | null;

  // Estado para un detalle individual seleccionado o buscado
  selectedProductDetail: IProductoDetalle | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  // Estado para detalles de producto asociados a un Producto padre
  productDetailsByProductId: IProductoDetalle[];
  loadingByProduct: boolean;
  errorByProduct: string | null;
  // currentProductId: number | string | null; // Opcional: para rastrear de qué producto son los detalles

  // Estado para detalles de producto obtenidos por filtros o búsqueda específica
  filteredProductDetails: IProductoDetalle[];
  loadingFiltered: boolean;
  errorFiltered: string | null;
  // currentFilters: { productoId?: number | string, color?: Color, talle?: Talle, stockMin?: number | string }; // Opcional: para rastrear los filtros aplicados

  // Estado para talles y colores disponibles para un producto específico
  availableTalles: Talle[];
  loadingTalles: boolean;
  errorTalles: string | null;

  availableColores: Color[];
  loadingColores: boolean;
  errorColores: string | null;


  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los detalles de producto
  fetchProductDetails: () => Promise<void>;

  // Acción para obtener un detalle individual por ID
  fetchProductDetailById: (id: number | string) => Promise<void>;

  // Acción para obtener detalles por ID de Producto padre
  fetchProductDetailsByProductId: (productId: number | string) => Promise<void>;

  // Acción para buscar un detalle por producto, talle y color
  fetchProductDetailByProductTalleColor: (productoId: number | string, talle: Talle, color: Color) => Promise<void>;

  // Acción para obtener detalles con stock mayor a un mínimo
  fetchProductDetailsByStockGreaterThan: (stockMinimo: number | string) => Promise<void>;

  // Acción para filtrar detalles por varias opciones
  filterProductDetailsByOptions: (
      productoId?: number | string,
      color?: Color,
      talle?: Talle,
      stockMin?: number | string
    ) => Promise<void>;

  // Acción para obtener talles disponibles para un producto
  fetchAvailableTallesByProductId: (productId: number | string) => Promise<void>;

  // Acción para obtener colores disponibles para un producto
  fetchAvailableColoresByProductId: (productId: number | string) => Promise<void>;

  // Acción para descontar stock de un detalle de producto
  discountStock: (productoDetalleId: number | string, cantidad: number) => Promise<void>;

  // Acción para verificar si un producto detalle está disponible
  checkAvailability: (productoId: number | string, talle: Talle, color: Color) => Promise<boolean>;


  // Acciones CRUD para gestionar detalles de producto (probablemente para ADMIN)
  addProductDetail: (productDetailData: Partial<IProductoDetalle>) => Promise<IProductoDetalle>;
  updateProductDetail: (productDetail: IProductoDetalle) => Promise<IProductoDetalle>;
  deleteProductDetail: (id: number | string) => Promise<void>;

  // Acción para limpiar el detalle seleccionado
  clearSelectedProductDetail: () => void;

  // Acción para limpiar los detalles filtrados
  clearFilteredProductDetails: () => void;
}

// Creamos el store usando la función create de Zustand
export const useProductDetailStore = create<ProductDetailState>((set, get) => ({
  // Estado inicial para la lista general de detalles
  productDetails: [],
  loading: false,
  error: null,

  // Estado inicial para detalle individual
  selectedProductDetail: null,
  loadingDetail: false,
  errorDetail: null,

  // Estado inicial para detalles por ID de Producto
  productDetailsByProductId: [],
  loadingByProduct: false,
  errorByProduct: null,
  // currentProductId: null,

  // Estado inicial para detalles filtrados
  filteredProductDetails: [],
  loadingFiltered: false,
  errorFiltered: null,
  // currentFilters: {},

  // Estado inicial para talles y colores disponibles
  availableTalles: [],
  loadingTalles: false,
  errorTalles: null,

  availableColores: [],
  loadingColores: false,
  errorColores: null,


  // Implementación de la acción fetchProductDetails
  fetchProductDetails: async () => {
    set({ loading: true, error: null });

    try {
      const productDetailsData = await productDetailService.getAll();
      set({ productDetails: productDetailsData, loading: false });
    } catch (error) {
      console.error("Error fetching all product details in store:", error);
      set({
        error: `Failed to load product details: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchProductDetailById
  fetchProductDetailById: async (id: number | string) => {
      set({ loadingDetail: true, errorDetail: null, selectedProductDetail: null });
      try {
          const productDetailData = await productDetailService.getById(id);
          set({ selectedProductDetail: productDetailData, loadingDetail: false });
      } catch (error) {
          console.error(`Error fetching product detail with ID ${id} in store:`, error);
          set({
              errorDetail: `Failed to load product detail: ${error instanceof Error ? error.message : String(error)}`,
              loadingDetail: false,
              selectedProductDetail: null, // Asegura que selectedProductDetail sea null en caso de error
          });
      }
  },

   // Implementación de la acción fetchProductDetailsByProductId
  fetchProductDetailsByProductId: async (productId: number | string) => {
      set({ loadingByProduct: true, errorByProduct: null /*, currentProductId: productId*/ });
      try {
          const productDetailsData = await productDetailService.getAllByProductoId(productId);
          set({ productDetailsByProductId: productDetailsData, loadingByProduct: false });
      } catch (error) {
          console.error(`Error fetching product details for product ID ${productId} in store:`, error);
           set({
              errorByProduct: `Failed to load product details by product ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingByProduct: false,
              productDetailsByProductId: [], // Limpiar la lista en caso de error
          });
      }
  },

   // Implementación de la acción fetchProductDetailByProductTalleColor
  fetchProductDetailByProductTalleColor: async (productoId: number | string, talle: Talle, color: Color) => {
      set({ loadingDetail: true, errorDetail: null, selectedProductDetail: null }); // Usamos los estados de detalle individual
      try {
          const productDetailData = await productDetailService.getByProductoIdAndTalleAndColor(productoId, talle, color);
          set({ selectedProductDetail: productDetailData, loadingDetail: false });
      } catch (error) {
          console.error(`Error fetching product detail by product ID ${productoId}, talle ${talle}, color ${color} in store:`, error);
           set({
              errorDetail: `Failed to load product detail: ${error instanceof Error ? error.message : String(error)}`,
              loadingDetail: false,
              selectedProductDetail: null,
          });
      }
  },

   // Implementación de la acción fetchProductDetailsByStockGreaterThan
  fetchProductDetailsByStockGreaterThan: async (stockMinimo: number | string) => {
      set({ loadingFiltered: true, errorFiltered: null }); // Usamos los estados de lista filtrada
      try {
          const productDetailsData = await productDetailService.findAllByStockActualGreaterThan(stockMinimo);
          set({ filteredProductDetails: productDetailsData, loadingFiltered: false });
      } catch (error) {
          console.error(`Error fetching product details with stock greater than ${stockMinimo} in store:`, error);
           set({
              errorFiltered: `Failed to load product details by stock: ${error instanceof Error ? error.message : String(error)}`,
              loadingFiltered: false,
              filteredProductDetails: [], // Limpiar la lista en caso de error
          });
      }
   },

   // Implementación de la acción filterProductDetailsByOptions
  filterProductDetailsByOptions: async (
      productoId?: number | string,
      color?: Color,
      talle?: Talle,
      stockMin?: number | string
    ) => {
       set({ loadingFiltered: true, errorFiltered: null /*, currentFilters: { productoId, color, talle, stockMin }*/ });
       try {
            const filteredData = await productDetailService.filtrarPorOpciones(productoId, color, talle, stockMin);
            set({ filteredProductDetails: filteredData, loadingFiltered: false });
       } catch (error) {
            console.error(`Error filtering product details in store:`, error);
            set({
                errorFiltered: `Failed to filter product details: ${error instanceof Error ? error.message : String(error)}`,
                loadingFiltered: false,
                filteredProductDetails: [], // Limpiar la lista en caso de error
            });
       }
   },

    // Implementación de la acción fetchAvailableTallesByProductId
  fetchAvailableTallesByProductId: async (productId: number | string) => {
       set({ loadingTalles: true, errorTalles: null, availableTalles: [] });
       try {
            const tallesData = await productDetailService.getAvailableTallesByProductoId(productId);
            set({ availableTalles: tallesData, loadingTalles: false });
       } catch (error) {
            console.error(`Error fetching available talles for product ID ${productId} in store:`, error);
            set({
                errorTalles: `Failed to load available talles: ${error instanceof Error ? error.message : String(error)}`,
                loadingTalles: false,
                availableTalles: [], // Limpiar la lista en caso de error
            });
       }
   },

    // Implementación de la acción fetchAvailableColoresByProductId
  fetchAvailableColoresByProductId: async (productId: number | string) => {
       set({ loadingColores: true, errorColores: null, availableColores: [] });
       try {
            const coloresData = await productDetailService.getAvailableColoresByProductoId(productId);
            set({ availableColores: coloresData, loadingColores: false });
       } catch (error) {
            console.error(`Error fetching available colores for product ID ${productId} in store:`, error);
            set({
                errorColores: `Failed to load available colores: ${error instanceof Error ? error.message : String(error)}`,
                loadingColores: false,
                availableColores: [], // Limpiar la lista en caso de error
            });
       }
   },

   // Implementación de la acción discountStock
   // Esta acción no actualiza el estado de la lista localmente, solo llama al servicio
  discountStock: async (productoDetalleId: number | string, cantidad: number) => {
       // Opcional: Puedes poner un estado de carga/error específico para esta operación
       // set({ loading: true, error: null });
      try {
          await productDetailService.descontarStock(productoDetalleId, cantidad);
          // Opcional: Si necesitas actualizar el stock en el store, tendrías que refetch
          // el detalle específico o la lista que lo contiene.
          // set({ loading: false });
      } catch (error) {
          console.error(`Error discounting stock for product detail ID ${productoDetalleId} in store:`, error);
           // Opcional: Establecer un error específico para esta operación
          // set({ error: `Failed to discount stock: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error (ej. stock insuficiente)
      }
   },

    // Implementación de la acción checkAvailability
   checkAvailability: async (productoId: number | string, talle: Talle, color: Color): Promise<boolean> => {
       // Esta acción no modifica el estado del store, solo devuelve un boolean
       try {
           const isAvailable = await productDetailService.estaDisponible(productoId, talle, color);
           return isAvailable; // Devuelve el resultado directamente
       } catch (error) {
           console.error(`Error checking availability for product ID ${productoId}, talle ${talle}, color ${color} in store:`, error);
           // Opcional: Puedes establecer un error si la llamada falla, pero no es necesario si solo devuelves un boolean
           throw error; // Relanza el error
       }
   },


  // Implementación de la acción addProductDetail (si tuvieras un endpoint directo)
  addProductDetail: async (productDetailData: Partial<IProductoDetalle>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newProductDetail = await productDetailService.create(productDetailData);
          // Opcional: Actualizar listas relevantes en el store después de crear
          // set(state => ({ productDetails: [...state.productDetails, newProductDetail] }));
          // set({ loading: false });
          return newProductDetail; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding product detail in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add product detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateProductDetail (si tuvieras un endpoint directo)
  updateProductDetail: async (productDetail: IProductoDetalle) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedProductDetail = await productDetailService.update(productDetail);
           // Opcional: Actualizar listas relevantes en el store después de actualizar
           // set(state => ({ productDetails: state.productDetails.map(pd => pd.id === updatedProductDetail.id ? updatedProductDetail : pd) }));
           // set({ loading: false });
           return updatedProductDetail; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating product detail in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update product detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteProductDetail (si tuvieras un endpoint directo)
  deleteProductDetail: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await productDetailService.delete(id);
          // Opcional: Eliminar el detalle de las listas relevantes en el store después de eliminar
          // set(state => ({
          //     productDetails: state.productDetails.filter(pd => pd.id !== id),
          //     productDetailsByProductId: state.productDetailsByProductId.filter(pd => pd.id !== id),
          //     filteredProductDetails: state.filteredProductDetails.filter(pd => pd.id !== id),
          // }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting product detail with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete product detail: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedProductDetail
  clearSelectedProductDetail: () => set({ selectedProductDetail: null, errorDetail: null, loadingDetail: false }),

  // Implementación de la acción clearFilteredProductDetails
  clearFilteredProductDetails: () => set({ filteredProductDetails: [], errorFiltered: null, loadingFiltered: false }),
}));

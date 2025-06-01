// src/store/productDetailStore.ts

import { create } from "zustand";

// Mantener las importaciones de tus interfaces Talle y Color
import { Talle } from "../types/ITalle";
import { Color } from "../types/IColor";

import { productDetailService } from "../https/productDetailApi";
import { productService } from "../https/productApi";
import { ProductoDTO } from "../components/dto/ProductoDTO";
import { ProductoDetalleDTO } from "../components/dto/ProductoDetalleDTO";

interface ProductDetailState {
  selectedProduct: ProductoDTO | null;
  loadingProduct: boolean;
  errorProduct: string | null;

  selectedProductDetail: ProductoDetalleDTO | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  productDetails: ProductoDetalleDTO[];
  loading: boolean;
  error: string | null;

  // CAMBIO CLAVE AQUÍ: Deben ser mapas/diccionarios
  productDetailsByProductId: { [productId: number]: ProductoDetalleDTO[] };
  loadingByProduct: { [productId: number]: boolean };
  errorByProduct: { [productId: number]: string | null };

  filteredProductDetails: ProductoDetalleDTO[];
  loadingFiltered: boolean;
  errorFiltered: string | null;
  availableTalles: Talle[];
  loadingTalles: boolean;
  errorTalles: string | null;
  availableColores: Color[];
  loadingColores: boolean;
  errorColores: string | null;
}

interface ProductDetailActions {
  fetchProductById: (id: number) => Promise<void>;
  clearSelectedProduct: () => void;

  fetchProductDetails: () => Promise<void>;
  fetchProductDetailById: (id: number | string) => Promise<void>;
  // Asegurarse de que esta acción maneja el estado del mapa
  fetchProductDetailsByProductId: (productId: number) => Promise<void>; // Cambiado a number para consistencia con productId: number en AdminProductScreen
  fetchProductDetailByProductTalleColor: (
    productoId: number | string,
    talle: Talle,
    color: Color
  ) => Promise<void>;
  fetchProductDetailsByStockGreaterThan: (
    stockMinimo: number | string
  ) => Promise<void>;
  filterProductDetailsByOptions: (
    productoId?: number | string,
    color?: Color,
    talle?: Talle,
    stockMin?: number | string
  ) => Promise<void>;
  fetchAvailableTallesByProductId: (
    productId: number | string
  ) => Promise<void>;
  fetchAvailableColoresByProductId: (
    productId: number | string
  ) => Promise<void>;
  discountStock: (
    productoDetalleId: number | string,
    cantidad: number
  ) => Promise<void>;
  checkAvailability: (
    productoId: number | string,
    talle: Talle,
    color: Color
  ) => Promise<boolean>;
  addProductDetail: (
    productDetailData: Partial<ProductoDetalleDTO>
  ) => Promise<ProductoDetalleDTO>;
  updateProductDetail: (
    productDetail: ProductoDetalleDTO
  ) => Promise<ProductoDetalleDTO>;
  deleteProductDetail: (id: number | string) => Promise<void>;
  clearSelectedProductDetail: () => void;
  clearFilteredProductDetails: () => void;
}

export const useProductDetailStore = create<
  ProductDetailState & ProductDetailActions
>((set) => ({
  selectedProduct: null,
  loadingProduct: false,
  errorProduct: null,

  selectedProductDetail: null,
  loadingDetail: false,
  errorDetail: null,

  productDetails: [],
  loading: false,
  error: null,

  // INICIALIZACIÓN DE LOS MAPAS
  productDetailsByProductId: {},
  loadingByProduct: {},
  errorByProduct: {},

  filteredProductDetails: [],
  loadingFiltered: false,
  errorFiltered: null,
  availableTalles: [],
  loadingTalles: false,
  errorTalles: null,
  availableColores: [],
  loadingColores: false,
  errorColores: null,

  fetchProductById: async (id: number) => {
    set({ loadingProduct: true, errorProduct: null, selectedProduct: null });
    try {
      const product = await productService.getDTOSById(id);
      set({ selectedProduct: product, loadingProduct: false });
    } catch (error: any) {
      console.error(
        "Error fetching product by ID in productDetailStore:",
        error
      );
      set({
        errorProduct: `Error al cargar el producto: ${
          error.message || String(error)
        }`,
        loadingProduct: false,
        selectedProduct: null,
      });
    }
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null, errorProduct: null, loadingProduct: false });
  },

  fetchProductDetails: async () => {
    set({ loading: true, error: null });
    try {
      const productDetailsData = await productDetailService.getAll();
      set({ productDetails: productDetailsData, loading: false });
    } catch (error) {
      console.error(
        "Error al obtener todos los detalles de producto en el store:",
        error
      );
      set({
        error: `Error al cargar los detalles del producto: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loading: false,
      });
    }
  },

  fetchProductDetailById: async (id: number | string) => {
    set({
      loadingDetail: true,
      errorDetail: null,
      selectedProductDetail: null,
    });
    try {
      const productDetailData = await productDetailService.getById(id);
      set({ selectedProductDetail: productDetailData, loadingDetail: false });
    } catch (error) {
      console.error(
        `Error al obtener el detalle de producto con ID ${id} en el store:`,
        error
      );
      set({
        errorDetail: `Error al cargar el detalle del producto: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingDetail: false,
        selectedProductDetail: null,
      });
    }
  },

  // ACTUALIZACIÓN DE LA FUNCIÓN PARA USAR LOS MAPAS
  fetchProductDetailsByProductId: async (productId: number) => {
    set((state) => ({
      loadingByProduct: { ...state.loadingByProduct, [productId]: true },
      errorByProduct: { ...state.errorByProduct, [productId]: null },
    }));
    try {
      const productDetailsData = await productDetailService.getAllByProductoId(
        productId
      );
      set((state) => ({
        productDetailsByProductId: { ...state.productDetailsByProductId, [productId]: productDetailsData },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
      }));
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto para el ID de producto ${productId} en el store:`,
        error
      );
      set((state) => ({
        errorByProduct: { ...state.errorByProduct, [productId]: `Error al cargar los detalles del producto por ID de producto: ${
          error instanceof Error ? error.message : String(error)
        }` },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
        productDetailsByProductId: { ...state.productDetailsByProductId, [productId]: [] }, // Asegurarse de que sea un array vacío en caso de error
      }));
    }
  },

  fetchProductDetailByProductTalleColor: async (
    productoId: number | string,
    talle: Talle,
    color: Color
  ) => {
    set({
      loadingDetail: true,
      errorDetail: null,
      selectedProductDetail: null,
    });
    try {
      const productDetailData =
        await productDetailService.getByProductoIdAndTalleAndColor(
          productoId,
          talle,
          color
        );
      set({ selectedProductDetail: productDetailData, loadingDetail: false });
    } catch (error) {
      console.error(
        `Error al obtener detalle de producto por ID de producto ${productoId}, talle ${talle}, color ${color} en el store:`,
        error
      );
      set({
        errorDetail: `No hay stock disponible para esta combinación.`,
        loadingDetail: false,
        selectedProductDetail: null,
      });
    }
  },

  fetchProductDetailsByStockGreaterThan: async (
    stockMinimo: number | string
  ) => {
    set({ loadingFiltered: true, errorFiltered: null });
    try {
      const productDetailsData =
        await productDetailService.findAllByStockActualGreaterThan(stockMinimo);
      set({
        filteredProductDetails: productDetailsData,
        loadingFiltered: false,
      });
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto con stock mayor a ${stockMinimo} en el store:`,
        error
      );
      set({
        errorFiltered: `Error al cargar los detalles del producto por stock: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingFiltered: false,
        filteredProductDetails: [],
      });
    }
  },

  filterProductDetailsByOptions: async (
    productoId?: number | string,
    color?: Color,
    talle?: Talle,
    stockMin?: number | string
  ) => {
    set({
      loadingFiltered: true,
      errorFiltered: null,
    });
    try {
      const filteredData = await productDetailService.filtrarPorOpciones(
        productoId,
        color,
        talle,
        stockMin
      );
      set({ filteredProductDetails: filteredData, loadingFiltered: false });
    } catch (error) {
      console.error(
        `Error al filtrar detalles de producto en el store:`,
        error
      );
      set({
        errorFiltered: `Error al filtrar detalles de producto: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingFiltered: false,
        filteredProductDetails: [],
      });
    }
  },

  fetchAvailableTallesByProductId: async (productId: number | string) => {
    set({ loadingTalles: true, errorTalles: null, availableTalles: [] });
    try {
      const tallesData =
        await productDetailService.getAvailableTallesByProductoId(productId);
      set({ availableTalles: tallesData, loadingTalles: false });
    } catch (error) {
      console.error(
        `Error al obtener talles disponibles para el ID de producto ${productId} en el store:`,
        error
      );
      set({
        errorTalles: `Error al cargar talles disponibles: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingTalles: false,
        availableTalles: [],
      });
    }
  },

  fetchAvailableColoresByProductId: async (productId: number | string) => {
    set({ loadingColores: true, errorColores: null, availableColores: [] });
    try {
      const coloresData =
        await productDetailService.getAvailableColoresByProductoId(productId);
      set({ availableColores: coloresData, loadingColores: false });
    } catch (error) {
      console.error(
        `Error al obtener colores disponibles para el ID de producto ${productId} en el store:`,
        error
      );
      set({
        errorColores: `Error al cargar colores disponibles: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingColores: false,
        availableColores: [],
      });
    }
  },

  discountStock: async (
    productoDetalleId: number | string,
    cantidad: number
  ) => {
    try {
      await productDetailService.descontarStock(productoDetalleId, cantidad);
      // Opcional: Si quieres actualizar el stock de un detalle específico
      // en el estado después de un descuento exitoso, lo harías aquí.
      // Por ejemplo:
      /*
      set((state) => ({
        productDetails: state.productDetails.map((detail) =>
          detail.id === productoDetalleId
            ? { ...detail, stockActual: detail.stockActual - cantidad }
            : detail
        ),
        // Y si selectedProductDetail es el que se actualizó
        selectedProductDetail: state.selectedProductDetail?.id === productoDetalleId
          ? { ...state.selectedProductDetail, stockActual: state.selectedProductDetail.stockActual - cantidad }
          : state.selectedProductDetail,
      }));
      */
    } catch (error) {
      console.error(
        `Error al descontar stock para el detalle de producto ID ${productoDetalleId} en el store:`,
        error
      );
      throw error; // Relanza el error para que el componente que llama lo maneje
    }
  },

  checkAvailability: async (
    productoId: number | string,
    talle: Talle,
    color: Color
  ): Promise<boolean> => {
    try {
      const isAvailable = await productDetailService.estaDisponible(
        productoId,
        talle,
        color
      );
      return isAvailable;
    } catch (error) {
      console.error(
        `Error al verificar la disponibilidad para el ID de producto ${productoId}, talle ${talle}, color ${color} en el store:`,
        error
      );
      throw error; // Relanza el error para que el componente que llama lo maneje
    }
  },

  addProductDetail: async (productDetailData: Partial<ProductoDetalleDTO>) => {
    try {
      const newProductDetail = await productDetailService.create(
        productDetailData
      );
      // Si necesitas actualizar productDetailsByProductId después de añadir un detalle,
      // la lógica aquí es más compleja porque necesitas saber el productId del nuevo detalle.
      // Es más seguro que el componente AdminProductScreen llame a fetchProductDetailsByProductId
      // para refrescar los datos después de un add/update/delete.
      return newProductDetail;
    } catch (error) {
      console.error("Error al agregar detalle de producto en el store:", error);
      throw error;
    }
  },

  updateProductDetail: async (productDetail: ProductoDetalleDTO) => {
    try {
      const updatedProductDetail = await productDetailService.update(
        productDetail
      );
      // Aquí, la actualización del estado local del store es más compleja
      // debido a que los detalles están anidados por productId.
      // Lo más robusto es que el componente AdminProductScreen vuelva a llamar a fetchProductDetailsByProductId
      // para el producto padre correspondiente después de un update.
      return updatedProductDetail;
    } catch (error) {
      console.error(
        "Error al actualizar detalle de producto en el store:",
        error
      );
      throw error;
    }
  },

  deleteProductDetail: async (id: number | string) => {
    try {
      await productDetailService.delete(id);
      // De manera similar, para la eliminación, es más robusto que el componente padre refresque los detalles.
    } catch (error) {
      console.error(
        `Error al eliminar detalle de producto con ID ${id} en el store:`,
        error
      );
      throw error;
    }
  },

  clearSelectedProductDetail: () =>
    set({
      selectedProductDetail: null,
      errorDetail: null,
      loadingDetail: false,
    }),
  clearFilteredProductDetails: () =>
    set({
      filteredProductDetails: [],
      errorFiltered: null,
      loadingFiltered: false,
    }),
}));
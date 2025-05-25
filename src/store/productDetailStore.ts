// src/store/productDetailStore.ts
import { create } from "zustand";
import { Color } from "../types/IColor";
import { Talle } from "../types/ITalle";
import { ProductoDTO } from "../components/dto/ProductoDTO";
import { ProductoDetalleDTO } from "../components/dto/ProductoDetalleDTO";
import { productDetailService } from "../https/productDetailApi";
import { productService } from "../https/productApi"; // Importa tu servicio de productos principal

interface ProductDetailState {
  // ESTADO PARA EL PRODUCTO PADRE (ProductoDTO)
  selectedProduct: ProductoDTO | null;
  loadingProduct: boolean;
  errorProduct: string | null; // Estado para un detalle individual seleccionado o buscado (ProductoDetalleDTO)

  selectedProductDetail: ProductoDetalleDTO | null;
  loadingDetail: boolean;
  errorDetail: string | null; // El resto de tus estados para listas de detalles, etc. (manteniendo lo que tenías)

  productDetails: ProductoDetalleDTO[];
  loading: boolean;
  error: string | null;
  productDetailsByProductId: ProductoDetalleDTO[];
  loadingByProduct: boolean;
  errorByProduct: string | null;
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
  // ACCIONES PARA EL PRODUCTO PADRE (ProductoDTO)
  fetchProductById: (id: number) => Promise<void>;
  clearSelectedProduct: () => void; // Acciones para los detalles de producto (ProductoDetalleDTO)

  fetchProductDetails: () => Promise<void>;
  fetchProductDetailById: (id: number | string) => Promise<void>;
  fetchProductDetailsByProductId: (productId: number | string) => Promise<void>;
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
  // Se quitó 'get' si no se usa para evitar la advertencia
  // ESTADO INICIAL PARA EL PRODUCTO PADRE
  selectedProduct: null,
  loadingProduct: false,
  errorProduct: null, // Estado inicial para detalle individual

  selectedProductDetail: null,
  loadingDetail: false,
  errorDetail: null, // Resto de los estados iniciales

  productDetails: [],
  loading: false,
  error: null,
  productDetailsByProductId: [],
  loadingByProduct: false,
  errorByProduct: null,
  filteredProductDetails: [],
  loadingFiltered: false,
  errorFiltered: null,
  availableTalles: [],
  loadingTalles: false,
  errorTalles: null,
  availableColores: [],
  loadingColores: false,
  errorColores: null, // IMPLEMENTACIÓN DE ACCIONES PARA EL PRODUCTO PADRE

  fetchProductById: async (id: number) => {
    set({ loadingProduct: true, errorProduct: null, selectedProduct: null });
    try {
      // CORRECCIÓN APLICADA: Usando getDTOSById
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
  }, // Implementación de la acción fetchProductDetails

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
  }, // Implementación de la acción fetchProductDetailById

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
  }, // Implementación de la acción fetchProductDetailsByProductId

  fetchProductDetailsByProductId: async (productId: number | string) => {
    set({
      loadingByProduct: true,
      errorByProduct: null,
    });
    try {
      const productDetailsData = await productDetailService.getAllByProductoId(
        productId
      );
      set({
        productDetailsByProductId: productDetailsData,
        loadingByProduct: false,
      });
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto para el ID de producto ${productId} en el store:`,
        error
      );
      set({
        errorByProduct: `Error al cargar los detalles del producto por ID de producto: ${
          error instanceof Error ? error.message : String(error)
        }`,
        loadingByProduct: false,
        productDetailsByProductId: [],
      });
    }
  }, // Implementación de la acción fetchProductDetailByProductTalleColor

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
  }, // Implementación de la acción fetchProductDetailsByStockGreaterThan

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
  }, // Implementación de la acción filterProductDetailsByOptions

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
  }, // Implementación de la acción fetchAvailableTallesByProductId

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
  }, // Implementación de la acción fetchAvailableColoresByProductId

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
  }, // Implementación de la acción discountStock

  discountStock: async (
    productoDetalleId: number | string,
    cantidad: number
  ) => {
    try {
      await productDetailService.descontarStock(productoDetalleId, cantidad);
    } catch (error) {
      console.error(
        `Error al descontar stock para el detalle de producto ID ${productoDetalleId} en el store:`,
        error
      );
      throw error;
    }
  }, // Implementación de la acción checkAvailability

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
      throw error;
    }
  }, // Implementación de la acción addProductDetail

  addProductDetail: async (productDetailData: Partial<ProductoDetalleDTO>) => {
    try {
      const newProductDetail = await productDetailService.create(
        productDetailData
      );
      return newProductDetail;
    } catch (error) {
      console.error("Error al agregar detalle de producto en el store:", error);
      throw error;
    }
  }, // Implementación de la acción updateProductDetail

  updateProductDetail: async (productDetail: ProductoDetalleDTO) => {
    try {
      const updatedProductDetail = await productDetailService.update(
        productDetail
      );
      return updatedProductDetail;
    } catch (error) {
      console.error(
        "Error al actualizar detalle de producto en el store:",
        error
      );
      throw error;
    }
  }, // Implementación de la acción deleteProductDetail

  deleteProductDetail: async (id: number | string) => {
    try {
      await productDetailService.delete(id);
    } catch (error) {
      console.error(
        `Error al eliminar detalle de producto con ID ${id} en el store:`,
        error
      );
      throw error;
    }
  }, // Implementación de la acción clearSelectedProductDetail

  clearSelectedProductDetail: () =>
    set({
      selectedProductDetail: null,
      errorDetail: null,
      loadingDetail: false,
    }), // Implementación de la acción clearFilteredProductDetails
  clearFilteredProductDetails: () =>
    set({
      filteredProductDetails: [],
      errorFiltered: null,
      loadingFiltered: false,
    }),
}));

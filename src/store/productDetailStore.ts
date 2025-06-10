// src/store/productDetailStore.ts

import { create } from "zustand";

import { productService } from "../https/productApi";
import { ProductoDTO } from "../components/dto/ProductoDTO";
import { ProductoDetalleDTO } from "../components/dto/ProductoDetalleDTO";
import { productDetailService } from "../https/productDetailApi";
import { ProductoDetalleRequestDTO } from "../components/dto/ProductoRequestDTO"; // Asegúrate de que este DTO es adecuado para creación y actualización.

interface ProductDetailState {
  selectedProduct: ProductoDTO | null;
  loadingProduct: boolean;
  errorProduct: string | null;

  selectedProductDetail: ProductoDetalleDTO | null;
  loadingDetail: boolean;
  errorDetail: string | null;

  productDetails: ProductoDetalleDTO[]; // Todos los detalles, posiblemente inactivos también si se usa para admin
  loading: boolean;
  error: string | null;

  productDetailsByProductId: { [productId: number]: ProductoDetalleDTO[] };
  loadingByProduct: { [productId: number]: boolean };
  errorByProduct: { [productId: number]: string | null };

  filteredProductDetails: ProductoDetalleDTO[];
  loadingFiltered: boolean;
  errorFiltered: string | null;
  availableTalles: string[];
  loadingTalles: boolean;
  errorTalles: string | null;
  availableColores: string[];
  loadingColores: boolean;
  errorColores: string | null;
}

interface ProductDetailActions {
  fetchProductById: (id: number) => Promise<void>;
  clearSelectedProduct: () => void;

  fetchProductDetails: () => Promise<void>; // Para traer todos los detalles activos (para cliente)
  fetchProductDetailById: (id: number | string) => Promise<void>; // Para buscar un detalle activo por ID
  fetchProductDetailsByProductId: (productId: number) => Promise<void>; // Para traer detalles activos de un producto
  fetchProductDetailsByProductIdForAdmin: (productId: number) => Promise<void>; // Para traer todos los detalles (activos/inactivos) de un producto para admin
  fetchProductDetailByProductTalleColor: (
    productoId: number | string,
    talleNombre: string,
    colorNombre: string
  ) => Promise<void>;
  fetchProductDetailsByStockGreaterThan: (
    stockMinimo: number | string
  ) => Promise<void>;
  filterProductDetailsByOptions: (
    productoId?: number | string,
    colorNombre?: string,
    talleNombre?: string,
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
    talleNombre: string,
    colorNombre: string
  ) => Promise<boolean>;
  addProductDetail: (
    productDetailData: ProductoDetalleRequestDTO
  ) => Promise<ProductoDetalleDTO>;
  updateProductDetail: (
    productDetailId: number | string, // El ID del detalle a actualizar (para la URL)
    productDetailData: ProductoDetalleRequestDTO // Los datos a enviar en el cuerpo de la petición
  ) => Promise<ProductoDetalleDTO>;
  deleteProductDetail: (id: number | string) => Promise<void>; // Para soft delete (desactivar)
  activateProductDetail: (id: number | string) => Promise<void>; // Para activar (admin)
  clearSelectedProductDetail: () => void;
  clearFilteredProductDetails: () => void;
}

export const useProductDetailStore = create<
  ProductDetailState & ProductDetailActions
>((set, get) => ({
  selectedProduct: null,
  loadingProduct: false,
  errorProduct: null,

  selectedProductDetail: null,
  loadingDetail: false,
  errorDetail: null,

  productDetails: [],
  loading: false,
  error: null,

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
        "Error al obtener el producto por ID en productDetailStore:",
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
      // Asume que este getAll() llama al endpoint /producto_detalle/dto que trae solo activos
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
      // Asume que este getById() llama al endpoint /producto_detalle/dto/{id} que trae solo activos
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

  fetchProductDetailsByProductId: async (productId: number) => {
    set((state) => ({
      loadingByProduct: { ...state.loadingByProduct, [productId]: true },
      errorByProduct: { ...state.errorByProduct, [productId]: null },
    }));
    try {
      // Este método llama al endpoint /producto_detalle/producto/{productId} que trae solo activos
      const productDetailsData = await productDetailService.getAllByProductoId(
        productId
      );
      set((state) => ({
        productDetailsByProductId: {
          ...state.productDetailsByProductId,
          [productId]: productDetailsData,
        },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
      }));
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto para el ID de producto ${productId} en el store:`,
        error
      );
      set((state) => ({
        errorByProduct: {
          ...state.errorByProduct,
          [productId]: `Error al cargar los detalles del producto por ID de producto: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
        productDetailsByProductId: {
          ...state.productDetailsByProductId,
          [productId]: [],
        },
      }));
    }
  },

  // Nuevo método para la administración (todos los detalles, activos e inactivos)
  fetchProductDetailsByProductIdForAdmin: async (productId: number) => {
    set((state) => ({
      loadingByProduct: { ...state.loadingByProduct, [productId]: true },
      errorByProduct: { ...state.errorByProduct, [productId]: null },
    }));
    try {
      // Este método llama al endpoint /producto_detalle/admin/producto/{productId}
      const productDetailsData = await productDetailService.getAllByProductoIdForAdmin(
        productId
      );
      set((state) => ({
        productDetailsByProductId: {
          ...state.productDetailsByProductId,
          [productId]: productDetailsData,
        },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
      }));
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto (ADMIN) para el ID de producto ${productId} en el store:`,
        error
      );
      set((state) => ({
        errorByProduct: {
          ...state.errorByProduct,
          [productId]: `Error al cargar los detalles del producto (ADMIN) por ID de producto: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
        loadingByProduct: { ...state.loadingByProduct, [productId]: false },
        productDetailsByProductId: {
          ...state.productDetailsByProductId,
          [productId]: [],
        },
      }));
    }
  },

  fetchProductDetailByProductTalleColor: async (
    productoId: number | string,
    talleNombre: string,
    colorNombre: string
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
          talleNombre,
          colorNombre
        );
      set({ selectedProductDetail: productDetailData, loadingDetail: false });
    } catch (error) {
      console.error(
        `Error al obtener detalle de producto por ID de producto ${productoId}, talle ${talleNombre}, color ${colorNombre} en el store:`,
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
    colorNombre?: string,
    talleNombre?: string,
    stockMin?: number | string
  ) => {
    set({
      loadingFiltered: true,
      errorFiltered: null,
    });
    try {
      const filteredData = await productDetailService.filtrarPorOpciones(
        productoId,
        colorNombre,
        talleNombre,
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
    } catch (error) {
      console.error(
        `Error al descontar stock para el detalle de producto ID ${productoDetalleId} en el store:`,
        error
      );
      throw error;
    }
  },

  checkAvailability: async (
    productoId: number | string,
    talleNombre: string,
    colorNombre: string
  ): Promise<boolean> => {
    try {
      const isAvailable = await productDetailService.estaDisponible(
        productoId,
        talleNombre,
        colorNombre
      );
      return isAvailable;
    } catch (error) {
      console.error(
        `Error al verificar la disponibilidad para el ID de producto ${productoId}, talle ${talleNombre}, color ${colorNombre} en el store:`,
        error
      );
      throw error;
    }
  },

  addProductDetail: async (productDetailData: ProductoDetalleRequestDTO) => {
    try {
      console.log('productDetailStore: addProductDetail received data:', productDetailData);

      if (productDetailData.colorId === undefined || productDetailData.colorId === null) {
          throw new Error("El ID del color es obligatorio para agregar un detalle de producto.");
      }
      if (productDetailData.talleId === undefined || productDetailData.talleId === null) {
          throw new Error("El ID del talle es obligatorio para agregar un detalle de producto.");
      }
      if (productDetailData.stockActual === undefined || productDetailData.stockActual === null) {
          throw new Error("El stock actual es obligatorio para agregar un detalle de producto.");
      }
      if (productDetailData.precioCompra === undefined || productDetailData.precioCompra === null) {
          throw new Error("El precio de compra es obligatorio para agregar un detalle de producto.");
      }
      if (productDetailData.productoId === undefined || productDetailData.productoId === null) {
          throw new Error("El ID del producto es obligatorio para agregar un detalle de producto.");
      }

      // Asegúrate de que stockMaximo y activo tienen valores por defecto si no vienen definidos
      const finalRequestData: ProductoDetalleRequestDTO = {
          precioCompra: productDetailData.precioCompra,
          stockActual: productDetailData.stockActual,
          stockMaximo: productDetailData.stockMaximo ?? productDetailData.stockActual, // Usa stockActual si stockMaximo no está
          colorId: productDetailData.colorId,
          talleId: productDetailData.talleId,
          activo: productDetailData.activo ?? true, // Por defecto activo si no se especifica
          productoId: productDetailData.productoId
      };

      console.log('productDetailStore: Sending to productDetailService.create:', finalRequestData);

      const newProductDetail = await productDetailService.create(finalRequestData);

      set((state) => {
          const updatedDetailsForProduct = [...(state.productDetailsByProductId[newProductDetail.producto?.id as number] || []), newProductDetail];
          return {
              productDetails: [...state.productDetails, newProductDetail],
              productDetailsByProductId: {
                  ...state.productDetailsByProductId,
                  [newProductDetail.producto?.id as number]: updatedDetailsForProduct
              }
          };
      });

      if (newProductDetail.producto?.id) {
          await get().fetchAvailableTallesByProductId(newProductDetail.producto.id);
          await get().fetchAvailableColoresByProductId(newProductDetail.producto.id);
      }

      return newProductDetail;
    } catch (error: any) {
      console.error("Error al agregar detalle de producto en el store:", error);
      throw new Error(`Error al agregar detalle de producto en el store: ${error.message}`);
    }
  },

  updateProductDetail: async (
    productDetailId: number | string,
    productDetailData: ProductoDetalleRequestDTO
  ) => {
    try {
      console.log('--- DEBUG ProductDetailStore: Iniciando updateProductDetail ---');
      console.log('DEBUG ProductDetailStore: ID del detalle de producto para actualizar (productDetailId):', productDetailId);
      console.log('DEBUG ProductDetailStore: Datos recibidos para actualización (productDetailData):', productDetailData);
      console.log('--- DEBUG ProductDetailStore: Fin de logs iniciales ---');

      if (productDetailId === undefined || productDetailId === null) {
        throw new Error(
          "El ID del detalle de producto es necesario para actualizar."
        );
      }

      // Validaciones para asegurar que los campos requeridos para ProductoDetalleRequestDTO están presentes
      // (Estos son para los campos que van en el cuerpo de la petición)
      if (
        productDetailData.colorId === undefined ||
        productDetailData.colorId === null
      ) {
        throw new Error(
          "El ID del color es obligatorio para actualizar un detalle de producto."
        );
      }
      if (
        productDetailData.talleId === undefined ||
        productDetailData.talleId === null
      ) {
        throw new Error(
          "El ID del talle es obligatorio para actualizar un detalle de producto."
        );
      }
      if (
        productDetailData.stockActual === undefined ||
        productDetailData.stockActual === null
      ) {
        throw new Error(
          "El stock actual es obligatorio para actualizar un detalle de producto."
        );
      }
      if (
        productDetailData.precioCompra === undefined ||
        productDetailData.precioCompra === null
      ) {
        throw new Error(
          "El precio de compra es obligatorio para actualizar un detalle de producto."
        );
      }
      if (
        productDetailData.stockMaximo === undefined ||
        productDetailData.stockMaximo === null
      ) {
        throw new Error(
          "El stock máximo es obligatorio para actualizar un detalle de producto."
        );
      }
      if (
        productDetailData.activo === undefined ||
        productDetailData.activo === null
      ) {
        throw new Error(
          "El estado 'activo' es obligatorio para actualizar un detalle de producto."
        );
      }
      // productDetailData.productoId es crucial para la actualización del estado del store
      if (
        productDetailData.productoId === undefined ||
        productDetailData.productoId === null
      ) {
        throw new Error(
          "El ID del producto es obligatorio para actualizar un detalle de producto (para la actualización del estado)."
        );
      }

      // Llama al servicio de actualización, pasando el ID del detalle y los datos del DTO.
      const updatedProductDetail = await productDetailService.update(
        productDetailId,
        productDetailData
      );

      console.log('productDetailStore: Received updated data from service:', updatedProductDetail);

      // Actualizar el estado productDetailsByProductId
      set((state) => {
        // Usa el producto?.id del DTO de respuesta para asegurar que es válido.
        const currentProductId = updatedProductDetail.producto?.id as number;
        if (currentProductId === undefined || currentProductId === null) {
          console.warn(
            "Updated product detail is missing product ID. State update for productDetailsByProductId might be incorrect."
          );
          return state; // No actualiza si falta el ID del producto
        }

        const currentDetailsForProduct =
          state.productDetailsByProductId[currentProductId] || [];
        const updatedDetailsForProduct = currentDetailsForProduct.map(
          (detail) =>
            detail.id === updatedProductDetail.id ? updatedProductDetail : detail
        );

        // Si el detalle actualizado no estaba en la lista anterior, añádelo (esto es un caso borde, pero es buena práctica)
        if (
          !updatedDetailsForProduct.some(
            (detail) => detail.id === updatedProductDetail.id
          )
        ) {
          updatedDetailsForProduct.push(updatedProductDetail);
        }

        return {
          productDetails: state.productDetails.map((detail) =>
            detail.id === updatedProductDetail.id
              ? updatedProductDetail
              : detail
          ),
          productDetailsByProductId: {
            ...state.productDetailsByProductId,
            [currentProductId]: updatedDetailsForProduct,
          },
        };
      });

      if (updatedProductDetail.producto?.id) {
        await get().fetchAvailableTallesByProductId(updatedProductDetail.producto.id);
        await get().fetchAvailableColoresByProductId(updatedProductDetail.producto.id);
      }

      return updatedProductDetail;
    } catch (error: any) {
      console.error(
        "Error al actualizar detalle de producto en el store:",
        error
      );
      throw new Error(
        `Error al actualizar detalle de producto en el store: ${error.message}`
      );
    }
  },

  deleteProductDetail: async (id: number | string) => {
    try {
      // Llama al servicio de desactivación (soft delete)
      await productDetailService.deactivate(id);
      set((state) => {
        // Actualiza `productDetails` para reflejar el estado `activo: false`
        const newProductDetails = state.productDetails.map((detail) =>
          detail.id === id ? { ...detail, activo: false } : detail
        );

        // Actualiza `productDetailsByProductId` para reflejar el estado `activo: false`
        const updatedProductDetailsByProductId = { ...state.productDetailsByProductId };
        for (const productId in updatedProductDetailsByProductId) {
            updatedProductDetailsByProductId[productId] = updatedProductDetailsByProductId[productId].map(detail =>
                detail.id === id ? { ...detail, activo: false } : detail
            );
        }

        return {
            productDetails: newProductDetails,
            productDetailsByProductId: updatedProductDetailsByProductId
        };
      });
    } catch (error) {
      console.error(
        `Error al desactivar detalle de producto con ID ${id} en el store:`,
        error
      );
      throw error;
    }
  },

  activateProductDetail: async (id: number | string) => {
    try {
      const activatedDetail = await productDetailService.activate(id);
      set((state) => {
        // Actualiza `productDetails` para reflejar el estado `activo: true`
        const newProductDetails = state.productDetails.map((detail) =>
          detail.id === id ? { ...detail, activo: true } : detail
        );
        // Si el detalle activado no estaba en la lista, lo añadimos (podría ser el caso si fetchProductDetails filtra inactivos)
        if (!newProductDetails.some(detail => detail.id === id)) {
            newProductDetails.push(activatedDetail);
        }

        // Actualiza `productDetailsByProductId` para reflejar el estado `activo: true`
        const updatedProductDetailsByProductId = { ...state.productDetailsByProductId };
        const currentProductId = activatedDetail.producto?.id as number;

        if (currentProductId !== undefined && currentProductId !== null) {
            const currentDetailsForProduct = updatedProductDetailsByProductId[currentProductId] || [];
            const updatedDetailsForProduct = currentDetailsForProduct.map(detail =>
                detail.id === activatedDetail.id ? { ...detail, activo: true } : detail
            );
            if (!updatedDetailsForProduct.some(detail => detail.id === activatedDetail.id)) {
                updatedDetailsForProduct.push(activatedDetail);
            }
            updatedProductDetailsByProductId[currentProductId] = updatedDetailsForProduct;
        }

        return {
            productDetails: newProductDetails,
            productDetailsByProductId: updatedProductDetailsByProductId
        };
      });
    } catch (error) {
      console.error(
        `Error al activar detalle de producto con ID ${id} en el store:`,
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
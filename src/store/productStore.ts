import { create } from "zustand";

import { ProductoDTO } from "../components/dto/ProductoDTO";
import { ProductoRequestDTO } from "../components/dto/ProductoRequestDTO";
import { productService } from "../https/productApi";

// --- Interfaz para los filtros (DEFINIDA AQUÍ o importada si está en otro archivo) ---
export interface ProductFilters {
  denominacion?: string | null;
  categorias?: string[] | null;
  sexo?: string | null;
  colores?: string[] | null;
  talles?: string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  discount?: string | null;
  tienePromocion?: boolean | null;

  orderBy?: string | null;
  orderDirection?: "asc" | "desc" | null;
  stockMinimo?: number | null;
}

// Definimos la interfaz para el estado de nuestro store de productos
interface ProductState {
  // Estado para productos visibles al cliente (solo activos)
  originalProducts: ProductoDTO[];
  filteredProducts: ProductoDTO[];
  loading: boolean;
  error: string | null;
  currentFilters: ProductFilters;

  promotionalProducts: ProductoDTO[];
  loadingPromotional: boolean;
  errorPromotional: string | null; // --- NUEVO ESTADO PARA PRODUCTOS DE ADMINISTRACIÓN (activos e inactivos) ---

  adminProducts: ProductoDTO[];
  loadingAdminProducts: boolean;
  errorAdminProducts: string | null;
}

// Definimos las acciones de nuestro store
interface ProductActions {
  fetchProducts: () => Promise<void>; // Para el cliente (solo activos)
  fetchFilteredProducts: (filters: ProductFilters) => Promise<void>;
  setAndFetchFilteredProducts: (filters: ProductFilters) => void;
  clearFilters: () => void;
  fetchPromotionalProducts: () => Promise<void>; // --- NUEVAS ACCIONES PARA ADMINISTRACIÓN ---

  fetchAllAdminProducts: () => Promise<void>;
  fetchProductByIdForAdmin: (id: number) => Promise<ProductoDTO | null>;
  activateProduct: (id: number) => Promise<void>; // --- ACCIONES CRUD (AHORA ESPERAN ProductoRequestDTO) ---

  addProduct: (product: ProductoRequestDTO) => Promise<void>;
  updateProduct: (product: ProductoRequestDTO) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>; // Este es el soft delete
}

// Creamos el store usando la función create de Zustand
export const useProductStore = create<ProductState & ProductActions>(
  (set, get) => ({
    // Estado inicial para el cliente
    originalProducts: [],
    filteredProducts: [],
    loading: false,
    error: null,
    currentFilters: {},

    promotionalProducts: [],
    loadingPromotional: false,
    errorPromotional: null, // --- Estado inicial para administración ---

    adminProducts: [],
    loadingAdminProducts: false,
    errorAdminProducts: null, // --- Métodos existentes para el cliente ---

    fetchProducts: async () => {
      set({ loading: true, error: null });
      try {
        const productsData = await productService.getAllDTO();
        set({
          originalProducts: productsData,
          filteredProducts: productsData,
          loading: false,
          currentFilters: {},
        });
      } catch (error: unknown) {
        console.error(
          "Error fetching all products for client in store:",
          error
        );
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        set({
          error: `Failed to load all products for client: ${errorMessage}`,
          loading: false,
          originalProducts: [],
          filteredProducts: [],
        });
        throw error; // <-- Relanzado el error
      }
    },

    fetchFilteredProducts: async (filters: ProductFilters) => {
      set({ loading: true, error: null });
      try {
        const filteredProductsData = await productService.getFilteredProducts(
          filters
        );
        set({
          filteredProducts: filteredProductsData,
          loading: false,
        });
      } catch (error: unknown) {
        console.error("Error fetching filtered products in store:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        set({
          error: `Failed to load filtered products: ${errorMessage}`,
          loading: false,
          filteredProducts: [],
        });
        throw error; // <-- Relanzado el error
      }
    },

    setAndFetchFilteredProducts: (filters: ProductFilters) => {
      const cleanedFilters: ProductFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== null && value !== undefined && value !== ""
        )
      );
      if (filters.colores !== undefined)
        cleanedFilters.colores = filters.colores;
      if (filters.talles !== undefined) cleanedFilters.talles = filters.talles;
      if (filters.categorias !== undefined)
        cleanedFilters.categorias = filters.categorias;
      if (filters.tienePromocion !== undefined)
        cleanedFilters.tienePromocion = filters.tienePromocion;

      set({ currentFilters: cleanedFilters });
      get().fetchFilteredProducts(cleanedFilters);
    },

    clearFilters: () => {
      set({ currentFilters: {} });
      get().fetchProducts();
    },

    fetchPromotionalProducts: async () => {
      set({ loadingPromotional: true, errorPromotional: null });
      try {
        const promotionalData = await productService.getPromotionalDTOs();
        set({
          promotionalProducts: promotionalData,
          loadingPromotional: false,
        });
      } catch (error: unknown) {
        console.error("Error fetching promotional products in store:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        set({
          errorPromotional: `Failed to load promotional products: ${errorMessage}`,
          loadingPromotional: false,
          promotionalProducts: [],
        });
        throw error; // <-- Relanzado el error
      }
    },

    // --- Implementación de las NUEVAS ACCIONES PARA ADMINISTRACIÓN ---
    fetchAllAdminProducts: async () => {
      set({ loadingAdminProducts: true, errorAdminProducts: null });
      try {
        const adminProductsData = await productService.getAllForAdmin();
        set({
          adminProducts: adminProductsData,
          loadingAdminProducts: false,
        });
      } catch (error: unknown) {
        console.error("Error fetching admin products in store:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        set({
          errorAdminProducts: `Failed to load admin products: ${errorMessage}`,
          loadingAdminProducts: false,
          adminProducts: [],
        });
        throw error; // <-- Relanzado el error
      }
    },

    fetchProductByIdForAdmin: async (
      id: number
    ): Promise<ProductoDTO | null> => {
      set({ loadingAdminProducts: true, errorAdminProducts: null });
      try {
        const product = await productService.getByIdForAdmin(id);
        set({ loadingAdminProducts: false });
        return product;
      } catch (error: unknown) {
        console.error(
          `Error fetching product ID ${id} for admin in store:`,
          error
        );
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        set({
          errorAdminProducts: `Failed to load product ID ${id} for admin: ${errorMessage}`,
          loadingAdminProducts: false,
        });
        throw error; // <-- Ya estaba relanzado
      }
    },

    activateProduct: async (id: number) => {
      set({ loadingAdminProducts: true, errorAdminProducts: null });
      try {
        const activatedProduct = await productService.activate(id);
        set((state) => ({
          // Actualiza la lista de productos de administración con el producto activado
          adminProducts: state.adminProducts.map((p) =>
            p.id === activatedProduct.id ? activatedProduct : p
          ),
          loadingAdminProducts: false,
        }));
      } catch (error: unknown) {
        console.error("Error activating product:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "string") errorMessage = error;
        set({
          errorAdminProducts: `Failed to activate product: ${errorMessage}`,
          loadingAdminProducts: false,
        });
        throw error; // <-- Ya estaba relanzado
      }
    }, // --- Implementación de las ACCIONES CRUD existentes ---

    addProduct: async (productRequest: ProductoRequestDTO) => {
      set({ loading: true, error: null });
      try {
        const newProduct = await productService.create(productRequest);
        set((state) => ({
          originalProducts: [...state.originalProducts, newProduct],
          filteredProducts: [...state.filteredProducts, newProduct],
          adminProducts: [...state.adminProducts, newProduct], // Asegurarse de añadirlo también aquí
          loading: false,
        }));
      } catch (error: unknown) {
        console.error("Error adding product:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "string") errorMessage = error;
        set({
          error: `Failed to add product: ${errorMessage}`,
          loading: false,
        });
        throw error; // <-- Ya estaba relanzado
      }
    },

    updateProduct: async (productRequest: ProductoRequestDTO) => {
      set({ loading: true, error: null });
      try {
        if (!productRequest.id)
          throw new Error("Product ID is required for update.");
        const updatedProduct = await productService.update(
          productRequest.id,
          productRequest
        );
        set((state) => ({
          originalProducts: state.originalProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
          filteredProducts: state.filteredProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
          adminProducts: state.adminProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ), // Actualiza la lista de administración
          loading: false,
        }));
      } catch (error: unknown) {
        console.error("Error updating product:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "string") errorMessage = error;
        set({
          error: `Failed to update product: ${errorMessage}`,
          loading: false,
        });
        throw error; // <-- Ya estaba relanzado
      }
    },

    deleteProduct: async (id: number) => {
      set({ loading: true, error: null });
      try {
        await productService.delete(id);
        set((state) => ({
          // Si es un soft delete (cambia activo a false), se filtra de las listas de cliente
          originalProducts: state.originalProducts.filter((p) => p.id !== id),
          filteredProducts: state.filteredProducts.filter((p) => p.id !== id),
          // En la lista de administración, se actualiza el estado 'activo'
          adminProducts: state.adminProducts.map((p) =>
            p.id === id ? { ...p, activo: false } : p
          ),
          loading: false,
        }));
      } catch (error: unknown) {
        console.error("Error deleting product:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "string") errorMessage = error;
        set({
          error: `Failed to delete product: ${errorMessage}`,
          loading: false,
        });
        throw error; // <-- Relanzado el error
      }
    },
  })
);
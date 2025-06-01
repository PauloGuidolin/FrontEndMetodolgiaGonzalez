import { create } from 'zustand';

import { ProductoDTO } from '../components/dto/ProductoDTO';
import { ProductoRequestDTO } from '../components/dto/ProductoRequestDTO'; // ¡NUEVA IMPORTACIÓN!
import { productService } from '../https/productApi';

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
    orderDirection?: 'asc' | 'desc' | null;
    stockMinimo?: number | null;
}

// Definimos la interfaz para el estado de nuestro store de productos
interface ProductState {
    originalProducts: ProductoDTO[];
    filteredProducts: ProductoDTO[];
    loading: boolean;
    error: string | null;
    currentFilters: ProductFilters;

    promotionalProducts: ProductoDTO[];
    loadingPromotional: boolean;
    errorPromotional: string | null;
}

// Definimos las acciones de nuestro store
interface ProductActions {
    fetchProducts: () => Promise<void>;
    fetchFilteredProducts: (filters: ProductFilters) => Promise<void>;
    setAndFetchFilteredProducts: (filters: ProductFilters) => void;
    clearFilters: () => void;
    fetchPromotionalProducts: () => Promise<void>;

    // --- NUEVAS ACCIONES CRUD (AHORA ESPERAN ProductoRequestDTO) ---
    addProduct: (product: ProductoRequestDTO) => Promise<void>; // <-- CAMBIO AQUÍ
    updateProduct: (product: ProductoRequestDTO) => Promise<void>; // <-- CAMBIO AQUÍ
    deleteProduct: (id: number) => Promise<void>;
}

// Creamos el store usando la función create de Zustand
export const useProductStore = create<ProductState & ProductActions>((set, get) => ({
    // Estado inicial
    originalProducts: [],
    filteredProducts: [],
    loading: false,
    error: null,
    currentFilters: {},

    promotionalProducts: [],
    loadingPromotional: false,
    errorPromotional: null,

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
            console.error("Error fetching all products in store:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({
                error: `Failed to load all products: ${errorMessage}`,
                loading: false,
                originalProducts: [],
                filteredProducts: [],
            });
        }
    },

    fetchFilteredProducts: async (filters: ProductFilters) => {
        set({ loading: true, error: null });
        try {
            const filteredProductsData = await productService.getFilteredProducts(filters);
            set({
                filteredProducts: filteredProductsData,
                loading: false,
            });
        } catch (error: unknown) {
            console.error("Error fetching filtered products in store:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({
                error: `Failed to load filtered products: ${errorMessage}`,
                loading: false,
                filteredProducts: [],
            });
        }
    },

    setAndFetchFilteredProducts: (filters: ProductFilters) => {
        const cleanedFilters: ProductFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
        );
        // Asegurarse de mantener arrays vacíos si se enviaron explícitamente para limpiar un filtro
        if (filters.colores !== undefined) cleanedFilters.colores = filters.colores;
        if (filters.talles !== undefined) cleanedFilters.talles = filters.talles;
        if (filters.categorias !== undefined) cleanedFilters.categorias = filters.categorias;
        if (filters.tienePromocion !== undefined) cleanedFilters.tienePromocion = filters.tienePromocion;


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
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({
                errorPromotional: `Failed to load promotional products: ${errorMessage}`,
                loadingPromotional: false,
                promotionalProducts: [],
            });
        }
    },

    // --- Implementación de las NUEVAS ACCIONES CRUD ---
    addProduct: async (productRequest: ProductoRequestDTO) => { // <-- CAMBIO AQUÍ
        set({ loading: true, error: null });
        try {
            const newProduct = await productService.create(productRequest); // Ya pasa el DTO correcto
            set((state) => ({
                originalProducts: [...state.originalProducts, newProduct],
                filteredProducts: [...state.filteredProducts, newProduct],
                loading: false,
            }));
        } catch (error: unknown) {
            console.error("Error adding product:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            set({ error: `Failed to add product: ${errorMessage}`, loading: false });
            throw error;
        }
    },

    updateProduct: async (productRequest: ProductoRequestDTO) => { // <-- CAMBIO AQUÍ
        set({ loading: true, error: null });
        try {
            if (!productRequest.id) throw new Error("Product ID is required for update.");
            const updatedProduct = await productService.update(productRequest.id, productRequest); // Ya pasa el DTO correcto
            set((state) => ({
                originalProducts: state.originalProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p),
                filteredProducts: state.filteredProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p),
                loading: false,
            }));
        } catch (error: unknown) {
            console.error("Error updating product:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            set({ error: `Failed to update product: ${errorMessage}`, loading: false });
            throw error;
        }
    },

    deleteProduct: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await productService.delete(id);
            set((state) => ({
                originalProducts: state.originalProducts.filter(p => p.id !== id),
                filteredProducts: state.filteredProducts.filter(p => p.id !== id),
                loading: false,
            }));
        } catch (error: unknown) {
            console.error("Error deleting product:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            set({ error: `Failed to delete product: ${errorMessage}`, loading: false });
            throw error;
        }
    },
}));
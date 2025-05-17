// Archivo: src/store/productStore.ts

import { create } from 'zustand';
import { productService } from '../https/productApi'; // Asegúrate de que esta ruta sea correcta
import { ProductoDTO } from '../components/dto/ProductoDTO';



// --- Interfaz para los filtros (DEFINIDA AQUÍ o importada si está en otro archivo) ---
// Estos deben coincidir con los parámetros que tu backend espera para filtrar (en ProductFilters.java)
// y con la estructura que tu componente de filtros envía.
// La propiedad 'categoria' en el frontend ProductFilters debe coincidir con el campo 'categorias' (List<String>)
// en el backend ProductFilters.java, si estás usando ese DTO para enviar filtros.
export interface ProductFilters {
    denominacion?: string | null;
    categorias?: string[] | null; // <-- CORREGIDO: Ahora es 'categorias'
    sexo?: string | null; // O el tipo Enum si usas
    colores?: string[] | null;  // <-- CORREGIDO: Ahora es 'colores'  
    talles?: string[] | null;   // <-- CORREGIDO: Ahora es 'talles'  
    minPrice?: number | null;
    maxPrice?: number | null;
    discount?: string | null; // Asumiendo que 'discount' existe como String en backend ProductFilters
    tienePromocion?: boolean | null; // Si usas este en backend ProductFilters

    orderBy?: string | null;
    orderDirection?: 'asc' | 'desc' | null;

    // ... cualquier otro filtro que uses en ProductFilters.java ...
}


// Definimos la interfaz para el estado de nuestro store de productos
interface ProductState {
    // Estado para la lista general de productos (usada en ProductScreen para filtrar)
    originalProducts: ProductoDTO[]; // Lista completa de productos sin filtrar (opcional si siempre filtras)
    filteredProducts: ProductoDTO[]; // Lista de productos después de aplicar filtros (viene del backend)
    // Estado y acciones de carga/error generales para la lista principal
    loading: boolean;
    error: string | null;
    currentFilters: ProductFilters; // Estado para los filtros actuales

    // --- Estado para la lista de productos promocionales (usada en HomeScreen) ---
    promotionalProducts: ProductoDTO[]; // Lista de productos promocionales
    loadingPromotional: boolean; // Estado de carga para promocionales
    errorPromotional: string | null; // Error para promocionales
    // --- Fin estado promocionales ---
}

// Definimos las acciones de nuestro store
interface ProductActions {
    // Acción para obtener todos los productos (inicialmente y al limpiar filtros)
    fetchProducts: () => Promise<void>;

    // --- Acción interna para obtener productos filtrados desde el backend (para ProductScreen) ---
    fetchFilteredProducts: (filters: ProductFilters) => Promise<void>;
    // --- Fin acción interna ---

    // Acción para actualizar los filtros actuales y disparar la carga de productos filtrados
    setAndFetchFilteredProducts: (filters: ProductFilters) => void;

    // Acción para limpiar los filtros y recargar todos los productos originales
    clearFilters: () => void;

    // --- Acción para obtener productos promocionales (para HomeScreen) ---
    fetchPromotionalProducts: () => Promise<void>;
    // --- Fin acción promocionales ---

    // Opcional: Si necesitas acciones para gestionar un solo producto, etc.
    // fetchProductById: (id: string) => Promise<void>;
}

// Creamos el store usando la función create de Zustand
export const useProductStore = create<ProductState & ProductActions>((set, get) => ({
    // Estado inicial
    originalProducts: [],
    filteredProducts: [],
    loading: false,
    error: null,
    // Inicializa los filtros a un objeto vacío o con valores por defecto
    currentFilters: {},

    // Estado inicial para productos promocionales
    promotionalProducts: [],
    loadingPromotional: false,
    errorPromotional: null,

    // Opcional: Estado inicial para detalle de un solo producto
    // selectedProduct: null,
    // loadingProduct: false,
    // errorProduct: null,


    // Implementación de la acción fetchProducts (carga todos los productos)
    fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
            // *** Llama al productService que ahora apunta a /productos/dto ***
            const productsData = await productService.getAllDTO();
            set({
                originalProducts: productsData,
                filteredProducts: productsData, // Inicialmente, los filtrados son todos los originales
                loading: false,
                currentFilters: {}, // Limpiar filtros al cargar todos
            });
        } catch (error: any) {
            console.error("Error fetching all products in store:", error);
            set({
                error: `Failed to load all products: ${error.message || String(error)}`,
                loading: false,
                originalProducts: [],
                filteredProducts: [],
            });
        }
    },

    // Implementación de la acción fetchFilteredProducts (llamada por setAndFetchFilteredProducts)
    fetchFilteredProducts: async (filters: ProductFilters) => {
        set({ loading: true, error: null }); // Usamos el loading/error general para el fetch principal de ProductScreen
        try {
            // *** Llama al productService que ahora apunta a /productos/filtrar ***
            const filteredProductsData = await productService.getFilteredProducts(filters);
            set({
                filteredProducts: filteredProductsData, // Actualizamos solo la lista filtrada
                loading: false,
            });
        } catch (error: any) {
            console.error("Error fetching filtered products in store:", error);
            set({
                error: `Failed to load filtered products: ${error.message || String(error)}`,
                loading: false,
                filteredProducts: [],
            });
        }
    },

    // Implementación de la acción setAndFetchFilteredProducts
    setAndFetchFilteredProducts: (filters: ProductFilters) => {
         // Opcional: Limpiar filtros nulos o vacíos antes de setear y enviar
         const cleanedFilters: ProductFilters = Object.fromEntries(
             Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
         );
         // Asegúrate de que los arrays vacíos (como colores: []) se mantengan si el backend los espera
         if (filters.colores !== undefined) cleanedFilters.colores = filters.colores;
         if (filters.talles !== undefined) cleanedFilters.talles = filters.talles;
         if (filters.categorias !== undefined) cleanedFilters.categorias = filters.categorias;


        set({ currentFilters: cleanedFilters });
        // Ahora, 'get()' devuelve un objeto que incluye 'fetchFilteredProducts' gracias a la interfaz ProductActions
        get().fetchFilteredProducts(cleanedFilters); // Pasa los filtros limpiados
    },

    // Implementación de la acción clearFilters
    clearFilters: () => {
        set({ currentFilters: {} }); // Resetear filtros
        get().fetchProducts(); // Recargar todos los productos (llama a getAllDTO)
    },

    // --- Implementación de la acción fetchPromotionalProducts ---
    fetchPromotionalProducts: async () => {
        set({ loadingPromotional: true, errorPromotional: null });
        try {
            // *** Llama al productService que ahora apunta a /productos/dto/promociones ***
            const promotionalData = await productService.getPromotionalDTOs();
            set({
                promotionalProducts: promotionalData,
                loadingPromotional: false,
            });
        } catch (error: any) {
            console.error("Error fetching promotional products in store:", error);
            set({
                errorPromotional: `Failed to load promotional products: ${error.message || String(error)}`,
                loadingPromotional: false,
                promotionalProducts: [],
            });
        }
    },
    // --- Fin implementación fetchPromotionalProducts ---

    // Opcional: Implementación de fetchProductById, etc.
    // fetchProductById: async (id: string) => { ... },
}));

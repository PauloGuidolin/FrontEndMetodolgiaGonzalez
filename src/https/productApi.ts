// Archivo: src/https/productService.ts

import { ProductoDTO } from '../components/dto/ProductoDTO';
import { ProductoRequestDTO } from '../components/dto/ProductoRequestDTO'; 
import { ProductFilters } from '../store/productStore';
import { http } from './httpService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PRODUCT_ENDPOINT = `${API_BASE_URL}/productos`;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida. Configura tu archivo .env en la raíz del frontend.");
}

const parseJsonIfString = (data: any): any => {
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return parsed;
        } catch (e) {
            console.error("Failed to parse JSON string:", data, e);
            return data;
        }
    }
    return data;
};

// --- Definición del servicio de productos ---
export const productService = {

    getAllDTO: async (): Promise<ProductoDTO[]> => {
        const url = `${PRODUCT_ENDPOINT}/dto`;
        console.log(`Fetching all products from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getAllDTO but received:", parsedData);
                return [];
            }
            return parsedData as ProductoDTO[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getAllDTO:", error);
            throw new Error(`Failed to fetch all products: ${errorMessage}`);
        }
    },

    getDTOSById: async (id: string | number): Promise<ProductoDTO | null> => {
        const url = `${PRODUCT_ENDPOINT}/dto/${id}`;
        console.log(`Fetching product ID ${id} from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (parsedData === null) return null;
            if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
                console.error(`Expected object from getDTOSById for ID ${id} but received:`, parsedData);
                return null;
            }
            return parsedData as ProductoDTO;
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error(`Error fetching product with ID ${id}:`, error);
            throw new Error(`Failed to fetch product with ID ${id}: ${errorMessage}`);
        }
    },

    getPromotionalDTOs: async (): Promise<ProductoDTO[]> => {
        const url = `${PRODUCT_ENDPOINT}/dto/promociones`;
        console.log(`Fetching promotional products from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getPromotionalDTOs but received:", parsedData);
                return [];
            }
            return parsedData as ProductoDTO[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getPromotionalDTOs:", error);
            throw new Error(`Failed to fetch promotional products: ${errorMessage}`);
        }
    },

    getFilteredProducts: async (filters: ProductFilters): Promise<ProductoDTO[]> => {
        const url = `${PRODUCT_ENDPOINT}/filtrar`;
        console.log(`Fetching filtered products from: ${url} with filters:`, filters);
        try {
            const data = await http.post(url, filters);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getFilteredProducts but received:", parsedData);
                return [];
            }
            return parsedData as ProductoDTO[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getFilteredProducts:", error);
            throw new Error(`Failed to fetch filtered products: ${errorMessage}`);
        }
    },

    getAllAvailableCategories: async (): Promise<string[]> => {
        const url = `${PRODUCT_ENDPOINT}/categorias`;
        console.log(`Fetching categories from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                console.error("Expected array of strings from getAllAvailableCategories but received:", parsedData);
                return [];
            }
            return parsedData as string[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getAllAvailableCategories:", error);
            throw new Error(`Failed to fetch available categories: ${errorMessage}`);
        }
    },

    getAllAvailableColors: async (): Promise<string[]> => {
        const url = `${PRODUCT_ENDPOINT}/colores`;
        console.log(`Fetching colors from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                console.error("Expected array of strings from getAllAvailableColors but received:", parsedData);
                return [];
            }
            return parsedData as string[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getAllAvailableColors:", error);
            throw new Error(`Failed to fetch available colors: ${errorMessage}`);
        }
    },

    getAllAvailableTalles: async (): Promise<string[]> => {
        const url = `${PRODUCT_ENDPOINT}/talles`;
        console.log(`Fetching sizes from: ${url}`);
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);
            if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                console.error("Expected array of strings from getAllAvailableTalles but received:", parsedData);
                return [];
            }
            return parsedData as string[];
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error in getAllAvailableTalles:", error);
            throw new Error(`Failed to fetch available sizes: ${errorMessage}`);
        }
    },

    /**
     * Crea un nuevo producto.
     * @param productData Los datos del producto a crear (ahora ProductoRequestDTO).
     * @returns Una promesa que se resuelve con el ProductoDTO creado.
     */
    create: async (productData: ProductoRequestDTO): Promise<ProductoDTO> => { // ¡CAMBIADO EL TIPO DE ENTRADA!
        const url = `${PRODUCT_ENDPOINT}/dto`; // ¡CAMBIADO EL ENDPOINT!
        console.log(`Creating product at: ${url} with data:`, productData);
        try {
            const createdProduct = await http.post<ProductoDTO>(url, productData);
            return createdProduct;
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error creating product:", error);
            throw new Error(`Failed to create product: ${errorMessage}`);
        }
    },

    /**
     * Actualiza un producto existente.
     * @param id El ID del producto a actualizar.
     * @param productData Los datos actualizados del producto (ahora ProductoRequestDTO).
     * @returns Una promesa que se resuelve con el ProductoDTO actualizado.
     */
    update: async (id: number, productData: ProductoRequestDTO): Promise<ProductoDTO> => { // ¡CAMBIADO EL TIPO DE ENTRADA!
        const url = `${PRODUCT_ENDPOINT}/dto/${id}`; // ENDPOINT CORRECTO YA ESTABA
        console.log(`Updating product ID ${id} at: ${url} with data:`, productData);
        try {
            const updatedProduct = await http.put<ProductoDTO>(url, productData);
            return updatedProduct;
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error updating product:", error);
            throw new Error(`Failed to update product: ${errorMessage}`);
        }
    },

    /**
     * Elimina un producto por su ID (soft delete).
     * @param id El ID del producto a eliminar.
     * @returns Una promesa que se resuelve cuando el producto es eliminado.
     */
    delete: async (id: number): Promise<void> => {
        const url = `${PRODUCT_ENDPOINT}/eliminar/${id}`; // ¡CAMBIADO EL ENDPOINT!
        console.log(`Deleting product ID ${id} from: ${url}`);
        try {
            await http.delete(url);
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error deleting product:", error);
            throw new Error(`Failed to delete product: ${errorMessage}`);
        }
    },
};


import { ProductoDTO } from '../components/dto/ProductoDTO';
import { ProductFilters } from '../store/productStore'; 
import { http } from './httpService'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PRODUCT_ENDPOINT = `${API_BASE_URL}/productos`;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida. Configura tu archivo .env en la raíz del frontend.");
}

// Función auxiliar para intentar parsear JSON si el dato es una cadena (generalmente no necesario si httpService parsea automáticamente)
const parseJsonIfString = (data: any): any => {
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            //console.log("Parsed JSON string:", parsed); // Log opcional
            return parsed;
        } catch (e) {
            console.error("Failed to parse JSON string:", data, e);
            return data; // Devuelve el dato original si no es JSON válido
        }
    }
    return data; // Si no es string, devuelve el dato tal cual
};

// --- Definición del servicio de productos ---
export const productService = {

    // Método para obtener TODOS los productos como DTOs
    getAllDTO: async (): Promise<ProductoDTO[]> => {
        // *** CORRECCIÓN: Apunta al endpoint /productos/dto ***
        const url = `${PRODUCT_ENDPOINT}/dto`;
        console.log(`Workspaceing all products from: ${url}`); // Log de depuración

        try {
            // http.get() debe manejar la llamada y parsear el JSON
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data); // Intenta parsear si es string (redundante si http.get ya lo hace)

            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getAllDTO but received:", parsedData);
                return []; // Devuelve array vacío o lanza error si el formato es incorrecto
            }

            //console.log("Received all products DTOs:", parsedData); // Log de depuración
            return parsedData as ProductoDTO[]; // Castea al tipo esperado
        } catch (error: any) {
            console.error("Error in getAllDTO:", error);
            throw new Error(`Failed to fetch all products: ${error.message || String(error)}`);
        }
    },

    // Método para obtener un producto específico por ID como DTO
    getDTOSById: async (id: string | number): Promise<ProductoDTO | null> => {
        // *** CORRECCIÓN: Apunta al endpoint /productos/dto/{id} ***
        const url = `${PRODUCT_ENDPOINT}/dto/${id}`;
        console.log(`Workspaceing product ID ${id} from: ${url}`); // Log de depuración

        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);

            if (parsedData === null) return null; // Maneja respuestas nulas (ej: 404)

            if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
                console.error(`Expected object from getDTOSById for ID ${id} but received:`, parsedData);
                return null; // O lanza error si el formato es incorrecto
            }

            //console.log(`Received product ID ${id} DTO:`, parsedData); // Log de depuración
            return parsedData as ProductoDTO; // Castea
        } catch (error: any) {
            console.error(`Error fetching product with ID ${id}:`, error);
             // Puedes refinar el manejo de errores, ej: si error.response.status === 404 return null;
            throw new Error(`Failed to fetch product with ID ${id}: ${error.message || String(error)}`);
        }
    },

    // Método para obtener productos promocionales como DTOs
    getPromotionalDTOs: async (): Promise<ProductoDTO[]> => {
        // Apunta al endpoint /productos/dto/promociones
        const url = `${PRODUCT_ENDPOINT}/dto/promociones`; // <-- Endpoint correcto

        console.log(`Workspaceing promotional products from: ${url}`); // Log de depuración
        try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);

            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getPromotionalDTOs but received:", parsedData);
                return [];
            }
            //console.log("Received promotional products DTOs:", parsedData); // Log de depuración
            return parsedData as ProductoDTO[];
        } catch (error: any) {
            console.error("Error in getPromotionalDTOs:", error);
            throw new Error(`Failed to fetch promotional products: ${error.message || String(error)}`);
        }
    },

    // Método para obtener productos filtrados como DTOs (usa POST)
    getFilteredProducts: async (filters: ProductFilters): Promise<ProductoDTO[]> => {
        // Apunta al endpoint /productos/filtrar con método POST
        const url = `${PRODUCT_ENDPOINT}/filtrar`; // <-- Endpoint correcto

        console.log(`Workspaceing filtered products from: ${url} with filters:`, filters); // Log de depuración
        try {
            // http.post() debe manejar la llamada POST con el body (filtros)
            const data = await http.post(url, filters);
            const parsedData = parseJsonIfString(data);

            if (!Array.isArray(parsedData)) {
                console.error("Expected array from getFilteredProducts but received:", parsedData);
                return [];
            }
            //console.log("Received filtered products DTOs:", parsedData); // Log de depuración
            return parsedData as ProductoDTO[];
        } catch (error: any) {
            console.error("Error in getFilteredProducts:", error);
             throw new Error(`Failed to fetch filtered products: ${error.message || String(error)}`);
        }
    },

    // --- Métodos para obtener opciones de filtro (devuelven arrays de strings) ---
    // Estos endpoints en tu controlador sí estaban en la raíz de /productos
    getAllAvailableCategories: async (): Promise<string[]> => {
        const url = `${PRODUCT_ENDPOINT}/categorias`;
         console.log(`Workspaceing categories from: ${url}`);
         try {
            const data = await http.get(url);
            const parsedData = parseJsonIfString(data);

            if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                 console.error("Expected array of strings from getAllAvailableCategories but received:", parsedData);
                 return [];
            }
            //console.log("Received categories:", parsedData);
            return parsedData as string[];
        } catch (error: any) {
            console.error("Error in getAllAvailableCategories:", error);
            throw new Error(`Failed to fetch available categories: ${error.message || String(error)}`);
        }
    },

     getAllAvailableColors: async (): Promise<string[]> => {
         const url = `${PRODUCT_ENDPOINT}/colores`;
         console.log(`Workspaceing colors from: ${url}`);
          try {
             const data = await http.get(url);
             const parsedData = parseJsonIfString(data);

             if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                  console.error("Expected array of strings from getAllAvailableColors but received:", parsedData);
                  return [];
             }
             //console.log("Received colors:", parsedData);
             return parsedData as string[];
         } catch (error: any) {
             console.error("Error in getAllAvailableColors:", error);
             throw new Error(`Failed to fetch available colors: ${error.message || String(error)}`);
         }
     },

     getAllAvailableTalles: async (): Promise<string[]> => {
         const url = `${PRODUCT_ENDPOINT}/talles`;
         console.log(`Workspaceing sizes from: ${url}`);
         try {
             const data = await http.get(url);
             const parsedData = parseJsonIfString(data);

             if (!Array.isArray(parsedData) || parsedData.some(item => typeof item !== 'string')) {
                 console.error("Expected array of strings from getAllAvailableTalles but received:", parsedData);
                 return [];
             }
             //console.log("Received sizes:", parsedData);
             return parsedData as string[];
         } catch (error: any) {
             console.error("Error in getAllAvailableTalles:", error);
             throw new Error(`Failed to fetch available sizes: ${error.message || String(error)}`);
         }
     },

    // ... añade cualquier otro método de servicio para otros endpoints de productos ...
};

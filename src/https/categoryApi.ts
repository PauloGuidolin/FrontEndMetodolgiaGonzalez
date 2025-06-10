// src/https/categoryApi.ts

import { CategoriaDTO } from '../components/dto/CategoriaDTO';
import { http } from './httpService'; // Importamos el servicio HTTP base

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const CATEGORY_ENDPOINT = `${API_BASE_URL}/categorias`;

/**
 * Servicio API para interactuar con los recursos de Categoría.
 */
export const categoryService = {

    getAll: async (): Promise<CategoriaDTO[]> => {
        const url = CATEGORY_ENDPOINT;
        try {
            const data = await http.get<CategoriaDTO[]>(url);
            console.log('API Response for getAll Categories (categoryApi.ts):', data);
            return data;
        } catch (error) {
            console.error('Error in categoryService.getAll (categoryApi.ts):', error);
            throw error;
        }
    },

    getById: async (id: number | string): Promise<CategoriaDTO> => {
        const url = `${CATEGORY_ENDPOINT}/${id}`;
        return http.get<CategoriaDTO>(url);
    },

    getRootCategories: async (): Promise<CategoriaDTO[]> => {
        const url = `${CATEGORY_ENDPOINT}/raiz`;
        return http.get<CategoriaDTO[]>(url);
    },

    getSubcategories: async (idPadre: number | string): Promise<CategoriaDTO[]> => {
        const url = `${CATEGORY_ENDPOINT}/${idPadre}/subcategorias`;
        return http.get<CategoriaDTO[]>(url);
    },

    create: async (categoryData: Partial<CategoriaDTO>): Promise<CategoriaDTO> => {
        const url = CATEGORY_ENDPOINT;
        return http.post<CategoriaDTO>(url, categoryData);
    },

    update: async (categoryData: CategoriaDTO): Promise<CategoriaDTO> => {
        // Tu BaseController tiene PUT /{id} pero con @RequestBody E entity.
        // Si el BaseController en realidad espera el ID en la URL para el PUT,
        // tendríamos que cambiar esto a `${CATEGORY_ENDPOINT}/${categoryData.id}`.
        // Asumiendo que tu BaseController.actualizar() lo maneja con el ID en el body (como el payload que mostraste inicialmente)
        // entonces la URL base es CATEGORY_ENDPOINT y el ID va dentro de categoryData.
        // Sin embargo, si quieres que PUT funcione como una actualización de recurso completo y el ID en la URL,
        // la URL sería: `${CATEGORY_ENDPOINT}/${categoryData.id}`
        // Y el body solo el objeto sin el ID en el path.
        // Para ser RESTful, un PUT /recurso/{id} debería llevar el ID en el path.
        // Recomiendo que el BaseController.actualizar sea @PutMapping("/{id}") y reciba CategoriaDTO en el body SIN el id en el path.
        // PERO, dado que el backend ya tiene `actualizar(@PathVariable ID id, @RequestBody E entity)`,
        // la llamada correcta desde aquí sería: `http.put<CategoriaDTO>(`${CATEGORY_ENDPOINT}/${categoryData.id}`, categoryData);`
        // **Voy a asumir esto para la corrección.**
        const url = `${CATEGORY_ENDPOINT}/${categoryData.id}`; // <--- ¡CAMBIO CLAVE AQUÍ!
        return http.put<CategoriaDTO>(url, categoryData);
    },

    delete: async (id: number | string): Promise<void> => {
        const url = `${CATEGORY_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    /**
     * Activa una categoría por su ID.
     * Coincide con el endpoint PUT /categorias/activar/{id} en BaseController.
     * @param id El ID de la categoría a activar.
     * @returns Una Promesa que resuelve con la categoría activada.
     * @throws Un error si la solicitud falla.
     */
    activate: async (id: number | string): Promise<CategoriaDTO> => { // <--- ¡NUEVO MÉTODO!
        const url = `${CATEGORY_ENDPOINT}/activar/${id}`;
        return http.put<CategoriaDTO>(url, {}); // PUT con body vacío o {} si el backend no lo requiere
    },
};
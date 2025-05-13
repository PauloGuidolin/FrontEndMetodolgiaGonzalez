

import { ICategoria } from '../types/ICategoria'; // Importamos la interfaz de Categoría (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto (ej. lanzar un error fatal al inicio de la app)
}

// Definimos el endpoint específico para categorías
// Coincide con @RequestMapping("/categorias") en CategoriaController de tu backend
const CATEGORY_ENDPOINT = `${API_BASE_URL}/categorias`;

/**
 * Servicio API para interactuar con los recursos de Categoría.
 * Estos endpoints probablemente son públicos, ya que se usan para navegar por el catálogo.
 */
export const categoryService = {

  /**
   * Obtiene todas las categorías del backend.
   * Coincide con el endpoint GET /categorias (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de ICategoria.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<ICategoria[]> => {
    const url = CATEGORY_ENDPOINT;
    // Este endpoint probablemente es público y no requiere autenticación
    return http.get<ICategoria[]>(url);
  },

   /**
   * Obtiene una categoría por su ID.
   * Coincide con el endpoint GET /categorias/{id} (heredado de BaseController).
   * @param id El ID de la categoría. Puede ser number o string dependiendo de cómo lo maneje tu backend y frontend.
   * @returns Una Promesa que resuelve con un ICategoria.
   * @throws Un error si la solicitud falla o la categoría no se encuentra.
   */
  getById: async (id: number | string): Promise<ICategoria> => {
    const url = `${CATEGORY_ENDPOINT}/${id}`;
    // Este endpoint probablemente es público
    return http.get<ICategoria>(url);
  },

  /**
   * Obtiene todas las categorías raíz (sin padre).
   * Coincide con el endpoint GET /categorias/raiz en CategoriaController.
   * @returns Una Promesa que resuelve con un array de ICategoria.
   * @throws Un error si la solicitud falla.
   */
  getRootCategories: async (): Promise<ICategoria[]> => {
    const url = `${CATEGORY_ENDPOINT}/raiz`;
    // Este endpoint probablemente es público
    return http.get<ICategoria[]>(url);
  },

  /**
   * Obtiene las subcategorías de una categoría padre.
   * Coincide con el endpoint GET /categorias/{idPadre}/subcategorias en CategoriaController.
   * @param idPadre El ID de la categoría padre.
   * @returns Una Promesa que resuelve con un array de ICategoria.
   * @throws Un error si la solicitud falla.
   */
  getSubcategories: async (idPadre: number | string): Promise<ICategoria[]> => {
    const url = `${CATEGORY_ENDPOINT}/${idPadre}/subcategorias`;
    // Este endpoint probablemente es público
    return http.get<ICategoria[]>(url);
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por CategoriaController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea una nueva categoría.
   * Coincide con el endpoint POST /categorias (heredado de BaseController).
   * @param categoryData Los datos de la categoría a crear.
   * @returns Una Promesa que resuelve con la categoría creada.
   * @throws Un error si la solicitud falla.
   */
  create: async (categoryData: Partial<ICategoria>): Promise<ICategoria> => {
      const url = CATEGORY_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<ICategoria>(url, categoryData);
  },

  /**
   * Actualiza una categoría existente.
   * Coincide con el endpoint PUT /categorias (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param categoryData Los datos de la categoría a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la categoría actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (categoryData: ICategoria): Promise<ICategoria> => { // Esperamos el objeto completo con ID
      const url = CATEGORY_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<ICategoria>(url, categoryData);
  },

  /**
   * Elimina una categoría por su ID.
   * Coincide con el endpoint DELETE /categorias/{id} (heredado de BaseController).
   * @param id El ID de la categoría a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${CATEGORY_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

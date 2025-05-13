
import { IImagen } from '../types/IImagen'; // Importa la interfaz de Imagen
import { http } from './httpService'; // Importa el servicio HTTP base (ahora usa Axios)

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verifica si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // Considera manejar esto de forma más robusta en un proyecto real
}

// Define el endpoint específico para imágenes
const IMAGE_ENDPOINT = `${API_BASE_URL}/imagen`; // Coincide con @RequestMapping("/imagen")

/**
 * Servicio API para interactuar con los recursos de Imagen.
 * Nota: Directamente interactuar con Imagenes vía API puede ser menos común
 * que acceder a ellas a través de la entidad Producto padre.
 * Los endpoints CRUD probablemente requieren autenticación (ej. ADMIN).
 */
export const imageService = {

  /**
   * Obtiene todas las imágenes.
   * Coincide con GET /imagen.
   * @returns Una Promesa que resuelve con un array de IImagen.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IImagen[]> => {
    const url = IMAGE_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IImagen[]>(url);
  },

   /**
   * Obtiene una imagen por su ID.
   * Coincide con GET /imagen/{id}.
   * @param id El ID de la imagen.
   * @returns Una Promesa que resuelve con un IImagen.
   * @throws Un error si la solicitud falla o la imagen no se encuentra.
   */
  getById: async (id: number | string): Promise<IImagen> => {
    const url = `${IMAGE_ENDPOINT}/${id}`;
    // Este endpoint podría ser público si las URLs de las imágenes son públicas,
    // pero si necesitas obtener metadatos de la entidad Imagen, podría requerir autenticación.
    return http.get<IImagen>(url);
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por ImagenController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea una nueva imagen.
   * Coincide con POST /imagen.
   * @param imageData Los datos de la imagen a crear. Puede ser metadatos JSON (Partial<IImagen>)
   * o un objeto FormData si estás subiendo un archivo binario.
   * @returns Una Promesa que resuelve con la imagen creada.
   * @throws Un error si la solicitud falla.
   */
  // CORRECCIÓN: Aceptamos Partial<IImagen> O FormData
  create: async (imageData: Partial<IImagen> | FormData): Promise<IImagen> => {
      const url = IMAGE_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      // http.post (usando Axios) maneja automáticamente si imageData es JSON o FormData.
      return http.post<IImagen>(url, imageData);
  },

  /**
   * Actualiza una imagen existente.
   * Coincide con PUT /imagen.
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo.
   * @param imageData Los datos de la imagen a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la imagen actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (imageData: IImagen): Promise<IImagen> => { // Esperamos el objeto completo con ID
      const url = IMAGE_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IImagen>(url, imageData);
  },

  /**
   * Elimina una imagen por su ID.
   * Coincide con DELETE /imagen/{id}.
   * @param id El ID de la imagen a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${IMAGE_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

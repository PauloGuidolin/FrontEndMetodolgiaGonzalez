

import { IAdmin } from '../types/IAdmin'; // Importamos la interfaz de Admin (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto (ej. lanzar un error fatal al inicio de la app)
}

// Definimos el endpoint específico para admins
// Coincide con @RequestMapping("/admin") en AdminController de tu backend
const ADMIN_ENDPOINT = `${API_BASE_URL}/admin`;

/**
 * Servicio API para interactuar con los recursos de Admin.
 * Asume que la mayoría de estos endpoints requieren autenticación de ADMIN.
 */
export const adminService = {

  /**
   * Obtiene todos los admins.
   * Coincide con el endpoint GET /admin (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IAdmin.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IAdmin[]> => {
    const url = ADMIN_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IAdmin[]>(url);
  },

   /**
   * Obtiene un admin por su ID.
   * Coincide con el endpoint GET /admin/{id} (heredado de BaseController).
   * @param id El ID del admin. Puede ser number o string.
   * @returns Una Promesa que resuelve con un IAdmin.
   * @throws Un error si la solicitud falla o el admin no se encuentra.
   */
  getById: async (id: number | string): Promise<IAdmin> => {
    const url = `${ADMIN_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IAdmin>(url);
  },

  /**
   * Busca un admin por su nombre de usuario.
   * Coincide con el endpoint GET /admin/username/{userName} en AdminController.
   * @param userName El nombre de usuario.
   * @returns Una Promesa que resuelve con un IAdmin o null si no se encuentra.
   * @throws Un error si la solicitud falla.
   */
  getByUserName: async (userName: string): Promise<IAdmin | null> => {
       const url = `${ADMIN_ENDPOINT}/username/${userName}`;
       // Este endpoint probablemente requiere autenticación (ADMIN)
       try {
          const response = await http.get<IAdmin>(url);
          // Tu backend devuelve 200 OK incluso si no encuentra el admin,
          // y el cuerpo es null. Manejamos eso aquí.
          if (response === null) {
              return null;
          }
          return response;
      } catch (error) {
           // Tu backend devuelve 400 en caso de error. Si 400 significa "no encontrado"
           // puedes ajustar el manejo de errores. Por ahora, relanzamos cualquier error.
           console.error(`Error fetching admin by username ${userName}:`, error);
           // Si tu backend devuelve 404 para no encontrado, descomenta y ajusta:
           // if (error instanceof Error && error.message.includes('Status: 404')) {
           //     return null;
           // }
           throw error; // Relanza otros errores (incluyendo 400)
      }
   },

  /**
   * Busca un admin por el ID de su imagen de usuario.
   * Coincide con el endpoint GET /admin/imagen/{idImagen} en AdminController.
   * @param idImagen El ID de la imagen de usuario.
   * @returns Una Promesa que resuelve con un IAdmin o null si no se encuentra.
   * @throws Un error si la solicitud falla.
   */
  getByImagenUserId: async (idImagen: number | string): Promise<IAdmin | null> => {
      const url = `${ADMIN_ENDPOINT}/imagen/${idImagen}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      try {
          const response = await http.get<IAdmin>(url);
           // Tu backend devuelve 200 OK incluso si no encuentra el admin,
          // y el cuerpo es null. Manejamos eso aquí.
           if (response === null) {
              return null;
          }
          return response;
      } catch (error) {
           // Tu backend devuelve 400 en caso de error. Si 400 significa "no encontrado"
           // puedes ajustar el manejo de errores. Por ahora, relanzamos cualquier error.
           console.error(`Error fetching admin by imagen user ID ${idImagen}:`, error);
           // Si tu backend devuelve 404 para no encontrado, descomenta y ajusta:
           // if (error instanceof Error && error.message.includes('Status: 404')) {
           //     return null;
           // }
           throw error; // Relanza otros errores (incluyendo 400)
      }
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por AdminController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea un nuevo admin.
   * Coincide con el endpoint POST /admin (heredado de BaseController).
   * @param adminData Los datos del admin a crear.
   * @returns Una Promesa que resuelve con el admin creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (adminData: Partial<IAdmin>): Promise<IAdmin> => {
      const url = ADMIN_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<IAdmin>(url, adminData);
  },

  /**
   * Actualiza un admin existente.
   * Coincide con el endpoint PUT /admin (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param adminData Los datos del admin a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el admin actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (adminData: IAdmin): Promise<IAdmin> => { // Esperamos el objeto completo con ID
      const url = ADMIN_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IAdmin>(url, adminData);
  },

  /**
   * Elimina un admin por su ID.
   * Coincide con el endpoint DELETE /admin/{id} (heredado de BaseController).
   * @param id El ID del admin a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${ADMIN_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

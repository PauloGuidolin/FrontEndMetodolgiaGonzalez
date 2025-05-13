

import { IUsuario } from '../types/IUsuario'; // Importamos la interfaz de Usuario (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para gestión de usuarios
// Coincide con @RequestMapping("/usuarios") en UsuarioController de tu backend
const USER_MANAGEMENT_ENDPOINT = `${API_BASE_URL}/usuarios`;

/**
 * Servicio API para interactuar con los recursos de Usuario (Gestión).
 * Estos endpoints, expuestos por el BaseController, probablemente requieren autenticación (ej. ADMIN).
 * Las operaciones de login y registro se manejan en el servicio authApi.ts.
 */
export const userManagementService = {

  /**
   * Obtiene todos los usuarios.
   * Coincide con el endpoint GET /usuarios (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IUsuario.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IUsuario[]> => {
    const url = USER_MANAGEMENT_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IUsuario[]>(url);
  },

   /**
   * Obtiene un usuario por su ID.
   * Coincide con el endpoint GET /usuarios/{id} (heredado de BaseController).
   * @param id El ID del usuario. Puede ser number o string.
   * @returns Una Promesa que resuelve con un IUsuario.
   * @throws Un error si la solicitud falla o el usuario no se encuentra.
   */
  getById: async (id: number | string): Promise<IUsuario> => {
    const url = `${USER_MANAGEMENT_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IUsuario>(url);
  },

  /**
   * Crea un nuevo usuario.
   * Coincide con el endpoint POST /usuarios (heredado de BaseController).
   * Nota: El registro de usuarios regulares se maneja típicamente a través de /auth/register.
   * Este endpoint POST /usuarios podría usarse, por ejemplo, por un ADMIN para crear usuarios.
   * @param userData Los datos del usuario a crear.
   * @returns Una Promesa que resuelve con el usuario creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (userData: Partial<IUsuario>): Promise<IUsuario> => {
      const url = USER_MANAGEMENT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      // Para registro de usuarios regulares, usa authService.register
      return http.post<IUsuario>(url, userData);
  },

  /**
   * Actualiza un usuario existente.
   * Coincide con el endpoint PUT /usuarios (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param userData Los datos del usuario a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el usuario actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (userData: IUsuario): Promise<IUsuario> => { // Esperamos el objeto completo con ID
      const url = USER_MANAGEMENT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IUsuario>(url, userData);
  },

  /**
   * Elimina un usuario por su ID.
   * Coincide con el endpoint DELETE /usuarios/{id} (heredado de BaseController).
   * @param id El ID del usuario a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${USER_MANAGEMENT_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },

  // Nota: Los métodos findByUserName, findByImagenUserId para usuarios
  // son expuestos a través de los controladores de Admin y Cliente, no directamente en UsuarioController.
  // Si necesitas esos finders específicos para usuarios generales, deberías añadirlos a UsuarioController en el backend.
  // Como no están en UsuarioController, no los incluimos aquí.
};

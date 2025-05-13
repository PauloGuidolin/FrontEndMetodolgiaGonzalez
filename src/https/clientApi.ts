

import { ICliente } from '../types/ICliente'; // Importamos la interfaz de Cliente (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto (ej. lanzar un error fatal al inicio de la app)
}

// Definimos el endpoint específico para clientes
// Coincide con @RequestMapping("/clientes") en ClienteController de tu backend
const CLIENT_ENDPOINT = `${API_BASE_URL}/clientes`;

/**
 * Servicio API para interactuar con los recursos de Cliente.
 * Algunos endpoints pueden requerir autenticación (ej. obtener perfil propio),
 * otros pueden requerir autenticación de ADMIN (ej. obtener todos los clientes).
 */
export const clientService = {

  /**
   * Obtiene todos los clientes.
   * Coincide con el endpoint GET /clientes (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de ICliente.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<ICliente[]> => {
    const url = CLIENT_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<ICliente[]>(url);
  },

   /**
   * Obtiene un cliente por su ID.
   * Coincide con el endpoint GET /clientes/{id} (heredado de BaseController).
   * @param id El ID del cliente. Puede ser number o string.
   * @returns Una Promesa que resuelve con un ICliente.
   * @throws Un error si la solicitud falla o el cliente no se encuentra.
   */
  getById: async (id: number | string): Promise<ICliente> => {
    const url = `${CLIENT_ENDPOINT}/${id}`;
    // Este endpoint podría ser accesible para el propio cliente autenticado o para ADMIN
    return http.get<ICliente>(url);
  },

  /**
   * Busca un cliente por el ID de usuario asociado.
   * Coincide con el endpoint GET /clientes/usuario/{idUsuario} en ClienteController.
   * @param idUsuario El ID del usuario.
   * @returns Una Promesa que resuelve con un ICliente o null si no se encuentra (Status 404).
   * @throws Un error si la solicitud falla.
   */
  getByUsuarioId: async (idUsuario: number | string): Promise<ICliente | null> => {
       const url = `${CLIENT_ENDPOINT}/usuario/${idUsuario}`;
       // Este endpoint probablemente requiere autenticación
       try {
          const response = await http.get<ICliente>(url);
          // Tu backend devuelve 404 para "no encontrado" en este caso.
          // La lógica de httpService maneja 404 lanzando un error.
          // Capturamos ese error para devolver null.
           if (response === null) { // Aunque la lógica de 404 ya lanza, esto es una doble verificación
              return null;
          }
          return response;
      } catch (error) {
          // Tu backend devuelve 404 para "no encontrado" en este caso.
          if (error instanceof Error && error.message.includes('Status: 404')) {
              return null; // Retorna null si el backend devuelve 404
          }
          console.error(`Error fetching client by user ID ${idUsuario}:`, error);
          throw error; // Relanza otros errores
      }
   },

  /**
   * Busca un cliente por el ID de su imagen asociada.
   * Coincide con el endpoint GET /clientes/imagen/{idImagen} en ClienteController.
   * @param idImagen El ID de la imagen asociada.
   * @returns Una Promesa que resuelve con un ICliente o null si no se encuentra (Status 404).
   * @throws Un error si la solicitud falla.
   */
  getByImagenPersonaId: async (idImagen: number | string): Promise<ICliente | null> => {
      const url = `${CLIENT_ENDPOINT}/imagen/${idImagen}`;
      // Este endpoint probablemente requiere autenticación
      try {
          const response = await http.get<ICliente>(url);
           // Tu backend devuelve 404 para "no encontrado" en este caso.
          // La lógica de httpService maneja 404 lanzando un error.
          // Capturamos ese error para devolver null.
           if (response === null) { // Aunque la lógica de 404 ya lanza, esto es una doble verificación
              return null;
          }
          return response;
      } catch (error) {
           // Tu backend devuelve 404 para "no encontrado" en este caso.
           if (error instanceof Error && error.message.includes('Status: 404')) {
              return null; // Retorna null si el backend devuelve 404
          }
           console.error(`Error fetching client by imagen persona ID ${idImagen}:`, error);
          throw error; // Relanza otros errores
      }
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por ClienteController) ---
  // Crear un cliente (registro) se maneja típicamente a través de /auth/register.
  // Este endpoint POST /clientes podría usarse, por ejemplo, por un ADMIN para crear clientes.

  /**
   * Crea un nuevo cliente.
   * Coincide con el endpoint POST /clientes (heredado de BaseController).
   * @param clientData Los datos del cliente a crear.
   * @returns Una Promesa que resuelve con el cliente creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (clientData: Partial<ICliente>): Promise<ICliente> => {
      const url = CLIENT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      // Para registro de clientes regulares, usa authService.register
      return http.post<ICliente>(url, clientData);
  },

  /**
   * Actualiza un cliente existente.
   * Coincide con el endpoint PUT /clientes (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param clientData Los datos del cliente a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el cliente actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (clientData: ICliente): Promise<ICliente> => { // Esperamos el objeto completo con ID
      const url = CLIENT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (el propio cliente o ADMIN)
      return http.put<ICliente>(url, clientData);
  },

  /**
   * Elimina un cliente por su ID.
   * Coincide con el endpoint DELETE /clientes/{id} (heredado de BaseController).
   * @param id El ID del cliente a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${CLIENT_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

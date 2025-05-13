

import { IOrdenCompra } from '../types/IOrdenCompra'; // Importamos la interfaz de OrdenCompra (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para órdenes de compra
// Coincide con @RequestMapping("/orden_compra") en OrdenCompraController de tu backend
const ORDER_ENDPOINT = `${API_BASE_URL}/orden_compra`;

/**
 * Servicio API para interactuar con los recursos de OrdenCompra.
 * Estos endpoints probablemente requieren autenticación (ej. para ver/crear las órdenes de un cliente).
 */
export const orderService = {

  /**
   * Obtiene todas las órdenes de compra.
   * Coincide con el endpoint GET /orden_compra (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IOrdenCompra.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IOrdenCompra[]> => {
    const url = ORDER_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IOrdenCompra[]>(url);
  },

   /**
   * Obtiene una orden de compra por su ID.
   * Coincide con el endpoint GET /orden_compra/{id} (heredado de BaseController).
   * @param id El ID de la orden de compra. Puede ser number o string.
   * @returns Una Promesa que resuelve con un IOrdenCompra.
   * @throws Un error si la solicitud falla o la orden no se encuentra.
   */
  getById: async (id: number | string): Promise<IOrdenCompra> => {
    const url = `${ORDER_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación (el propio cliente o ADMIN)
    return http.get<IOrdenCompra>(url);
  },

  /**
   * Obtiene todas las órdenes de compra con una fecha específica.
   * Coincide con el endpoint GET /orden_compra/fecha?fecha={fecha} en OrdenCompraController.
   * Nota: Tu backend espera la fecha como String y la parsea a LocalDateTime.
   * Asegúrate de enviar la fecha en un formato que tu backend entienda (ej. ISO 8601 "YYYY-MM-DDTHH:mm:ss").
   * @param fecha La fecha y hora de la compra (como string en formato compatible con LocalDateTime.parse).
   * @returns Una Promesa que resuelve con un array de IOrdenCompra.
   * @throws Un error si la solicitud falla.
   */
  getAllByFechaCompra: async (fecha: string): Promise<IOrdenCompra[]> => {
       const url = `${ORDER_ENDPOINT}/fecha?fecha=${encodeURIComponent(fecha)}`; // Usamos query param 'fecha'
       // Este endpoint probablemente requiere autenticación
       try {
            const response = await http.get<IOrdenCompra[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra órdenes para la fecha.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran órdenes para la fecha
            }
            console.error(`Error fetching orders by date ${fecha}:`, error);
            throw error; // Relanza otros errores
        }
   },


  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por OrdenCompraController) ---
  // Estos métodos probablemente requieren autenticación (ej. para crear las órdenes de un cliente o para que ADMIN las gestione)

  /**
   * Crea una nueva orden de compra.
   * Coincide con el endpoint POST /orden_compra (heredado de BaseController).
   * @param orderData Los datos de la orden de compra a crear.
   * @returns Una Promesa que resuelve con la orden de compra creada.
   * @throws Un error si la solicitud falla.
   */
  create: async (orderData: Partial<IOrdenCompra>): Promise<IOrdenCompra> => {
      const url = ORDER_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ej. el propio cliente al finalizar la compra)
      return http.post<IOrdenCompra>(url, orderData);
  },

  /**
   * Actualiza una orden de compra existente.
   * Coincide con el endpoint PUT /orden_compra (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param orderData Los datos de la orden de compra a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la orden de compra actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (orderData: IOrdenCompra): Promise<IOrdenCompra> => { // Esperamos el objeto completo con ID
      const url = ORDER_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ej. ADMIN para cambiar estado)
      return http.put<IOrdenCompra>(url, orderData);
  },

  /**
   * Elimina una orden de compra por su ID.
   * Coincide con el endpoint DELETE /orden_compra/{id} (heredado de BaseController).
   * @param id El ID de la orden de compra a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${ORDER_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ej. ADMIN)
      return http.delete<void>(url);
  },
};

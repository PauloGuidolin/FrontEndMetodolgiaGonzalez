

import { IOrdenCompraDetalle } from '../types/IOrdenCompraDetalle'; // Importamos la interfaz de OrdenCompraDetalle (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para detalles de orden de compra
// Coincide con @RequestMapping("/orden_compra_detalle") en OrdenCompraDetalleController de tu backend
const ORDER_DETAIL_ENDPOINT = `${API_BASE_URL}/orden_compra_detalle`;

/**
 * Servicio API para interactuar con los recursos de OrdenCompraDetalle.
 * Nota: Los detalles de orden suelen obtenerse junto con la OrdenCompra padre.
 * Interactuar directamente con ellos puede ser menos común.
 * Estos endpoints probablemente requieren autenticación.
 */
export const orderDetailService = {

  /**
   * Obtiene todos los detalles de orden de compra.
   * Coincide con el endpoint GET /orden_compra_detalle (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IOrdenCompraDetalle.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IOrdenCompraDetalle[]> => {
    const url = ORDER_DETAIL_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IOrdenCompraDetalle[]>(url);
  },

   /**
   * Obtiene un detalle de orden de compra por su ID.
   * Coincide con el endpoint GET /orden_compra_detalle/{id} (heredado de BaseController).
   * @param id El ID del detalle. Puede ser number o string.
   * @returns Una Promesa que resuelve con un IOrdenCompraDetalle.
   * @throws Un error si la solicitud falla o el detalle no se encuentra.
   */
  getById: async (id: number | string): Promise<IOrdenCompraDetalle> => {
    const url = `${ORDER_DETAIL_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación
    return http.get<IOrdenCompraDetalle>(url);
  },

  /**
   * Obtiene todos los detalles de una orden de compra específica.
   * Coincide con el endpoint GET /orden_compra_detalle/ordenCompra/{idOrdenCompra} en OrdenCompraDetalleController.
   * @param idOrdenCompra El ID de la orden de compra padre.
   * @returns Una Promesa que resuelve con un array de IOrdenCompraDetalle.
   * @throws Un error si la solicitud falla.
   */
  getAllByOrdenCompraId: async (idOrdenCompra: number | string): Promise<IOrdenCompraDetalle[]> => {
       const url = `${ORDER_DETAIL_ENDPOINT}/ordenCompra/${idOrdenCompra}`;
       // Este endpoint probablemente requiere autenticación (el propio cliente o ADMIN)
       try {
            const response = await http.get<IOrdenCompraDetalle[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra detalles para la orden.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran detalles para la orden
            }
            console.error(`Error fetching order details by order ID ${idOrdenCompra}:`, error);
            throw error; // Relanza otros errores
        }
   },

   /**
   * Obtiene todos los detalles que contienen un producto detalle específico.
   * Coincide con el endpoint GET /orden_compra_detalle/productoDetalle/{idProductoDetalle} en OrdenCompraDetalleController.
   * @param idProductoDetalle El ID del detalle de producto.
   * @returns Una Promesa que resuelve con un array de IOrdenCompraDetalle.
   * @throws Un error si la solicitud falla.
   */
  getAllByProductoDetalleId: async (idProductoDetalle: number | string): Promise<IOrdenCompraDetalle[]> => {
       const url = `${ORDER_DETAIL_ENDPOINT}/productoDetalle/${idProductoDetalle}`;
       // Este endpoint probablemente requiere autenticación
       try {
            const response = await http.get<IOrdenCompraDetalle[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra detalles para el producto detalle.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran detalles para el producto detalle
            }
            console.error(`Error fetching order details by producto detalle ID ${idProductoDetalle}:`, error);
            throw error; // Relanza otros errores
        }
   },


  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por OrdenCompraDetalleController) ---
  // Nota: Crear/actualizar/eliminar detalles de orden generalmente se hace a través de la OrdenCompra padre.
  // Estos métodos probablemente requieren autenticación (ej. ADMIN)

  /**
   * Crea un nuevo detalle de orden de compra.
   * Coincide con el endpoint POST /orden_compra_detalle (heredado de BaseController).
   * @param orderDetailData Los datos del detalle a crear.
   * @returns Una Promesa que resuelve con el detalle creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (orderDetailData: Partial<IOrdenCompraDetalle>): Promise<IOrdenCompraDetalle> => {
      const url = ORDER_DETAIL_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<IOrdenCompraDetalle>(url, orderDetailData);
  },

  /**
   * Actualiza un detalle de orden de compra existente.
   * Coincide con el endpoint PUT /orden_compra_detalle (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param orderDetailData Los datos del detalle a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el detalle actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (orderDetailData: IOrdenCompraDetalle): Promise<IOrdenCompraDetalle> => { // Esperamos el objeto completo con ID
      const url = ORDER_DETAIL_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IOrdenCompraDetalle>(url, orderDetailData);
  },

  /**
   * Elimina un detalle de orden de compra por su ID.
   * Coincide con el endpoint DELETE /orden_compra_detalle/{id} (heredado de BaseController).
   * @param id El ID del detalle a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${ORDER_DETAIL_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

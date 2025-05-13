

import { IDescuento } from '../types/IDescuento'; // Importamos la interfaz de Descuento (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para descuentos
// Coincide con @RequestMapping("/descuentos") en DescuentoController de tu backend
const DISCOUNT_ENDPOINT = `${API_BASE_URL}/descuentos`;

/**
 * Servicio API para interactuar con los recursos de Descuento.
 * Algunos endpoints pueden ser públicos (ej. obtener descuentos activos),
 * otros pueden requerir autenticación de ADMIN (ej. crear/actualizar/eliminar).
 */
export const discountService = {

  /**
   * Obtiene todos los descuentos.
   * Coincide con el endpoint GET /descuentos (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IDescuento.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IDescuento[]> => {
    const url = DISCOUNT_ENDPOINT;
    // Este endpoint podría ser público o requerir autenticación
    return http.get<IDescuento[]>(url);
  },

   /**
   * Obtiene un descuento por su ID.
   * Coincide con el endpoint GET /descuentos/{idDescuento} en DescuentoController.
   * @param id El ID del descuento. Nota: El endpoint en el backend usa {idDescuento}.
   * @returns Una Promesa que resuelve con un IDescuento.
   * @throws Un error si la solicitud falla o el descuento no se encuentra (Status 404).
   */
  getById: async (id: number | string): Promise<IDescuento> => {
    // Usamos {id} en la URL ya que es el parámetro que espera el endpoint /descuentos/{idDescuento}
    const url = `${DISCOUNT_ENDPOINT}/${id}`;
    // Este endpoint podría ser público
    try {
        return await http.get<IDescuento>(url);
    } catch (error) {
        // Tu backend devuelve 404 para "no encontrado" en este caso.
        if (error instanceof Error && error.message.includes('Status: 404')) {
            // Puedes lanzar un error específico o retornar null si prefieres
            throw new Error(`Discount with ID ${id} not found.`);
        }
        throw error; // Relanza otros errores
    }
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por DescuentoController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea un nuevo descuento.
   * Coincide con el endpoint POST /descuentos (heredado de BaseController).
   * @param discountData Los datos del descuento a crear.
   * @returns Una Promesa que resuelve con el descuento creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (discountData: Partial<IDescuento>): Promise<IDescuento> => {
      const url = DISCOUNT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<IDescuento>(url, discountData);
  },

  /**
   * Actualiza un descuento existente.
   * Coincide con el endpoint PUT /descuentos (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param discountData Los datos del descuento a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el descuento actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (discountData: IDescuento): Promise<IDescuento> => { // Esperamos el objeto completo con ID
      const url = DISCOUNT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IDescuento>(url, discountData);
  },

  /**
   * Elimina un descuento por su ID.
   * Coincide con el endpoint DELETE /descuentos/{id} (heredado de BaseController).
   * @param id El ID del descuento a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${DISCOUNT_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

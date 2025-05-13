

import { IProvincia } from '../types/IProvincia'; // Importamos la interfaz de Provincia (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para provincias
// Coincide con @RequestMapping("/provincia") en ProvinciaController de tu backend
const PROVINCE_ENDPOINT = `${API_BASE_URL}/provincia`;

/**
 * Servicio API para interactuar con los recursos de Provincia.
 * Estos endpoints probablemente son públicos ya que se usan para formularios de dirección.
 */
export const provinceService = {

  /**
   * Obtiene todas las provincias.
   * Coincide con el endpoint GET /provincia (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IProvincia.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IProvincia[]> => {
    const url = PROVINCE_ENDPOINT;
    // Este endpoint probablemente es público
    try {
        const response = await http.get<IProvincia[]>(url);
         // Tu backend podría devolver una lista vacía [] si no encuentra provincias.
         // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
         if (response === null) { // Si el backend devuelve 200 con cuerpo null
             return [];
         }
         return response;
    } catch (error) {
         // Tu backend puede devolver 404 en caso de error.
         if (error instanceof Error && error.message.includes('Status: 404')) {
            return []; // Retorna un array vacío si no se encuentran provincias
        }
        console.error(`Error fetching provinces:`, error);
        throw error; // Relanza otros errores
    }
  },

   /**
   * Obtiene una provincia por su ID.
   * Coincide con el endpoint GET /provincia/{id} (heredado de BaseController).
   * @param id El ID de la provincia. Puede ser number o string.
   * @returns Una Promesa que resuelve con un IProvincia.
   * @throws Un error si la solicitud falla o la provincia no se encuentra.
   */
  getById: async (id: number | string): Promise<IProvincia> => {
    const url = `${PROVINCE_ENDPOINT}/${id}`;
    // Este endpoint probablemente es público
    return http.get<IProvincia>(url);
  },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por ProvinciaController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea una nueva provincia.
   * Coincide con el endpoint POST /provincia (heredado de BaseController).
   * @param provinceData Los datos de la provincia a crear.
   * @returns Una Promesa que resuelve con la provincia creada.
   * @throws Un error si la solicitud falla.
   */
  create: async (provinceData: Partial<IProvincia>): Promise<IProvincia> => {
      const url = PROVINCE_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<IProvincia>(url, provinceData);
  },

  /**
   * Actualiza una provincia existente.
   * Coincide con el endpoint PUT /provincia (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param provinceData Los datos de la provincia a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la provincia actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (provinceData: IProvincia): Promise<IProvincia> => { // Esperamos el objeto completo con ID
      const url = PROVINCE_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IProvincia>(url, provinceData);
  },

  /**
   * Elimina una provincia por su ID.
   * Coincide con el endpoint DELETE /provincia/{id} (heredado de BaseController).
   * @param id El ID de la provincia a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${PROVINCE_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

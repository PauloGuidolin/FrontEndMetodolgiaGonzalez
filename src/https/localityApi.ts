

import { ILocalidad } from '../types/ILocalidad'; // Importamos la interfaz de Localidad (asegúrate de que la ruta sea correcta)
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // En un proyecto real, considera una forma más robusta de manejar esto
}

// Definimos el endpoint específico para localidades
// Coincide con @RequestMapping("/localidades") en LocalidadController de tu backend
const LOCALITY_ENDPOINT = `${API_BASE_URL}/localidades`;

/**
 * Servicio API para interactuar con los recursos de Localidad.
 * Estos endpoints probablemente son públicos ya que se usan para formularios de dirección.
 */
export const localityService = {

  /**
   * Obtiene todas las localidades.
   * Coincide con el endpoint GET /localidades (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de ILocalidad.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<ILocalidad[]> => {
    const url = LOCALITY_ENDPOINT;
    // Este endpoint probablemente es público
    return http.get<ILocalidad[]>(url);
  },

   /**
   * Obtiene una localidad por su ID.
   * Coincide con el endpoint GET /localidades/{id} (heredado de BaseController).
   * @param id El ID de la localidad. Puede ser number o string.
   * @returns Una Promesa que resuelve con un ILocalidad.
   * @throws Un error si la solicitud falla o la localidad no se encuentra.
   */
  getById: async (id: number | string): Promise<ILocalidad> => {
    const url = `${LOCALITY_ENDPOINT}/${id}`;
    // Este endpoint probablemente es público
    return http.get<ILocalidad>(url);
  },

  /**
   * Obtiene todas las localidades asociadas a una provincia.
   * Coincide con el endpoint GET /localidades/provincia/{idProvincia} en LocalidadController.
   * @param idProvincia El ID de la provincia.
   * @returns Una Promesa que resuelve con un array de ILocalidad.
   * @throws Un error si la solicitud falla.
   */
  getAllByProvinciaId: async (idProvincia: number | string): Promise<ILocalidad[]> => {
       const url = `${LOCALITY_ENDPOINT}/provincia/${idProvincia}`;
       // Este endpoint probablemente es público
       try {
          const response = await http.get<ILocalidad[]>(url);
           // Tu backend devuelve una lista vacía [] si no encuentra localidades para la provincia o si la provincia no existe.
           // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
           if (response === null) { // Si el backend devuelve 200 con cuerpo null
               return [];
           }
           return response;
      } catch (error) {
           // Tu backend puede devolver 404 en caso de error.
           if (error instanceof Error && error.message.includes('Status: 404')) {
              return []; // Retorna un array vacío si no se encuentran localidades para la provincia
          }
          console.error(`Error fetching localities by provincia ID ${idProvincia}:`, error);
          throw error; // Relanza otros errores
      }
   },

  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por LocalidadController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea una nueva localidad.
   * Coincide con el endpoint POST /localidades (heredado de BaseController).
   * @param localityData Los datos de la localidad a crear.
   * @returns Una Promesa que resuelve con la localidad creada.
   * @throws Un error si la solicitud falla.
   */
  create: async (localityData: Partial<ILocalidad>): Promise<ILocalidad> => {
      const url = LOCALITY_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<ILocalidad>(url, localityData);
  },

  /**
   * Actualiza una localidad existente.
   * Coincide con el endpoint PUT /localidades (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param localityData Los datos de la localidad a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la localidad actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (localityData: ILocalidad): Promise<ILocalidad> => { // Esperamos el objeto completo con ID
      const url = LOCALITY_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<ILocalidad>(url, localityData);
  },

  /**
   * Elimina una localidad por su ID.
   * Coincide con el endpoint DELETE /localidades/{id} (heredado de BaseController).
   * @param id El ID de la localidad a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${LOCALITY_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

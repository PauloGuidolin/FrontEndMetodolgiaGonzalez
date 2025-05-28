import { ProvinciaDTO } from '../components/dto/location';
import { http } from './httpService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

const PROVINCE_ENDPOINT = `${API_BASE_URL}/provincias`;

/**
 * Servicio API para interactuar con los recursos de Provincia.
 * Se ha ajustado para coincidir con los endpoints expuestos por el BaseController en el backend,
 * utilizando ProvinciaDTO como tipo de datos.
 */
export const provinceService = {

  /**
   * Obtiene todas las provincias activas.
   * Coincide con el endpoint GET /provincias del BaseController.
   * @returns Una Promesa que resuelve con un array de ProvinciaDTO.
   */
  getAll: async (): Promise<ProvinciaDTO[]> => {
    const url = PROVINCE_ENDPOINT;
    try {
      const response = await http.get<ProvinciaDTO[]>(url);
      if (response === null) { // Handling potential null response from http.get
        return [];
      }
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Status: 404')) {
        // If a 404 means no provinces found, return empty array.
        // Otherwise, you might want to re-throw or handle differently.
        return [];
      }
      console.error(`Error fetching provinces:`, error);
      throw error;
    }
  },

  /**
   * Obtiene una provincia activa por su ID.
   * Coincide con el endpoint GET /provincias/{id} del BaseController.
   * @param id El ID de la provincia.
   * @returns Una Promesa que resuelve con un ProvinciaDTO.
   */
  getById: async (id: number | string): Promise<ProvinciaDTO> => {
    const url = `${PROVINCE_ENDPOINT}/${id}`;
    // It's good practice to handle potential null/undefined from http.get here too
    // if your httpService can return null for a 404 or 204.
    const response = await http.get<ProvinciaDTO>(url);
    if (response === null) {
      throw new Error(`Provincia con ID ${id} no encontrada.`); // Or handle as per your app's logic
    }
    return response;
  },

  /**
   * Crea una nueva provincia.
   * Coincide con el endpoint POST /provincias del BaseController.
   * @param provinceData Los datos de la provincia a crear (Partial<ProvinciaDTO>).
   * @returns Una Promesa que resuelve con la provincia creada (ProvinciaDTO).
   */
  create: async (provinceData: Partial<ProvinciaDTO>): Promise<ProvinciaDTO> => {
    const url = PROVINCE_ENDPOINT;
    return http.post<ProvinciaDTO>(url, provinceData);
  },

  /**
   * Actualiza una provincia existente.
   * Coincide con el endpoint PUT /provincias/{id} del BaseController.
   * @param id El ID de la provincia a actualizar (en la URL).
   * @param provinceData Los datos de la provincia a actualizar (en el cuerpo, ProvinciaDTO).
   * @returns Una Promesa que resuelve con la provincia actualizada (ProvinciaDTO).
   */
  update: async (id: number | string, provinceData: ProvinciaDTO): Promise<ProvinciaDTO> => {
    const url = `${PROVINCE_ENDPOINT}/${id}`;
    // Ensure the ID is passed as a path variable, and provinceData as the body
    return http.put<ProvinciaDTO>(url, provinceData);
  },

  /**
   * Realiza una eliminación lógica (soft delete) de una provincia por su ID.
   * Coincide con el endpoint DELETE /provincias/{id} del BaseController.
   * @param id El ID de la provincia a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   */
  delete: async (id: number | string): Promise<void> => {
    const url = `${PROVINCE_ENDPOINT}/${id}`;
    return http.delete<void>(url);
  },

  /**
   * Activa una provincia por su ID.
   * Coincide con el endpoint PUT /provincias/activar/{id} del BaseController.
   * @param id El ID de la provincia a activar.
   * @returns Una Promesa que resuelve con la provincia activada (ProvinciaDTO).
   */
  activate: async (id: number | string): Promise<ProvinciaDTO> => {
    const url = `${PROVINCE_ENDPOINT}/activar/${id}`;
    // PUT usually requires a body, even if empty. {} or null is fine.
    return http.put<ProvinciaDTO>(url, {});
  },
};
// src/https/locationApi.ts
import axios from 'axios'; // Para provincias, si no usan BaseController
import { http } from './httpService'; // Para localidades, ya que su controlador extiende BaseController
import { LocalidadDTO, ProvinciaDTO } from '../components/dto/location'; // Asegúrate de que esta ruta es correcta

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Verificamos si la URL base está configurada
if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn("La variable de entorno VITE_API_BASE_URL no está definida. Se usará el valor por defecto: http://localhost:8080");
}

// Definimos los endpoints base
const PROVINCIAS_ENDPOINT = `${API_BASE_URL}/provincias`;
const LOCALIDADES_ENDPOINT = `${API_BASE_URL}/localidades`; // Este endpoint ahora manejará CRUD por BaseController

/**
 * Servicio API para interactuar con los recursos de Ubicación (Provincias y Localidades).
 */
export const locationService = {

    /**
     * Obtiene todas las provincias del backend.
     * @returns Una Promesa que resuelve con un array de ProvinciaDTO.
     */
    getAllProvincias: async (): Promise<ProvinciaDTO[]> => {
        const response = await axios.get<ProvinciaDTO[]>(PROVINCIAS_ENDPOINT);
        return response.data;
    },

    /**
     * Obtiene todas las localidades del backend.
     * Coincide con el endpoint GET /localidades (heredado de BaseController).
     * @returns Una Promesa que resuelve con un array de LocalidadDTO.
     */
    getAllLocalidades: async (): Promise<LocalidadDTO[]> => {
        // Usamos http.get ya que LocalidadController extiende BaseController
        return http.get<LocalidadDTO[]>(LOCALIDADES_ENDPOINT);
    },

    /**
     * Obtiene una localidad por su ID.
     * Coincide con el endpoint GET /localidades/{id} (heredado de BaseController).
     * @param id El ID de la localidad.
     * @returns Una Promesa que resuelve con un LocalidadDTO.
     */
    getLocalidadById: async (id: number | string): Promise<LocalidadDTO> => {
        const url = `${LOCALIDADES_ENDPOINT}/${id}`;
        return http.get<LocalidadDTO>(url);
    },

    /**
     * Obtiene las localidades de una provincia específica por su ID.
     * Coincide con el endpoint GET /localidades/por-provincia/{provinciaId} (método específico).
     * @param provinciaId El ID de la provincia.
     * @returns Una Promesa que resuelve con un array de LocalidadDTO.
     */
    getLocalidadesByProvinciaId: async (provinciaId: number): Promise<LocalidadDTO[]> => {
        const url = `${LOCALIDADES_ENDPOINT}/por-provincia/${provinciaId}`;
        // Este es un endpoint específico, no parte de BaseController directamente,
        // pero dado que es una ruta de localidades, se puede seguir usando http.get
        return http.get<LocalidadDTO[]>(url);
    },

    /**
     * Crea una nueva localidad.
     * Coincide con el endpoint POST /localidades (heredado de BaseController).
     * @param localidadData Los datos de la localidad a crear.
     * @returns Una Promesa que resuelve con la localidad creada.
     */
    createLocalidad: async (localidadData: Partial<LocalidadDTO>): Promise<LocalidadDTO> => {
        const url = LOCALIDADES_ENDPOINT;
        return http.post<LocalidadDTO>(url, localidadData);
    },

    /**
     * Actualiza una localidad existente.
     * Coincide con el endpoint PUT /localidades (heredado de BaseController).
     * @param localidadData Los datos de la localidad a actualizar (debe incluir el ID).
     * @returns Una Promesa que resuelve con la localidad actualizada.
     */
    updateLocalidad: async (localidadData: LocalidadDTO): Promise<LocalidadDTO> => {
        const url = LOCALIDADES_ENDPOINT; // El ID va en el body gracias al BaseController
        return http.put<LocalidadDTO>(url, localidadData);
    },

    /**
     * Elimina una localidad por su ID.
     * Coincide con el endpoint DELETE /localidades/{id} (heredado de BaseController).
     * @param id El ID de la localidad a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    deleteLocalidad: async (id: number | string): Promise<void> => {
        const url = `${LOCALIDADES_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },
};
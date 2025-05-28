// src/services/userService.ts (Anteriormente clientService.ts - ¡Renombrado!)
import { DomicilioDTO } from '../components/dto/DomicilioDTO';
import { UserDTO } from '../components/dto/UserDTO';
import { http } from './httpService'; // Importamos el servicio HTTP base


// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

// Definimos el endpoint específico para USUARIOS
// Coincide con @RequestMapping("/usuarios") en UsuarioController de tu backend
const USER_ENDPOINT = `${API_BASE_URL}/usuarios`;

/**
 * Servicio API para interactuar con los recursos de Usuario.
 * Estos endpoints probablemente requieren autenticación (ej. para ver/editar el perfil de un usuario).
 */
export const userService = { // ¡Nombre del servicio cambiado!

    /**
     * Obtiene todos los usuarios. Requiere ADMIN.
     * Coincide con el endpoint GET /usuarios (heredado de BaseController).
     * @returns Una Promesa que resuelve con un array de UserDTO.
     */
    getAll: async (): Promise<UserDTO[]> => {
        const url = USER_ENDPOINT;
        return http.get<UserDTO[]>(url);
    },

    /**
     * Obtiene un usuario por su ID.
     * Coincide con el endpoint GET /usuarios/{id} (heredado de BaseController).
     * @param id El ID del usuario.
     * @returns Una Promesa que resuelve con un UserDTO.
     */
    getById: async (id: number | string): Promise<UserDTO> => {
        const url = `${USER_ENDPOINT}/${id}`;
        return http.get<UserDTO>(url);
    },

    /**
     * Obtiene un usuario por su nombre de usuario (email).
     * Coincide con el endpoint GET /usuarios/by-username/{username} en UsuarioController.
     * @param username El nombre de usuario (email) del usuario.
     * @returns Una Promesa que resuelve con un UserDTO o null si no se encuentra.
     */
    getByUsername: async (username: string): Promise<UserDTO | null> => {
        const url = `${USER_ENDPOINT}/by-username/${username}`;
        try {
            const response = await http.get<UserDTO>(url);
            return response;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Status: 404')) {
                return null; // Retorna null si el backend devuelve 404
            }
            console.error(`Error fetching user by username ${username}:`, error);
            throw error;
        }
    },

    // Métodos para gestionar direcciones de un usuario (reflejando UsuarioController)

    /**
     * Obtiene todas las direcciones asociadas a un usuario.
     * Coincide con GET /usuarios/{userId}/direcciones en UsuarioController.
     * @param userId El ID del usuario.
     * @returns Una Promesa que resuelve con un array de DomicilioDTO.
     */
    getAddressesByUserId: async (userId: number | string): Promise<DomicilioDTO[]> => {
        const url = `${USER_ENDPOINT}/${userId}/direcciones`;
        try {
            const response = await http.get<DomicilioDTO[]>(url);
            return response;
        } catch (error) {
            // Maneja el error de 400 (Bad Request) que tu backend podría devolver
            if (error instanceof Error && error.message.includes('Status: 400')) {
                return []; // Si el backend devuelve 400 o un error al buscar, devuelve array vacío
            }
            console.error(`Error fetching addresses for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Añade una nueva dirección a un usuario.
     * Coincide con POST /usuarios/{userId}/direcciones en UsuarioController.
     * @param userId El ID del usuario.
     * @param domicilioData Los datos de la nueva dirección.
     * @returns Una Promesa que resuelve con la DomicilioDTO creada.
     */
    addAddressToUser: async (userId: number | string, domicilioData: Partial<DomicilioDTO>): Promise<DomicilioDTO> => {
        const url = `${USER_ENDPOINT}/${userId}/direcciones`;
        const newAddress = await http.post<DomicilioDTO>(url, domicilioData);
        return newAddress;
    },

    /**
     * Actualiza una dirección existente para un usuario.
     * Coincide con PUT /usuarios/{userId}/direcciones/{direccionId} en UsuarioController.
     * @param userId El ID del usuario.
     * @param direccionId El ID de la dirección a actualizar.
     * @param updatedDomicilioData Los datos actualizados de la dirección.
     * @returns Una Promesa que resuelve con la DomicilioDTO actualizada.
     */
    updateAddressForUser: async (userId: number | string, direccionId: number | string, updatedDomicilioData: DomicilioDTO): Promise<DomicilioDTO> => {
        const url = `${USER_ENDPOINT}/${userId}/direcciones/${direccionId}`;
        const updatedAddress = await http.put<DomicilioDTO>(url, updatedDomicilioData);
        return updatedAddress;
    },

    /**
     * Elimina una dirección de un usuario.
     * Coincide con DELETE /usuarios/{userId}/direcciones/{direccionId} en UsuarioController.
     * @param userId El ID del usuario.
     * @param direccionId El ID de la dirección a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    removeAddressFromUser: async (userId: number | string, direccionId: number | string): Promise<void> => {
        const url = `${USER_ENDPOINT}/${userId}/direcciones/${direccionId}`;
        await http.delete<void>(url);
    },

    // --- Métodos CRUD estándar (heredados de BaseController y expuestos por UsuarioController) ---

    /**
     * Crea un nuevo usuario.
     * Coincide con el endpoint POST /usuarios (heredado de BaseController).
     * @param userData Los datos del usuario a crear.
     * @returns Una Promesa que resuelve con el usuario creado (UserDTO).
     */
    create: async (userData: Partial<UserDTO>): Promise<UserDTO> => {
        const url = USER_ENDPOINT;
        return http.post<UserDTO>(url, userData);
    },

    /**
     * Actualiza un usuario existente.
     * Coincide con el endpoint PUT /usuarios (heredado de BaseController).
     * @param userData Los datos del usuario a actualizar (debe incluir el ID).
     * @returns Una Promesa que resuelve con el usuario actualizado (UserDTO).
     */
    update: async (userData: UserDTO): Promise<UserDTO> => {
        const url = USER_ENDPOINT;
        return http.put<UserDTO>(url, userData);
    },

    /**
     * Elimina un usuario por su ID.
     * Coincide con el endpoint DELETE /usuarios/{id}.
     * @param id El ID del usuario a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    delete: async (id: number | string): Promise<void> => {
        const url = `${USER_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },
};
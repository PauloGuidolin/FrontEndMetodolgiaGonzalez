import { AdminUserUpdateDTO } from "../components/dto/AdminUserUpdateDTO";
import { UserDTO } from "../components/dto/UserDTO";
import { http } from "./httpService";


const BASE_URL = '/api/v1/admin/usuarios'; // La ruta base de tu AdminUsuarioController

export const adminUserService = {

    /**
     * Obtiene todos los usuarios (activos e inactivos).
     * @returns {Promise<UserDTO[]>} Una promesa que resuelve con la lista de usuarios.
     */
    getAllUsers: async (): Promise<UserDTO[]> => {
        try {
            const response = await http.get<UserDTO[]>(BASE_URL);
            return response;
        } catch (error) {
            console.error('Error al obtener todos los usuarios (admin):', error);
            throw error;
        }
    },

    /**
     * Obtiene los detalles de un usuario específico por su ID.
     * @param {number} userId El ID del usuario.
     * @returns {Promise<UserDTO>} Una promesa que resuelve con los detalles del usuario.
     */
    getUserById: async (userId: number): Promise<UserDTO> => {
        try {
            const response = await http.get<UserDTO>(`${BASE_URL}/${userId}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener usuario por ID ${userId} (admin):`, error);
            throw error;
        }
    },

    /**
     * Actualiza el estado de activación y/o el rol de un usuario.
     * @param {number} userId El ID del usuario a actualizar.
     * @param {AdminUserUpdateDTO} updateData Los datos a actualizar (activo, rol).
     * @returns {Promise<UserDTO>} Una promesa que resuelve con el usuario actualizado.
     */
    updateUserStatusAndRole: async (userId: number, updateData: AdminUserUpdateDTO): Promise<UserDTO> => {
        try {
            const response = await http.put<UserDTO>(`${BASE_URL}/${userId}/update-status-role`, updateData);
            return response;
        } catch (error) {
            console.error(`Error al actualizar estado/rol del usuario ${userId} (admin):`, error);
            throw error;
        }
    },

    /**
     * Desactiva lógicamente la cuenta de un usuario.
     * @param {number} userId El ID del usuario a desactivar.
     * @returns {Promise<void>} Una promesa que resuelve cuando la operación es exitosa.
     */
    deactivateUser: async (userId: number): Promise<void> => {
        try {
            await http.put(`${BASE_URL}/${userId}/deactivate`);
            console.log(`Usuario ${userId} desactivado exitosamente.`);
        } catch (error) {
            console.error(`Error al desactivar el usuario ${userId} (admin):`, error);
            throw error;
        }
    },

    /**
     * Activa una cuenta de usuario previamente desactivada.
     * @param {number} userId El ID del usuario a activar.
     * @returns {Promise<UserDTO>} Una promesa que resuelve con el usuario activado.
     */
    activateUser: async (userId: number): Promise<UserDTO> => {
        try {
            const response = await http.put<UserDTO>(`${BASE_URL}/${userId}/activate`);
            console.log(`Usuario ${userId} activado exitosamente.`);
            return response;
        } catch (error) {
            console.error(`Error al activar el usuario ${userId} (admin):`, error);
            throw error;
        }
    },

    /**
     * Elimina físicamente un usuario de la base de datos. ¡Usar con extrema precaución!
     * @param {number} userId El ID del usuario a eliminar.
     * @returns {Promise<void>} Una promesa que resuelve cuando la operación es exitosa.
     */
    hardDeleteUser: async (userId: number): Promise<void> => {
        try {
            await http.delete(`${BASE_URL}/hard-delete/${userId}`);
            console.warn(`Usuario ${userId} eliminado físicamente.`);
        } catch (error) {
            console.error(`Error al eliminar físicamente el usuario ${userId} (admin):`, error);
            throw error;
        }
    },
};
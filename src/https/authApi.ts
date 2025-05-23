// src/https/authApi.ts
import axios from 'axios';
import { AuthResponseFrontend, LoginRequestFrontend, RegisterRequestFrontend } from '../types/auth';
import { UserDTO } from '../components/dto/UserDTO';
import { UserProfileUpdateDTO } from '../components/dto/UserProfileUpdateDTO';
import { UpdateCredentialsRequest } from '../components/dto/UpdateCredentialsRequest';


// Usa la variable de entorno para la base de tu API
// Y concatena la ruta del controlador de autenticación '/auth'
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AUTH_API_URL = `${BASE_API_URL}/auth`; // <--- ¡Ajuste aquí!

export const authService = {
    login: async (credentials: LoginRequestFrontend): Promise<AuthResponseFrontend> => {
        const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
        return response.data; // Ya está tipado por AuthResponse
    },

    register: async (userData: RegisterRequestFrontend): Promise<AuthResponseFrontend> => {
        const response = await axios.post(`${AUTH_API_URL}/register`, userData);
        return response.data; // Ya está tipado por AuthResponse
    },

    logout: () => {
        console.log("Client-side logout initiated.");
    },

    // --- MÉTODOS PARA EL PERFIL ---

    // Obtener los datos del usuario autenticado
    getCurrentUser: async (token: string): Promise<UserDTO> => {
        // Asumiendo que el endpoint para obtener el usuario actual es /api/v1/auth/me
        const response = await axios.get(`${AUTH_API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Ahora tipado como UserDTO
    },

    // Actualizar los datos del usuario (texto/números)
    // El backend UsuarioService tiene updateProfile() que recibe UserProfileUpdateDTO y devuelve UserDTO
    updateUser: async (token: string, userData: UserProfileUpdateDTO): Promise<UserDTO> => {
        // Asumiendo que el endpoint para actualizar el perfil es /api/v1/auth/profile
        const response = await axios.put(`${AUTH_API_URL}/profile`, userData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Ahora tipado como UserDTO
    },

    // Subir y actualizar la imagen de perfil
    uploadProfileImage: async (token: string, imageFile: File): Promise<UserDTO> => {
        const formData = new FormData();
        formData.append('file', imageFile);

        // Asumiendo que el endpoint para subir la imagen es /api/v1/auth/profile/upload-image
        const response = await axios.post(`${AUTH_API_URL}/profile/upload-image`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Ahora tipado como UserDTO
    },

    // ¡NUEVO MÉTODO: Para actualizar credenciales!
    updateUserCredentials: async (token: string, data: UpdateCredentialsRequest): Promise<UserDTO> => {
        // Asume que el endpoint para actualizar credenciales es /api/v1/auth/update-credentials o similar
        // AJUSTA ESTE ENDPOINT SEGÚN TU BACKEND (ej. /auth/change-password, /auth/update-email-password)
        const response = await axios.patch(`${AUTH_API_URL}/update-credentials`, data, { // Usamos PATCH para actualizaciones parciales
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Retorna el UserDTO actualizado
    },

    // *** NUEVO MÉTODO: Para desactivar la cuenta ***
    deactivateAccount: async (token: string): Promise<void> => {
        // Asumiendo que el endpoint para desactivar la cuenta es /auth/deactivate
        // y que el backend identifica al usuario por el token JWT
        const response = await axios.delete(`${AUTH_API_URL}/deactivate`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Si el backend devuelve un 200 OK sin cuerpo, response.data estará vacío, lo cual es esperado.
        return response.data;
    },
};
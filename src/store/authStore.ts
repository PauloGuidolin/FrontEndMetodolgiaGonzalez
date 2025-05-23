// src/store/authStore.ts

import { create } from 'zustand';
// Actualiza las importaciones para usar los DTOs correctos
import { UserDTO } from '../components/dto/UserDTO'; // Importa el DTO para el objeto de usuario
import { LoginRequestFrontend, RegisterRequestFrontend } from '../types/auth';
import { UserProfileUpdateDTO } from '../components/dto/UserProfileUpdateDTO';


import { authService } from '../https/authApi';
import { toast } from 'react-toastify';
import { UpdateCredentialsRequest } from '../components/dto/UpdateCredentialsRequest';

// Definimos la interfaz para el estado de nuestro store de autenticación
interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: UserDTO | null; // El tipo de usuario ahora es UserDTO

    loadingLogin: boolean;
    errorLogin: string | null;

    loadingRegister: boolean;
    errorRegister: string | null;

    loadingUser: boolean;
    errorUser: string | null;

    login: (credentials: LoginRequestFrontend) => Promise<void>;
    register: (userData: RegisterRequestFrontend) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
    fetchUser: () => Promise<void>;
    updateUser: (userData: UserProfileUpdateDTO) => Promise<void>; // Usa UserProfileUpdateDTO
    updateUserImage: (imageFile: File) => Promise<void>;
    // ¡NUEVA ACCIÓN: Declaración en la interfaz!
    updateUserCredentials: (credentials: UpdateCredentialsRequest) => Promise<void>;
}

// Creamos el store usando la función create de Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    token: localStorage.getItem('jwt_token') || null,
    user: null, // Inicialmente null, se cargará con fetchUser o con el login/register

    loadingLogin: false,
    errorLogin: null,

    loadingRegister: false,
    errorRegister: null,

    loadingUser: false,
    errorUser: null,

    login: async (credentials: LoginRequestFrontend) => { // Usa LoginRequest
        set({ loadingLogin: true, errorLogin: null });
        try {
            const response = await authService.login(credentials); // response ahora es AuthResponse
            if (response?.token) {
                localStorage.setItem('jwt_token', response.token);
                set({
                    isAuthenticated: true,
                    token: response.token,
                    user: response.user || null, // Guarda el objeto user que viene en la respuesta de login
                    loadingLogin: false,
                    errorLogin: null,
                });
                console.log("Login successful, token and user stored.");
            } else {
                set({
                    isAuthenticated: false,
                    token: null,
                    user: null, // Asegura que el user sea null si no hay token
                    loadingLogin: false,
                    errorLogin: "Login failed: No token received from server.",
                });
                console.error("Login failed: No token received from backend.");
                throw new Error("No token received from backend.");
            }
        } catch (error: any) {
            console.error("Error during login:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al iniciar sesión.";
            set({
                isAuthenticated: false,
                token: null,
                user: null, // Asegura que el user sea null en caso de error
                loadingLogin: false,
                errorLogin: errorMessage,
            });
            throw error;
        }
    },

    register: async (userData: RegisterRequestFrontend) => { // Usa RegisterRequest
        set({ loadingRegister: true, errorRegister: null });
        try {
            const response = await authService.register(userData); // response ahora es AuthResponse
            if (response?.token) { // Asumo que el registro devuelve un token y un usuario directamente para login
                localStorage.setItem('jwt_token', response.token);
                set({
                    isAuthenticated: true,
                    token: response.token,
                    user: response.user || null, // Guarda el objeto user que viene en la respuesta de registro
                    loadingRegister: false,
                    errorRegister: null,
                });
                console.log("Registration successful and logged in.");
            } else {
                set({
                    loadingRegister: false,
                    errorRegister: null,
                });
                console.log("Registration successful. User might need to log in.");
            }
        } catch (error: any) {
            console.error("Error during registration:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al registrar.";
            set({
                loadingRegister: false,
                errorRegister: errorMessage,
            });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        localStorage.removeItem('jwt_token');
        set({
            isAuthenticated: false,
            token: null,
            user: null, // Limpiar el objeto de usuario al cerrar sesión
            loadingLogin: false,
            errorLogin: null,
            loadingRegister: false,
            errorRegister: null,
            loadingUser: false,
            errorUser: null,
        });
        console.log("Logout successful, state updated.");
    },

    checkAuth: async () => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            set({
                isAuthenticated: true,
                token: token,
            });
            console.log("Token found in localStorage, setting isAuthenticated to true.");
            await get().fetchUser(); // Intenta cargar el usuario cuando el token existe
        } else {
            set({
                isAuthenticated: false,
                token: null,
                user: null, // Asegurarse de que el usuario sea null si no hay token
            });
            console.log("No token found or token expired/invalid, setting isAuthenticated to false.");
        }
    },

    fetchUser: async () => {
        set({ loadingUser: true, errorUser: null });
        const token = get().token;
        if (!token) {
            set({ loadingUser: false, errorUser: 'No hay token de autenticación para cargar el usuario.' });
            get().logout(); // Asegurar logout si no hay token pero se intenta cargar usuario
            return;
        }
        try {
            const user = await authService.getCurrentUser(token); // user es ahora UserDTO
            set({ user, loadingUser: false, errorUser: null });
            console.log("User data fetched successfully:", user);
        } catch (error: any) {
            console.error("Error fetching user data:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al cargar los datos del usuario.";
            set({ errorUser: errorMessage, loadingUser: false });
            if (error.response?.status === 401 || error.response?.status === 403) {
                get().logout();
            }
            throw error;
        }
    },

    updateUser: async (userData: UserProfileUpdateDTO) => { // Usa UserProfileUpdateDTO
        set({ loadingUser: true, errorUser: null });
        const token = get().token;
        if (!token) {
            set({ loadingUser: false, errorUser: 'No hay token de autenticación para actualizar el usuario.' });
            throw new Error('No hay token de autenticación.');
        }
        try {
            const updatedUser = await authService.updateUser(token, userData); // updatedUser es ahora UserDTO
            set({ user: updatedUser, loadingUser: false, errorUser: null });
            console.log("User data updated successfully:", updatedUser);
        } catch (error: any) {
            console.error("Error updating user data:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al actualizar los datos del usuario.";
            set({ errorUser: errorMessage, loadingUser: false });
            throw error;
        }
    },

    updateUserImage: async (imageFile: File) => {
        set({ loadingUser: true, errorUser: null });
        const token = get().token;
        if (!token) {
            set({ loadingUser: false, errorUser: 'No hay token de autenticación para actualizar la imagen.' });
            throw new Error('No hay token de autenticación.');
        }
        try {
            const updatedUserWithImage = await authService.uploadProfileImage(token, imageFile); // updatedUserWithImage es ahora UserDTO
            set({ user: updatedUserWithImage, loadingUser: false, errorUser: null });
            console.log("Profile image updated successfully:", updatedUserWithImage);
        } catch (error: any) {
            console.error("Error updating profile image:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al actualizar la imagen de perfil.";
            set({ errorUser: errorMessage, loadingUser: false });
            throw error;
        }
    },

    // ¡NUEVA ACCIÓN: Implementación!
    updateUserCredentials: async (credentials: UpdateCredentialsRequest) => {
        set({ loadingUser: true, errorUser: null });
        const token = get().token;
        if (!token) {
            set({ loadingUser: false, errorUser: 'No hay token de autenticación para actualizar credenciales.' });
            throw new Error('No hay token de autenticación.');
        }
        try {
            // Llama al nuevo método en authService
            const updatedUser = await authService.updateUserCredentials(token, credentials);
            set({ user: updatedUser, loadingUser: false, errorUser: null });
            toast.success("Credenciales actualizadas exitosamente."); // Feedback aquí o en el modal
        } catch (error: any) {
            console.error("Error updating user credentials:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al actualizar credenciales.";
            set({ errorUser: errorMessage, loadingUser: false });
            toast.error(errorMessage); // Feedback aquí o en el modal
            throw error; // Re-lanza el error para que el modal pueda manejarlo
        }
    },
}));
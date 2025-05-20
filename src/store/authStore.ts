// src/store/authStore.ts

import { create } from 'zustand';
// ¡¡IMPORTANTE!! Asegúrate de que esta línea esté correcta y sea la ÚNICA importación de estos tipos.
import {LoginRequestFrontend, RegisterRequestFrontend, AuthResponseFrontend } from '../types/auth';



import { authService } from '../https/authApi';
import { IUsuario } from '../types/IUsuario';

// Definimos la interfaz para el estado de nuestro store de autenticación
interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: IUsuario | null;

    loadingLogin: boolean;
    errorLogin: string | null;

    loadingRegister: boolean;
    errorRegister: string | null;

    // Las acciones ahora deben recibir el DTO tipado desde el archivo central 'types/auth'
    login: (credentials: LoginRequestFrontend) => Promise<void>;
    register: (userData: RegisterRequestFrontend) => Promise<void>; // <-- Asegúrate de que esto usa el tipo correcto
    logout: () => void;
    checkAuth: () => void;
}

// Creamos el store usando la función create de Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
    // ... (resto del estado inicial y acciones, que ya deberían estar correctas)
    isAuthenticated: false,
    token: localStorage.getItem('jwt_token') || null,
    user: null,

    loadingLogin: false,
    errorLogin: null,

    loadingRegister: false,
    errorRegister: null,

    login: async (credentials: LoginRequestFrontend) => {
        set({ loadingLogin: true, errorLogin: null });
        try {
            const response = await authService.login(credentials);
            if (response?.token) {
                localStorage.setItem('jwt_token', response.token);
                set({
                    isAuthenticated: true,
                    token: response.token,
                    loadingLogin: false,
                    errorLogin: null,
                });
                console.log("Login successful, state updated.");
            } else {
                set({
                    isAuthenticated: false,
                    token: null,
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
                loadingLogin: false,
                errorLogin: errorMessage,
            });
            throw error;
        }
    },

    register: async (userData: RegisterRequestFrontend) => { // <-- ¡Aquí es donde debe usar el tipo correcto!
        set({ loadingRegister: true, errorRegister: null });
        try {
            const response = await authService.register(userData);
            if (response?.token) {
                localStorage.setItem('jwt_token', response.token);
                set({
                    isAuthenticated: true,
                    token: response.token,
                    loadingRegister: false,
                    errorRegister: null,
                });
                console.log("Registration successful and logged in.");
            } else {
                set({
                    loadingRegister: false,
                    errorRegister: null,
                });
                console.log("Registration successful, but no token returned (user might need to log in).");
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
        set({
            isAuthenticated: false,
            token: null,
            user: null,
            loadingLogin: false,
            errorLogin: null,
            loadingRegister: false,
            errorRegister: null,
        });
        console.log("Logout successful, state updated.");
    },

    checkAuth: () => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            set({
                isAuthenticated: true,
                token: token,
            });
            console.log("Token found in localStorage, setting isAuthenticated to true.");
        } else {
            set({
                isAuthenticated: false,
                token: null,
                user: null,
            });
            console.log("No token found or token expired/invalid, setting isAuthenticated to false.");
        }
    },
}));
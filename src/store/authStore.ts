// src/store/authStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-toastify";

import { UserDTO } from "../components/dto/UserDTO";
import { UserProfileUpdateDTO } from "../components/dto/UserProfileUpdateDTO";
import {
    LoginRequestFrontend,
    RegisterRequestFrontend,
    AuthResponseFrontend,
} from "../types/auth"; // Asumo src/types/auth.ts

import { authService } from "../https/authApi";
import { UpdateCredentialsRequest } from "../components/dto/UpdateCredentialsRequest";

// Definimos la interfaz para el estado de nuestro store de autenticación
interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: UserDTO | null; // El tipo de usuario ahora es UserDTO, ¡perfecto!

    loadingLogin: boolean;
    errorLogin: string | null;

    loadingRegister: boolean;
    errorRegister: string | null;

    loadingUser: boolean; // Para cualquier operación relacionada con el usuario (fetch, update)
    errorUser: string | null;

    // Acciones
    login: (credentials: LoginRequestFrontend) => Promise<void>;
    register: (userData: RegisterRequestFrontend) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
    fetchUser: () => Promise<void>;
    updateUser: (userData: UserProfileUpdateDTO) => Promise<void>; // Usa UserProfileUpdateDTO
    updateUserImage: (imageFile: File) => Promise<void>;
    updateUserCredentials: (credentials: UpdateCredentialsRequest) => Promise<void>;
    deactivateAccount: () => Promise<void>;
}

// Creamos el store usando la función create de Zustand y el middleware persist
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // --- Estado inicial ---
            isAuthenticated: false,
            token: null,
            user: null,

            loadingLogin: false,
            errorLogin: null,

            loadingRegister: false,
            errorRegister: null,

            loadingUser: false,
            errorUser: null,

            // --- Acciones del Store ---

            /**
             * Intenta iniciar sesión con las credenciales proporcionadas.
             * Almacena el token y el usuario en el estado y en el almacenamiento persistente si es exitoso.
             */
            login: async (credentials: LoginRequestFrontend) => {
                set({ loadingLogin: true, errorLogin: null });
                try {
                    // Usamos AuthResponseFrontend
                    const response: AuthResponseFrontend = await authService.login(credentials);

                    if (response?.token) {
                        set({
                            isAuthenticated: true,
                            token: response.token,
                            user: response.user || null, // response.user ya es UserDTO
                            loadingLogin: false,
                            errorLogin: null,
                        });
                        console.log("Login successful, token and user stored.");
                        toast.success("¡Bienvenido de nuevo!");
                    } else {
                        set({
                            isAuthenticated: false,
                            token: null,
                            user: null,
                            loadingLogin: false,
                            errorLogin: "Login failed: No token received from server.",
                        });
                        console.error("Login failed: No token received from backend.");
                        throw new Error("No token received from backend.");
                    }
                } catch (error: any) {
                    console.error("Error during login:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error desconocido al iniciar sesión.";
                    set({
                        isAuthenticated: false,
                        token: null,
                        user: null,
                        loadingLogin: false,
                        errorLogin: errorMessage,
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            /**
             * Intenta registrar un nuevo usuario.
             * Si el registro también retorna un token (auto-login), lo almacena.
             */
            register: async (userData: RegisterRequestFrontend) => {
                set({ loadingRegister: true, errorRegister: null });
                try {
                    // Usamos AuthResponseFrontend
                    const response: AuthResponseFrontend = await authService.register(userData);

                    if (response?.token) {
                        set({
                            isAuthenticated: true,
                            token: response.token,
                            user: response.user || null, // response.user ya es UserDTO
                            loadingRegister: false,
                            errorRegister: null,
                        });
                        console.log("Registration successful and logged in.");
                        toast.success("¡Registro exitoso! ¡Bienvenido!");
                    } else {
                        set({
                            loadingRegister: false,
                            errorRegister: null,
                        });
                        console.log("Registration successful. User might need to log in.");
                        toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
                    }
                } catch (error: any) {
                    console.error("Error during registration:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error desconocido al registrar.";
                    set({
                        loadingRegister: false,
                        errorRegister: errorMessage,
                    });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            /**
             * Cierra la sesión del usuario, limpiando el estado y el almacenamiento persistente.
             */
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
                    loadingUser: false,
                    errorUser: null,
                });
                console.log("Logout successful, state updated.");
                toast.info("Has cerrado sesión.");
            },

            /**
             * Comprueba el estado de autenticación. Es útil para revalidar la sesión
             * o cargar los datos del usuario si el token ya existe pero el objeto `user` no está en el store.
             */
            checkAuth: async () => {
                const token = get().token;
                if (token && !get().user) {
                    console.log("Token found, but user not loaded. Attempting to fetch user data.");
                    await get().fetchUser();
                } else if (!token) {
                    set({ isAuthenticated: false, user: null });
                    console.log("No token in store, ensuring isAuthenticated is false.");
                } else {
                    console.log("User and token already loaded or no token present. No action needed by checkAuth.");
                }
            },

            /**
             * Obtiene los datos completos del usuario autenticado desde el backend.
             */
            fetchUser: async () => {
                set({ loadingUser: true, errorUser: null });
                const token = get().token;
                if (!token) {
                    set({
                        loadingUser: false,
                        errorUser: "No hay token de autenticación para cargar el usuario.",
                    });
                    get().logout();
                    return;
                }
                try {
                    // CORREGIDO: Ya no se pasa el token al servicio
                    const user: UserDTO = await authService.getCurrentUser();
                    set({ user, loadingUser: false, errorUser: null });
                    console.log("User data fetched successfully:", user);
                } catch (error: any) {
                    console.error("Error fetching user data:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error al cargar los datos del usuario.";
                    set({ errorUser: errorMessage, loadingUser: false });
                    toast.error(errorMessage);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        get().logout();
                    }
                    throw error;
                }
            },

            /**
             * Actualiza la información del perfil del usuario.
             */
            updateUser: async (userData: UserProfileUpdateDTO) => {
                set({ loadingUser: true, errorUser: null });
                const token = get().token;
                if (!token) {
                    set({
                        loadingUser: false,
                        errorUser: "No hay token de autenticación para actualizar el usuario.",
                    });
                    toast.error("No hay token de autenticación. Por favor, inicie sesión.");
                    throw new Error("No hay token de autenticación.");
                }
                try {
                    // CORREGIDO: Ya no se pasa el token al servicio
                    const updatedUser: UserDTO = await authService.updateUser(userData);
                    set({ user: updatedUser, loadingUser: false, errorUser: null });
                    console.log("User data updated successfully:", updatedUser);
                    toast.success("Perfil actualizado exitosamente.");
                } catch (error: any) {
                    console.error("Error updating user data:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error al actualizar los datos del usuario.";
                    set({ errorUser: errorMessage, loadingUser: false });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            /**
             * Actualiza la imagen de perfil del usuario.
             */
            updateUserImage: async (imageFile: File) => {
                set({ loadingUser: true, errorUser: null });
                const token = get().token;
                if (!token) {
                    set({
                        loadingUser: false,
                        errorUser: "No hay token de autenticación para actualizar la imagen.",
                    });
                    toast.error("No hay token de autenticación. Por favor, inicie sesión.");
                    throw new Error("No hay token de autenticación.");
                }
                try {
                    // CORREGIDO: Ya no se pasa el token al servicio
                    const updatedUserWithImage: UserDTO = await authService.uploadProfileImage(imageFile);
                    set({ user: updatedUserWithImage, loadingUser: false, errorUser: null });
                    console.log("Profile image updated successfully:", updatedUserWithImage);
                    toast.success("Imagen de perfil actualizada exitosamente.");
                } catch (error: any) {
                    console.error("Error updating profile image:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error al actualizar la imagen de perfil.";
                    set({ errorUser: errorMessage, loadingUser: false });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            /**
             * Actualiza las credenciales (ej. email, contraseña) del usuario.
             */
            updateUserCredentials: async (credentials: UpdateCredentialsRequest) => {
                set({ loadingUser: true, errorUser: null });
                const token = get().token;
                if (!token) {
                    set({
                        loadingUser: false,
                        errorUser: "No hay token de autenticación para actualizar credenciales.",
                    });
                    toast.error("No hay token de autenticación. Por favor, inicie sesión.");
                    throw new Error("No hay token de autenticación.");
                }
                try {
                    // CORREGIDO: Ya no se pasa el token al servicio
                    const updatedUser: UserDTO = await authService.updateUserCredentials(credentials);
                    set({ user: updatedUser, loadingUser: false, errorUser: null });
                    toast.success("Credenciales actualizadas exitosamente.");
                } catch (error: any) {
                    console.error("Error updating user credentials:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error al actualizar credenciales.";
                    set({ errorUser: errorMessage, loadingUser: false });
                    toast.error(errorMessage);
                    throw error;
                }
            },

            /**
             * Desactiva la cuenta del usuario.
             */
            deactivateAccount: async () => {
                set({ loadingUser: true, errorUser: null });
                const token = get().token;
                if (!token) {
                    set({
                        loadingUser: false,
                        errorUser: "No hay token de autenticación para desactivar la cuenta.",
                    });
                    toast.error("No hay token de autenticación. Por favor, inicie sesión.");
                    get().logout();
                    return;
                }

                try {
                    // CORREGIDO: Ya no se pasa el token al servicio
                    await authService.deactivateAccount();
                    toast.success("Tu cuenta ha sido desactivada exitosamente.");
                    get().logout();
                } catch (error: any) {
                    console.error("Error al desactivar la cuenta:", error);
                    const errorMessage =
                        error.response?.data?.message ||
                        error.message ||
                        "Error desconocido al desactivar la cuenta.";
                    set({ errorUser: errorMessage, loadingUser: false });
                    toast.error(errorMessage);
                    throw error;
                }
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state: AuthState) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                user: state.user,
            }),
            onRehydrateStorage: (state: AuthState | undefined) => {
                console.log("Auth store rehydrated:", state);
            },
        }
    )
);
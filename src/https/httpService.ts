import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'; // Importar InternalAxiosRequestConfig

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

// 1. Crear una instancia de Axios
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 2. Interceptor para agregar el token JWT a las solicitudes salientes
// Cambiar el tipo de 'config' a InternalAxiosRequestConfig
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => { // <-- CAMBIO AQUÍ: Usar InternalAxiosRequestConfig
        const token = localStorage.getItem('jwt_token');
        if (token) {
            // Asegurarse de que config.headers sea un objeto antes de asignar
            // Y asignar directamente a config.headers.Authorization
            config.headers.Authorization = `Bearer ${token}`; // <-- CAMBIO AQUÍ: Asignación directa
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor para manejar respuestas y errores globales (ej. 401 Unauthorized)
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            console.error("Error de respuesta de la API:", error.response.status, error.response.data);

            if (error.response.status === 401 || error.response.status === 403) {
                console.warn("Unauthorized/Forbidden: Session expired or invalid token. Attempting logout.");
                localStorage.removeItem('jwt_token');
                // Opcional: Podrías añadir un dispatch a un store de Zustand para notificar la desautenticación
                // y que la UI reaccione globalmente (ej. redirigir a login).
                // Pero el store de autenticación ya maneja esto cuando fetchUser falla.
            }
        } else if (error.request) {
            console.error("Error de red: No se recibió respuesta del servidor.", error.request);
        } else {
            console.error("Error de configuración de solicitud:", error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Exportamos la instancia de Axios configurada (api) y también helpers individuales (http)
 * para mayor comodidad.
 */
export { api };

export const http = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        api.get<T>(url, config).then(response => response.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.post<T>(url, data, config).then(response => response.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.put<T>(url, data, config).then(response => response.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        api.patch<T>(url, data, config).then(response => response.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        api.delete<T>(url, config).then(response => response.data),
};
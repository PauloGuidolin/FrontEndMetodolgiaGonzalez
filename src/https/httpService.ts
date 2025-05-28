import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
    console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

// 1. Crear una instancia de Axios
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // ELIMINAMOS EL ENCABEZADO 'Content-Type' GLOBAL AQUÍ.
    // Axios lo gestionará automáticamente o lo estableceremos en el interceptor.
    // headers: {
    //     'Content-Type': 'application/json', // <--- ¡ESTA LÍNEA SE ELIMINA/COMENTA!
    // },
    withCredentials: true,
});

// 2. Interceptor para agregar el token JWT y manejar Content-Type dinámicamente
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        try {
            // Intenta obtener el estado completo del authStore del localStorage
            const authStorageState = localStorage.getItem('auth-storage');
            if (authStorageState) {
                // Parseamos el JSON para acceder al token
                const parsedState = JSON.parse(authStorageState);
                const token = parsedState.state?.token; // Accedemos al token dentro del objeto 'state'

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (e) {
            console.error("Error al parsear el estado de autenticación del localStorage:", e);
            // Si hay un error al parsear o acceder, el token no se adjuntará,
            // lo cual es el comportamiento deseado para un token inválido.
        }

        // --- ¡LA CLAVE ESTÁ AQUÍ! ---
        // Solo establece Content-Type a 'application/json' si la data NO es FormData.
        // Axios manejará 'multipart/form-data' automáticamente cuando se le pasa un FormData.
        if (config.data && !(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        } else if (!config.data) {
            // Para peticiones sin cuerpo (GET, DELETE), también puedes forzar application/json si es necesario,
            // o simplemente no establecerlo y dejarlo sin Content-Type si no hay cuerpo.
            // Para la mayoría de las APIs REST, json es el valor por defecto si hay un cuerpo,
            // y no se envía Content-Type si no hay cuerpo.
            // Depende de las expectativas de tu backend para GET/DELETE.
            // Si tu backend espera application/json para GET/DELETE, mantenlo.
            // Si no, puedes eliminar la línea `config.headers['Content-Type'] = 'application/json';`
            // para estos casos específicos, o simplemente dejar que Axios no lo añada por defecto.
            config.headers['Content-Type'] = 'application/json';
        }
        // Si `config.data` es una instancia de `FormData`, Axios gestionará el `Content-Type`
        // automáticamente como `multipart/form-data` con el `boundary` correcto.
        // NO LO MANIPULES AQUÍ PARA FormData.

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
                // Si el backend responde con 401/403, limpiamos el localStorage del token
                // Esto asegura que el estado del frontend se sincronice con el backend.
                localStorage.removeItem('auth-storage'); // Limpia la clave correcta
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
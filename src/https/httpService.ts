

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Función para obtener el token JWT almacenado (ej. en localStorage)
// Deberás implementar esta función en tu módulo de autenticación
const getAuthToken = (): string | null => {
  // Ejemplo: leer del localStorage
  // Asegúrate de usar una clave consistente
  return localStorage.getItem('jwt_token');
};

// Creamos una instancia de Axios. Esto es útil para configurar una URL base
// y otros ajustes por defecto para todas las solicitudes que usen esta instancia.
const api: AxiosInstance = axios.create({
  // La URL base se añadirá automáticamente a las URLs relativas en las solicitudes
  // No necesitamos la URL base aquí, ya que cada servicio API específico la añade
  // desde las variables de entorno antes de pasársela a httpService.
  // baseURL: import.meta.env.VITE_API_BASE_URL, // Opcional: podrías poner la URL base aquí
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de Solicitudes ---
// Este interceptor se ejecuta ANTES de que se envíe cada solicitud.
// Es el lugar ideal para añadir headers comunes como el de Authorization.
// Corregimos el tipo del parámetro 'config' a InternalAxiosRequestConfig
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => { // Usamos InternalAxiosRequestConfig
    const token = getAuthToken(); // Intentamos obtener el token JWT
    if (token) {
      // Si hay un token, lo añadimos al header Authorization
      // Aseguramos que config.headers exista (aunque InternalAxiosRequestConfig lo garantiza)
      config.headers['Authorization'] = `Bearer ${token}`; // Acceso directo a headers
    }
    // Puedes añadir otros headers, lógica de logging, etc. aquí
    return config; // Retorna la configuración modificada (que es InternalAxiosRequestConfig)
  },
  (error: AxiosError) => {
    // Maneja errores de solicitud (ej. problemas de red antes de enviar)
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error); // Propaga el error
  }
);

// --- Interceptor de Respuestas ---
// Este interceptor se ejecuta DESPUÉS de recibir una respuesta,
// ya sea exitosa (2xx) o con error (no 2xx).
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Puedes añadir lógica de logging, transformación de respuesta, etc. aquí
    return response; // Retorna la respuesta sin cambios
  },
  (error: AxiosError) => {
    // Maneja errores de respuesta HTTP (ej. 401, 404, 500)
    console.error('Response Interceptor Error:', error.response || error.message);

    // --- Manejo de error 401 Unauthorized ---
    if (error.response?.status === 401) {
      console.error("Unauthorized request. Consider redirecting to login.");
      // Aquí puedes añadir lógica para redirigir al usuario a la página de login
      // o disparar un evento global para que el router lo maneje.
      // Ejemplo simple (ajusta la ruta):
      // window.location.href = '/login';
      // O puedes lanzar un error específico:
      // return Promise.reject(new Error("Unauthorized"));
    }

    // Propaga el error para que pueda ser manejado por la función que llamó al servicio API
    return Promise.reject(error);
  }
);

// Exporta las funciones para los métodos HTTP comunes usando la instancia de Axios
// Ahora estas funciones son más simples ya que los interceptores manejan headers y errores comunes
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get<T>(url, config).then(response => response.data), // Extraemos directamente response.data
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post<T>(url, data, config).then(response => response.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put<T>(url, data, config).then(response => response.data),
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete<T>(url, config).then(response => response.data),
  // Puedes añadir otros métodos como patch si los necesitas
  // patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  //   api.patch<T>(url, data, config).then(response => response.data),
};




import { http } from './httpService'; // Importamos el servicio HTTP base (ahora usa Axios internamente)
import { IUsuario } from '../types/IUsuario'; // Interfaz de Usuario (ver explicación previa)

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // Considera una forma más robusta de manejar esto en un proyecto real
}

// Definimos el endpoint específico para autenticación
// Coincide con @RequestMapping("/auth") en AuthController de tu backend
const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

// Interfaces para los datos de login y registro, y la respuesta esperada
// Coinciden con tus DTOs RegisterRequest y LoginRequest, y AuthResponse en el backend
interface RegisterRequestFrontend {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    sexo?: string; // Sexo enum como string
    // Añade otros campos si tu RegisterRequest DTO en backend los tiene
}

interface LoginRequestFrontend {
    email?: string;
    password?: string;
}

interface AuthResponseFrontend {
    token: string; // El token JWT que devuelve el backend
    // Si tu AuthResponse DTO en backend incluye los datos del usuario, descomenta:
    // user?: IUsuario;
}

/**
 * Servicio API para interactuar con los endpoints de Autenticación.
 * Incluye funciones para registrar, iniciar sesión y cerrar sesión.
 */
export const authService = {

  /**
   * Intenta registrar un nuevo usuario.
   * Coincide con POST /auth/register.
   * @param request Los datos de registro.
   * @returns Una Promesa que resuelve con la respuesta de autenticación (incluyendo el token JWT).
   * @throws Un error si el registro falla.
   */
  register: async (request: RegisterRequestFrontend): Promise<AuthResponseFrontend> => {
    const url = `${AUTH_ENDPOINT}/register`;
    try {
        const response = await http.post<AuthResponseFrontend>(url, request);

        // Si el registro es exitoso y recibimos un token, almacenarlo
        if (response?.token) {
            localStorage.setItem('jwt_token', response.token);
            // Si la respuesta incluye datos del usuario, almacenarlos también
            // localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
  },

  /**
   * Intenta autenticar un usuario existente.
   * Coincide con POST /auth/login.
   * @param request Las credenciales de login.
   * @returns Una Promesa que resuelve con la respuesta de autenticación (incluyendo el token JWT).
   * @throws Un error si la autenticación falla.
   */
  login: async (request: LoginRequestFrontend): Promise<AuthResponseFrontend> => {
    const url = `${AUTH_ENDPOINT}/login`;
    try {
        const response = await http.post<AuthResponseFrontend>(url, request);

        // Si el login es exitoso y recibimos un token, almacenarlo
        if (response?.token) {
            localStorage.setItem('jwt_token', response.token);
            // Si la respuesta incluye datos del usuario, almacenarlos también
            // localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
  },

  /**
   * Elimina el token JWT del almacenamiento local (Cerrar Sesión).
   */
  logout: (): void => {
    localStorage.removeItem('jwt_token');
    // Si almacenaste otros datos del usuario, elimínalos también
    // localStorage.removeItem('user_data');
    console.log("User logged out. Token removed from localStorage.");
  },

  /**
   * Verifica si el usuario está potencialmente autenticado basándose en la presencia del token JWT.
   * Nota: Esto no valida si el token es aún válido en el backend o si ha expirado.
   * Para una validación completa, necesitarías un endpoint en el backend para verificar el token.
   * @returns boolean True si hay un token almacenado, false si no.
   */
  isAuthenticated: (): boolean => {
      const token = localStorage.getItem('jwt_token');
      // Opcional: Añadir lógica para decodificar el token y verificar la fecha de expiración
      // usando una librería como 'jwt-decode'.
      return !!token;
  }
};

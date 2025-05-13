// Archivo: src/store/authStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IUsuario } from '../types/IUsuario'; // Importa la interfaz de Usuario (si tu backend devuelve el usuario en la respuesta de auth)
import { authService } from '../https/authApi';

// Define las interfaces para los datos de solicitud y respuesta de autenticación
// Deben coincidir con las interfaces definidas en authApi.ts
interface LoginRequestFrontend {
    email?: string;
    password?: string;
}

interface RegisterRequestFrontend {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    sexo?: string;
    // Otros campos si tu RegisterRequest DTO en backend los tiene
}

interface AuthResponseFrontend {
    token: string;
    // Si tu AuthResponse DTO en backend incluye los datos del usuario, descomenta:
    // user?: IUsuario;
}


// Definimos la interfaz para el estado de nuestro store de autenticación
interface AuthState {
  // Estado principal de autenticación
  isAuthenticated: boolean; // Indica si el usuario está loggeado
  token: string | null; // Almacena el token JWT

  // Opcional: Almacenar los datos del usuario loggeado
  // user: IUsuario | null;

  // Estados de carga y error para LOGIN
  loadingLogin: boolean;
  errorLogin: string | null;

  // Estados de carga y error para REGISTRO
  loadingRegister: boolean;
  errorRegister: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para iniciar sesión
  login: (credentials: LoginRequestFrontend) => Promise<void>;

  // Acción para registrar un nuevo usuario
  register: (userData: RegisterRequestFrontend) => Promise<void>;

  // Acción para cerrar sesión
  logout: () => void;

  // Acción para inicializar el estado de autenticación (ej. al cargar la app)
  checkAuth: () => void;

  // Puedes añadir otras acciones si son necesarias (ej. refreshToken)
}

// Creamos el store usando la función create de Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  isAuthenticated: false, // Por defecto, el usuario no está autenticado
  token: null, // El token es nulo inicialmente
  // user: null, // Usuario nulo inicialmente

  loadingLogin: false,
  errorLogin: null,

  loadingRegister: false,
  errorRegister: null,


  // Implementación de la acción login
  login: async (credentials: LoginRequestFrontend) => {
    set({ loadingLogin: true, errorLogin: null }); // Iniciamos carga de login

    try {
      const response = await authService.login(credentials);

      // Si el login es exitoso y recibimos un token
      if (response?.token) {
        localStorage.setItem('jwt_token', response.token); // Almacenamos el token
        set({
            isAuthenticated: true,
            token: response.token,
            // user: response.user, // Si tu backend devuelve el usuario
            loadingLogin: false,
            errorLogin: null,
        });
        console.log("Login successful, state updated.");
      } else {
         // Manejo si el backend no devuelve token pero no lanza error (inesperado para JWT)
         set({
             isAuthenticated: false,
             token: null,
             // user: null,
             loadingLogin: false,
             errorLogin: "Login failed: No token received.", // Mensaje de error
         });
         console.error("Login failed: No token received from backend.");
      }

    } catch (error) {
      // Si ocurre un error durante el login (ej. credenciales incorrectas, error de red)
      console.error("Error during login:", error);
      set({
        isAuthenticated: false,
        token: null,
        // user: null,
        loadingLogin: false,
        errorLogin: `Login failed: ${error instanceof Error ? error.message : String(error)}`, // Mensaje de error
      });
    }
  },

  // Implementación de la acción register
  register: async (userData: RegisterRequestFrontend) => {
      set({ loadingRegister: true, errorRegister: null }); // Iniciamos carga de registro

      try {
          const response = await authService.register(userData);

          // Si el registro es exitoso y recibimos un token
          if (response?.token) {
              localStorage.setItem('jwt_token', response.token); // Almacenamos el token
               set({
                  isAuthenticated: true,
                  token: response.token,
                  // user: response.user, // Si tu backend devuelve el usuario
                  loadingRegister: false,
                  errorRegister: null,
              });
              console.log("Registration successful, state updated.");
          } else {
              // Manejo si el backend no devuelve token pero no lanza error
              set({
                 isAuthenticated: false,
                 token: null,
                 // user: null,
                 loadingRegister: false,
                 errorRegister: "Registration failed: No token received.",
             });
             console.error("Registration failed: No token received from backend.");
          }

          // Nota: Después del registro exitoso, a menudo querrás redirigir al usuario o iniciar sesión automáticamente.
          // La lógica de redirección debe estar en el componente que llama a esta acción, no aquí.

      } catch (error) {
          // Si ocurre un error durante el registro
          console.error("Error during registration:", error);
          set({
              loadingRegister: false,
              errorRegister: `Registration failed: ${error instanceof Error ? error.message : String(error)}`,
          });
          throw error; // Relanza el error para manejo en el componente
      }
  },

  // Implementación de la acción logout
  logout: () => {
    authService.logout(); // Elimina el token del almacenamiento local
    set({
        isAuthenticated: false,
        token: null,
        // user: null,
        // Opcional: Limpiar estados de carga/error también
        loadingLogin: false,
        errorLogin: null,
        loadingRegister: false,
        errorRegister: null,
    });
    console.log("Logout successful, state updated.");
  },

  // Implementación de la acción checkAuth
  // Esta acción se llama típicamente al inicio de la aplicación para ver si hay un token válido
  checkAuth: () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
          // Opcional: Aquí podrías añadir lógica para validar si el token no ha expirado
          // o hacer una llamada al backend para verificar si el token es válido.
          // Por ahora, solo verificamos su presencia.
          set({
              isAuthenticated: true,
              token: token,
              // Si almacenaste datos del usuario junto al token, cárgalos aquí también
              // user: JSON.parse(localStorage.getItem('user_data') || 'null'),
          });
           console.log("Token found in localStorage, setting isAuthenticated to true.");
      } else {
           set({
              isAuthenticated: false,
              token: null,
              // user: null,
          });
           console.log("No token found in localStorage, setting isAuthenticated to false.");
      }
  },

}));

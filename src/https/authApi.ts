// src/https/authApi.ts (REFACCTORIZADO PARA USAR HTTP SERVICE)
import { AuthResponseFrontend, LoginRequestFrontend, RegisterRequestFrontend } from '../types/auth';
import { UserDTO } from '../components/dto/UserDTO';
import { UserProfileUpdateDTO } from '../components/dto/UserProfileUpdateDTO';
import { UpdateCredentialsRequest } from '../components/dto/UpdateCredentialsRequest';
import { http } from './httpService'; // ¡Importamos tu httpService!

// La URL base ya está configurada en httpService,
// solo necesitamos la ruta específica del controlador de autenticación.
const AUTH_ENDPOINT = '/auth'; // Coincide con @RequestMapping("/auth") en tu backend

export const authService = {
    // login y register no necesitan el token JWT porque lo obtienen al inicio
    login: async (credentials: LoginRequestFrontend): Promise<AuthResponseFrontend> => {
        // Usamos http.post, que ya maneja la baseURL y los headers Content-Type
        const response = await http.post<AuthResponseFrontend>(`${AUTH_ENDPOINT}/login`, credentials);
        return response; // http.post ya devuelve data directamente
    },

    register: async (userData: RegisterRequestFrontend): Promise<AuthResponseFrontend> => {
        // Usamos http.post
        const response = await http.post<AuthResponseFrontend>(`${AUTH_ENDPOINT}/register`, userData);
        return response; // http.post ya devuelve data directamente
    },

    logout: () => {
        console.log("Client-side logout initiated.");
        // El logout en el frontend normalmente solo limpia el token.
        // El backend no necesita un endpoint de logout específico a menos que manejes sesiones en el servidor.
    },

    // --- MÉTODOS PARA EL PERFIL ---
    // Estos métodos SÍ se benefician del interceptor de httpService
    // porque automáticamente añade el token JWT si está en localStorage.

    // Obtener los datos del usuario autenticado
    getCurrentUser: async (): Promise<UserDTO> => {
        // CORRECTO: http.get automáticamente añadirá el token JWT si existe en localStorage
        const user = await http.get<UserDTO>(`${AUTH_ENDPOINT}/me`);
        return user;
    },

    // Actualizar los datos del usuario (texto/números)
    updateUser: async (userData: UserProfileUpdateDTO): Promise<UserDTO> => {
        // CORRECTO: http.put automáticamente añadirá el token JWT y Content-Type: application/json
        const updatedUser = await http.put<UserDTO>(`${AUTH_ENDPOINT}/profile`, userData);
        return updatedUser;
    },

    // Subir y actualizar la imagen de perfil
    uploadProfileImage: async (imageFile: File): Promise<UserDTO> => {
        const formData = new FormData();
        formData.append('file', imageFile);

        // CORRECTO: Axios (y por lo tanto httpService) ajusta automáticamente el Content-Type a 'multipart/form-data'.
        // http.post automáticamente añadirá el token JWT.
        const updatedUser = await http.post<UserDTO>(`${AUTH_ENDPOINT}/profile/upload-image`, formData);
        return updatedUser;
    },

    // Para actualizar credenciales
    updateUserCredentials: async (data: UpdateCredentialsRequest): Promise<UserDTO> => {
        // CORRECTO: http.patch automáticamente añadirá el token JWT y Content-Type: application/json
        const updatedUser = await http.patch<UserDTO>(`${AUTH_ENDPOINT}/update-credentials`, data);
        return updatedUser;
    },

    // Para desactivar la cuenta
    deactivateAccount: async (): Promise<void> => {
        // CORRECTO: http.delete automáticamente añadirá el token JWT
        // Y espera un 200 OK o 204 No Content.
        await http.delete<void>(`${AUTH_ENDPOINT}/deactivate`);
        // No devuelve nada, ya que el backend retorna un 200/204 sin cuerpo o un mensaje simple
    },
};
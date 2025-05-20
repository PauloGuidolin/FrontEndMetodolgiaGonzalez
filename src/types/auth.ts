import { Sexo } from "./ISexo"; // Asumo que ISexo define 'MASCULINO', 'FEMENINO', 'OTRO'

/**
 * Interfaz para los datos de la solicitud de LOGIN que se envían al backend.
 * Refleja com.ecommerce.ecommerce.dto.LoginRequest de Java.
 */
export interface LoginRequestFrontend {
    email: string;
    password: string;
}

/**
 * Interfaz para los datos de la solicitud de REGISTRO que se envían al backend.
 * Refleja com.ecommerce.ecommerce.dto.RegisterRequest de Java.
 */
export interface RegisterRequestFrontend {
    firstname: string;
    lastname: string;
    email: string;
    sexo: Sexo; // <-- Usas tu tipo Sexo (enum)
    password: string;
    dni: number; // <--- ¡¡¡AÑADIR ESTE CAMPO!!!
}

/**
 * Interfaz para la respuesta de autenticación/registro que se recibe del backend.
 * Refleja com.ecommerce.ecommerce.dto.AuthResponse de Java.
 */
export interface AuthResponseFrontend {
    token: string;
    // user?: IUsuario; // Descomenta si tu AuthResponse.java en el backend incluye un campo 'user'
}
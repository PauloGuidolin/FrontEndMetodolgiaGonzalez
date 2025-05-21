

export interface UpdateCredentialsRequest {
    email?: string; // El email es opcional para actualizar, si solo se cambia la contraseña
    currentPassword?: string; // Contraseña actual para verificar el cambio
    newPassword?: string; // Nueva contraseña, si se está cambiando
}
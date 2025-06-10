import { FC, useState, useEffect } from "react";
import styles from './EditAcccesData.module.css'; // Importa los estilos CSS para el modal.

import { useAuthStore } from "../../../../store/authStore"; // Importa el hook del store de autenticación (Zustand, etc.).
import { toast } from "react-toastify"; // Para mostrar notificaciones toast.
import { UserDTO } from "../../../dto/UserDTO"; // Define la estructura del objeto de usuario.
import { UpdateCredentialsRequest } from "../../../dto/UpdateCredentialsRequest"; // Define la estructura del payload para la actualización de credenciales.
import Swal from 'sweetalert2'; // Para mostrar alertas modales de confirmación.

/**
 * Define las propiedades (props) que el componente `EditAcccesData` espera recibir.
 */
interface EditAcccesDataProps {
    isOpen: boolean; // Indica si el modal debe estar visible (true) u oculto (false).
    onClose: () => void; // Función callback para cerrar el modal.
    user: UserDTO; // Objeto `UserDTO` con los datos actuales del usuario.
}

/**
 * `EditAcccesData` es un componente funcional de React que actúa como un modal
 * para que el usuario pueda editar su correo electrónico y/o contraseña.
 * Requiere la contraseña actual para confirmar cualquier cambio.
 *
 * @param {EditAcccesDataProps} { isOpen, onClose, user } Las propiedades del componente.
 * @returns {JSX.Element | null} Un elemento de modal React si `isOpen` es true, de lo contrario `null`.
 */
const EditAcccesData: FC<EditAcccesDataProps> = ({ isOpen, onClose, user }) => {
    // Si `isOpen` es `false`, el componente no renderiza nada, ocultando el modal.
    if (!isOpen) {
        return null;
    }

    // Estados locales para los campos del formulario.
    const [email, setEmail] = useState(user.email || ''); // Email actual del usuario o cadena vacía.
    const [currentPassword, setCurrentPassword] = useState(''); // Contraseña actual del usuario.
    const [newPassword, setNewPassword] = useState(''); // Nueva contraseña.
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Confirmación de la nueva contraseña.

    // Destructura funciones y estados del store de autenticación.
    const { updateUserCredentials, loadingUser, logout } = useAuthStore();

    // `useEffect` para actualizar el estado `email` si la prop `user.email` cambia.
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]); // Dependencia: el objeto `user`.

    /**
     * Manejador asíncrono para el botón de guardar.
     * Realiza validaciones, muestra confirmaciones y llama a la lógica de actualización.
     */
    const handleSave = async () => {
        // Determina si el email o la contraseña han sido modificados.
        const emailChanged = email !== user.email;
        const passwordChanged = newPassword.length > 0; // Se considera cambiada si se ha introducido algo.

        // Validación: la nueva contraseña y su confirmación deben coincidir.
        if (passwordChanged && newPassword !== confirmNewPassword) {
            toast.error("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        // Validación: si hay cambios en email o contraseña, la contraseña actual es requerida.
        if ((emailChanged || passwordChanged) && !currentPassword) {
            toast.error("Por favor, introduce tu contraseña actual para confirmar los cambios.");
            return;
        }

        // Si no hay ningún cambio, informa al usuario y cierra el modal.
        if (!emailChanged && !passwordChanged) {
            toast.info("No hay cambios en el email o la contraseña.");
            onClose();
            return;
        }

        // Prepara los mensajes de confirmación para SweetAlert2.
        let confirmationText = '';
        let showConfirmation = false;

        if (emailChanged && passwordChanged) {
            confirmationText = 'Si cambias tu email y contraseña, tu sesión actual se cerrará y deberás iniciar sesión de nuevo con las nuevas credenciales.';
            showConfirmation = true;
        } else if (emailChanged) {
            confirmationText = 'Si cambias tu email, tu sesión actual se cerrará y deberás iniciar sesión de nuevo con el nuevo email.';
            showConfirmation = true;
        } else if (passwordChanged) {
            confirmationText = 'Si cambias tu contraseña, tu sesión actual se cerrará y deberás iniciar sesión de nuevo con la nueva contraseña.';
            showConfirmation = true;
        }

        // Si se requiere confirmación (hubo cambios), muestra la alerta de SweetAlert2.
        if (showConfirmation) {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: confirmationText,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) {
                return; // Si el usuario cancela la confirmación, la función termina aquí.
            }
        }

        // Construye el objeto `UpdateCredentialsRequest` con los datos a enviar.
        const updateData: UpdateCredentialsRequest = {
            currentPassword: currentPassword, // La contraseña actual es siempre necesaria si hay cambios.
        };

        if (emailChanged) {
            updateData.newEmail = email; // Añade el nuevo email si ha cambiado.
        }

        if (passwordChanged) {
            updateData.newPassword = newPassword; // Añade la nueva contraseña si ha cambiado.
        }

        try {
            // Llama a la función del store para actualizar las credenciales.
            await updateUserCredentials(updateData);
            toast.success("Datos de acceso actualizados exitosamente.");

            // Si hubo algún cambio en email o contraseña, cierra la sesión del usuario.
            if (emailChanged || passwordChanged) {
                logout();
            }
            onClose(); // Cierra el modal después de una actualización exitosa.
        } catch (error: any) {
            // Manejo de errores en caso de fallo en la actualización.
            console.error("Error al guardar los datos de acceso:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al actualizar los datos de acceso.";
            toast.error(errorMessage); // Muestra un mensaje de error al usuario.
        }
    };

    return (
        <>
            {/* Fondo oscuro del modal que también lo cierra al hacer clic fuera */}
            <div className={styles.background} onClick={onClose}></div>
            {/* Contenedor principal del modal */}
            <div className={styles.containerPrincipal}>
                <h3>Editar Contraseñas y correo</h3>
                <div className={styles.containerData}>
                    <label>Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.inputText}
                        disabled={loadingUser} // Deshabilita el input mientras la carga está activa.
                    />
                    <label>Contraseña Actual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.inputText}
                        disabled={loadingUser}
                    />
                    <label>Nueva Contraseña</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.inputText}
                        disabled={loadingUser}
                    />
                    <label>Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={styles.inputText}
                        disabled={loadingUser}
                    />
                </div>
                <div className={styles.containerButtons}>
                    {/* Botón para cancelar la edición, que cierra el modal */}
                    <button onClick={onClose} disabled={loadingUser}>Cancelar</button>
                    {/* Botón para guardar los cambios */}
                    <button onClick={handleSave} disabled={loadingUser}>
                        {loadingUser ? 'Guardando...' : 'Aceptar'} {/* Muestra "Guardando..." durante la carga. */}
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditAcccesData;
import { FC, useState, useEffect } from "react";
import styles from './EditAcccesData.module.css';

import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO";
import { UpdateCredentialsRequest } from "../../../dto/UpdateCredentialsRequest";
import Swal from 'sweetalert2';

interface EditAcccesDataProps {
    // AÑADE ESTAS DOS PROPIEDADES
    isOpen: boolean; // Indica si el modal está abierto o cerrado
    onClose: () => void; // Función para cerrar el modal
    user: UserDTO;
}

// CAMBIA LA DESESTRUCTURACIÓN DE LAS PROPS
const EditAcccesData: FC<EditAcccesDataProps> = ({ isOpen, onClose, user }) => {
    // AÑADE ESTE RENDERIZADO CONDICIONAL AL PRINCIPIO DEL COMPONENTE
    if (!isOpen) {
        return null; // Si isOpen es false, el componente no renderiza nada (está oculto)
    }

    const [email, setEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const { updateUserCredentials, loadingUser, logout } = useAuthStore();

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSave = async () => {
        const emailChanged = email !== user.email;
        const passwordChanged = newPassword.length > 0;

        if (passwordChanged && newPassword !== confirmNewPassword) {
            toast.error("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        if ((emailChanged || passwordChanged) && !currentPassword) {
            toast.error("Por favor, introduce tu contraseña actual para confirmar los cambios.");
            return;
        }

        if (!emailChanged && !passwordChanged) {
            toast.info("No hay cambios en el email o la contraseña.");
            onClose(); // Usa onClose aquí
            return;
        }

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
                return; // Si el usuario cancela, no hacemos nada
            }
        }

        const updateData: UpdateCredentialsRequest = {
            currentPassword: currentPassword,
        };

        if (emailChanged) {
            updateData.newEmail = email;
        }

        if (passwordChanged) {
            updateData.newPassword = newPassword;
        }

        try {
            await updateUserCredentials(updateData);
            toast.success("Datos de acceso actualizados exitosamente.");

            // Si hubo algún cambio en email o contraseña, cerramos la sesión
            if (emailChanged || passwordChanged) {
                logout();
            }
            onClose(); // Usa onClose aquí
        } catch (error: any) {
            console.error("Error al guardar los datos de acceso:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al actualizar los datos de acceso.";
            toast.error(errorMessage);
        }
    };

    return (
        <>
            {/* CAMBIA closeEditAccesData POR onClose */}
            <div className={styles.background} onClick={onClose}></div>
            <div className={styles.containerPrincipal}>
                <h3>Editar Contraseñas y correo</h3>
                <div className={styles.containerData}>
                    <label>Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.inputText}
                        disabled={loadingUser}
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
                    {/* CAMBIA closeEditAccesData POR onClose */}
                    <button onClick={onClose} disabled={loadingUser}>Cancelar</button>
                    <button onClick={handleSave} disabled={loadingUser}>
                        {loadingUser ? 'Guardando...' : 'Aceptar'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default EditAcccesData;
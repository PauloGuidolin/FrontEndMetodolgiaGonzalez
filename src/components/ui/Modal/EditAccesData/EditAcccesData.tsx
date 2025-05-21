// src/components/ui/Modal/EditAccesData/EditAcccesData.tsx

import { FC, useState, useEffect } from "react";
import styles from './EditAcccesData.module.css';

import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO";
import { UpdateCredentialsRequest } from "../../../dto/UpdateCredentialsRequest";

// Define la interfaz de props
interface EditAcccesDataProps {
    closeEditAccesData: () => void;
    user: UserDTO;
}

const EditAcccesData: FC<EditAcccesDataProps> = ({ closeEditAccesData, user }) => {
    const [email, setEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // MODIFICACIÓN: Solo desestructuramos `updateUserCredentials`
    const { updateUserCredentials, loadingUser } = useAuthStore(); // Asume que ya implementaste o implementarás `updateUserCredentials` en authStore

    // useEffect para pre-llenar el email
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmNewPassword) {
            toast.error("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        // Si se va a cambiar la contraseña o el email, se requiere la contraseña actual
        if ((newPassword || email !== user.email) && !currentPassword) {
            toast.error("Por favor, introduce tu contraseña actual para confirmar los cambios.");
            return;
        }

        const updateData: UpdateCredentialsRequest = {
            email: email !== user.email ? email : undefined, // Solo envía el email si ha cambiado
            currentPassword: currentPassword, // Siempre se envía si se está actualizando la contraseña
            newPassword: newPassword || undefined, // Solo envía newPassword si hay una
        };

        // Eliminar propiedades undefined si tu backend lo prefiere (excepto currentPassword si es necesario)
        if (updateData.email === undefined) delete updateData.email;
        if (updateData.newPassword === undefined) delete updateData.newPassword;

        // Si no hay cambios en email ni nueva contraseña
        if (!updateData.email && !updateData.newPassword) {
            toast.info("No hay cambios en el email o la contraseña.");
            closeEditAccesData();
            return;
        }

        try {
            await updateUserCredentials(updateData);
            toast.success("Datos de acceso actualizados exitosamente.");
            closeEditAccesData();
        } catch (error: any) {
            console.error("Error al guardar los datos de acceso:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al actualizar los datos de acceso.";
            toast.error(errorMessage);
        }
    };

    return (
        <>
            <div className={styles.background} onClick={closeEditAccesData}></div>
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
                    <button onClick={closeEditAccesData} disabled={loadingUser}>Cancelar</button>
                    <button onClick={handleSave} disabled={loadingUser}>
                        {loadingUser ? 'Guardando...' : 'Aceptar'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default EditAcccesData;
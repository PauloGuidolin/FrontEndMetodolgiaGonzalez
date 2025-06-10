
import React, { useState, useEffect } from 'react';

import { FaTimes } from 'react-icons/fa'; // Importa el icono de cierre
import styles from './UserDetailModal.module.css'; // Estilos CSS Modules para el modal
import { UserDTO } from '../../../dto/UserDTO'; // DTO para la información del usuario
import { useAdminUserStore } from '../../../../store/useAdminUserStore'; // Store de Zustand para la administración de usuarios
import { LocalidadDTO } from '../../../dto/location'; // DTO para Localidad (aunque no se usa directamente en la UI aquí)
import { Rol } from '../../../../types/IRol'; // Enum para los roles de usuario (aunque no se usa directamente en la UI aquí)

// Define las propiedades que el componente UserDetailModal espera recibir
interface UserDetailModalProps {
    isOpen: boolean; // Controla si el modal está visible
    onClose: () => void; // Función para cerrar el modal
    user: UserDTO | null; // El objeto UserDTO del usuario a mostrar, o null si no hay ninguno
}

// Componente funcional UserDetailModal
const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
    // Obtiene funciones y estados del store de administración de usuarios (aunque solo se usa clearError aquí)
    const { clearError } = useAdminUserStore();
    // Estado local para mantener una copia del usuario, inicializado con el prop 'user'
    const [editedUser, setEditedUser] = useState<UserDTO | null>(null);

    // Efecto que se ejecuta cuando el usuario o el estado 'isOpen' cambian
    useEffect(() => {
        setEditedUser(user); // Actualiza el usuario editado con el usuario prop
        clearError(); // Limpia cualquier error previo del store
    }, [user, isOpen, clearError]); // Dependencias del efecto

    // Si el modal no está abierto o no hay un usuario, no renderiza nada
    if (!isOpen || !user) return null;

    return (
        // Fondo del modal que oscurece el contenido detrás, se activa con la clase 'open'
        <div className={`${styles.modalBackground} ${isOpen ? styles.open : ''}`}>
            {/* Contenido principal del modal */}
            <div className={styles.modalContent}>
                {/* Botón para cerrar el modal, con icono FaTimes */}
                <button className={styles.closeModalButton} onClick={onClose} title="Cerrar">
                    <FaTimes />
                </button>
                {/* Título fijo del modal */}
                <h2 className={styles.modalTitle}>Detalles del Usuario</h2>
                {/* Muestra un mensaje de error si existe en el store (actualmente no se usa 'error' directamente en este componente para mostrar) */}
                {/* {error && <div className={styles.errorMessage}>{error}</div>} */}

                {/* Renderiza los detalles del usuario solo si 'editedUser' no es nulo */}
                {editedUser && (
                    <div className={styles.userInfoSection}>
                        {/* Muestra el nombre de usuario o email como un encabezado */}
                        <p className={styles.usernameDisplay}>{editedUser.username || editedUser.email}</p>

                        {/* Contenedor para mostrar los campos del usuario en una cuadrícula */}
                        <div className={styles.gridContainer}>
                            {/* Grupo de campo para el ID del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>ID:</label>
                                <p className={styles.valueText}>{editedUser.id}</p>
                            </div>
                            {/* Grupo de campo para el Email del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email:</label>
                                <p className={styles.valueText}>{editedUser.email}</p>
                            </div>
                            {/* Grupo de campo para el Nombre del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nombre:</label>
                                <p className={styles.valueText}>{editedUser.firstname || 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para el Apellido del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Apellido:</label>
                                <p className={styles.valueText}>{editedUser.lastname || 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para el DNI del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>DNI:</label>
                                <p className={styles.valueText}>{editedUser.dni || 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para el Sexo del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Sexo:</label>
                                <p className={styles.valueText}>{editedUser.sexo || 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para la Fecha de Nacimiento del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Fecha Nacimiento:</label>
                                <p className={styles.valueText}>{editedUser.fechaNacimiento ? new Date(editedUser.fechaNacimiento).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para el Teléfono del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Teléfono:</label>
                                <p className={styles.valueText}>{editedUser.telefono || 'N/A'}</p>
                            </div>
                            {/* Grupo de campo para el Rol del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Rol:</label>
                                <p className={styles.valueText}>{editedUser.role}</p>
                            </div>
                            {/* Grupo de campo para el estado Activo del usuario (solo lectura) */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Activo:</label>
                                <p className={styles.valueText}>
                                    {/* Muestra 'Sí' o 'No' con estilos diferentes según el estado activo */}
                                    <span className={editedUser.activo ? styles.activeStatusText : styles.inactiveStatusText}>
                                        {editedUser.activo ? 'Sí' : 'No'}
                                    </span>
                                </p>
                            </div>

                            {/* Sección para mostrar las direcciones del usuario */}
                            <div className={styles.addressesSection}>
                                <h3 className={styles.addressesTitle}>Direcciones:</h3>
                                {/* Condicional para renderizar la lista de direcciones si existen */}
                                {editedUser.addresses && editedUser.addresses.length > 0 ? (
                                    <ul className={styles.addressListSimple}>
                                        {/* Mapea cada dirección para mostrarla en un elemento de lista */}
                                        {editedUser.addresses.map((address, index) => (
                                            <li key={address.id || `new-${index}`} className={styles.addressItemSimple}>
                                                {/* Formatea la dirección completa */}
                                                {address.calle} {address.numero}, {address.localidad?.nombre} ({address.localidad?.provincia?.nombre}), C.P. {address.cp}
                                                {address.piso && `, Piso: ${address.piso}`}
                                                {address.departamento && `, Depto: ${address.departamento}`}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    // Mensaje si el usuario no tiene direcciones registradas
                                    <p className={styles.noAddressesMessage}>No tiene direcciones registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de acciones del modal */}
                <div className={styles.modalActions}>
                    {/* Botón para cerrar el modal */}
                    <button onClick={onClose} className={styles.closeButton}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
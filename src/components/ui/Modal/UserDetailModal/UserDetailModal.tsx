import React, { useState, useEffect } from 'react';

import { FaTimes } from 'react-icons/fa'; // Solo necesitamos FaTimes
import styles from './UserDetailModal.module.css';
import { UserDTO } from '../../../dto/UserDTO';
import { useAdminUserStore } from '../../../../store/useAdminUserStore';
import { LocalidadDTO } from '../../../dto/location';
import { Rol } from '../../../../types/IRol';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDTO | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
    const { updateUser, isLoading, error, clearError } = useAdminUserStore();
    const [editedUser, setEditedUser] = useState<UserDTO | null>(null);
    // isEditing ya no es necesaria, ya que no habrá modo edición en este modal.
    // const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setEditedUser(user);
        // setIsEditing(false); // Ya no es necesario
        clearError();
    }, [user, isOpen, clearError]);

    if (!isOpen || !user) return null;



    return (
        <div className={`${styles.modalBackground} ${isOpen ? styles.open : ''}`}>
            <div className={styles.modalContent}>
                <button className={styles.closeModalButton} onClick={onClose} title="Cerrar">
                    <FaTimes />
                </button>
                <h2 className={styles.modalTitle}>Detalles del Usuario</h2> {/* Título fijo */}
                {error && <div className={styles.errorMessage}>{error}</div>}

                {editedUser && (
                    <div className={styles.userInfoSection}>
                        <p className={styles.usernameDisplay}>{editedUser.username || editedUser.email}</p>

                        <div className={styles.gridContainer}>
                            {/* Renderizado de campos del usuario - Todos son de SOLO LECTURA */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>ID:</label>
                                <p className={styles.valueText}>{editedUser.id}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email:</label>
                                <p className={styles.valueText}>{editedUser.email}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nombre:</label>
                                <p className={styles.valueText}>{editedUser.firstname || 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Apellido:</label>
                                <p className={styles.valueText}>{editedUser.lastname || 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>DNI:</label>
                                <p className={styles.valueText}>{editedUser.dni || 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Sexo:</label>
                                <p className={styles.valueText}>{editedUser.sexo || 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Fecha Nacimiento:</label>
                                <p className={styles.valueText}>{editedUser.fechaNacimiento ? new Date(editedUser.fechaNacimiento).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Teléfono:</label>
                                <p className={styles.valueText}>{editedUser.telefono || 'N/A'}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Rol:</label>
                                {/* Ahora siempre como texto, no como select */}
                                <p className={styles.valueText}>{editedUser.role}</p>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Activo:</label>
                                {/* Ahora siempre como texto, no como checkbox */}
                                <p className={styles.valueText}>
                                    <span className={editedUser.activo ? styles.activeStatusText : styles.inactiveStatusText}>
                                        {editedUser.activo ? 'Sí' : 'No'}
                                    </span>
                                </p>
                            </div>

                            <div className={styles.addressesSection}>
                                <h3 className={styles.addressesTitle}>Direcciones:</h3>
                                {editedUser.addresses && editedUser.addresses.length > 0 ? (
                                    <ul className={styles.addressListSimple}>
                                        {editedUser.addresses.map((address, index) => (
                                            <li key={address.id || `new-${index}`} className={styles.addressItemSimple}>
                                                {address.calle} {address.numero}, {address.localidad?.nombre} ({address.localidad?.provincia?.nombre}), C.P. {address.cp}
                                                {address.piso && `, Piso: ${address.piso}`}
                                                {address.departamento && `, Depto: ${address.departamento}`}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={styles.noAddressesMessage}>No tiene direcciones registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.modalActions}>
                    {/* Elimina completamente el bloque isEditing */}
                    <button onClick={onClose} className={styles.closeButton}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
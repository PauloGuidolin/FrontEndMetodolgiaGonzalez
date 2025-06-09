import React from 'react';
import { FaEye, FaToggleOn, FaToggleOff, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa'; // Importa FaEye
import styles from './AdminUserTable.module.css';
import { UserDTO } from '../../dto/UserDTO';
import { Rol } from '../../../types/IRol';

interface AdminUserTableProps {
    users: UserDTO[];
    isLoading: boolean;
    error: string | null;
    onEdit: (user: UserDTO) => void; // El nombre de la prop lo mantendremos para no romper la conexión con el store
    onToggleActive: (userId: number, currentStatus: boolean) => void;
    onChangeRole: (userId: number, newRole: Rol) => void;
    onHardDelete: (userId: number) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({
    users,
    isLoading,
    error,
    onEdit, // Se sigue llamando onEdit pero ahora disparará la vista de detalles
    onToggleActive,
    onChangeRole,
    onHardDelete,
}) => {
    if (isLoading) {
        return <div className={styles.loadingMessage}>Cargando usuarios...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>Error al cargar usuarios: {error}</div>;
    }

    if (users.length === 0) {
        return <div className={styles.noDataMessage}>No hay usuarios para mostrar.</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th scope="col" className={styles.tableTh}>ID</th>
                        <th scope="col" className={styles.tableTh}>Username</th>
                        <th scope="col" className={styles.tableTh}>Email</th>
                        <th scope="col" className={styles.tableTh}>Nombre</th>
                        <th scope="col" className={styles.tableTh}>Apellido</th>
                        <th scope="col" className={styles.tableTh}>Rol</th>
                        <th scope="col" className={styles.tableTh}>Activo</th>
                        <th scope="col" className={styles.tableTh}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className={styles.tableRow}>
                            <td className={styles.tableTd}>{user.id}</td>
                            <td className={styles.tableTd}>{user.username}</td>
                            <td className={styles.tableTd}>{user.email}</td>
                            <td className={styles.tableTd}>{user.firstname || 'N/A'}</td>
                            <td className={styles.tableTd}>{user.lastname || 'N/A'}</td>
                            <td className={styles.tableTd}>
                                <select
                                    value={user.role}
                                    onChange={(e) => onChangeRole(user.id, e.target.value as Rol)}
                                    className={styles.roleSelect}
                                >
                                    {Object.values(Rol).map((rol) => (
                                        <option key={rol} value={rol}>
                                            {rol}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className={styles.tableTd}>
                                <span className={user.activo ? styles.activeStatus : styles.inactiveStatus}>
                                    {user.activo ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td className={styles.tableTdActions}>
                                {/* BOTÓN DE VER DETALLES */}
                                <button
                                    onClick={() => onEdit(user)}
                                    className={`${styles.actionButton} ${styles.viewButton}`} // Nueva clase para estilos específicos
                                    title="Ver detalles del usuario"
                                >
                                    <FaEye className={styles.icon} /> Ver Detalles
                                </button>
                                <button
                                    onClick={() => onToggleActive(user.id, user.activo)}
                                    className={`${styles.actionButton} ${user.activo ? styles.deactivateButton : styles.activateButton}`}
                                    title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                    {user.activo ? <><FaToggleOff className={styles.icon} /> Desactivar</> : <><FaToggleOn className={styles.icon} /> Activar</>}
                                </button>
                                <button
                                    onClick={() => onHardDelete(user.id)}
                                    className={`${styles.actionButton} ${styles.hardDeleteButton}`}
                                    title="Eliminar permanentemente (¡Cuidado!)"
                                >
                                    <FaTrashAlt className={styles.icon} /> <FaExclamationTriangle className={styles.warningIcon} /> Hard Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserTable;
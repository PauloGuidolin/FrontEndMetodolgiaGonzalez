import React from 'react';
// Importa los íconos necesarios de react-icons/fa.
// FaEye para "ver detalles", FaToggleOn/Off para el estado activo/inactivo,
// FaTrashAlt para eliminar y FaExclamationTriangle para la advertencia de "hard delete".
import { FaEye, FaToggleOn, FaToggleOff, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import styles from './AdminUserTable.module.css'; // Importa los estilos CSS para el componente.
import { UserDTO } from '../../dto/UserDTO'; // Importa la interfaz UserDTO para tipar los usuarios.
import { Rol } from '../../../types/IRol'; // Importa el tipo Rol para los roles de usuario.

/**
 * Define las propiedades (props) que el componente AdminUserTable espera recibir.
 */
interface AdminUserTableProps {
    users: UserDTO[]; // Array de objetos UserDTO a mostrar en la tabla.
    isLoading: boolean; // Booleano que indica si los datos están cargando.
    error: string | null; // Mensaje de error si ocurre alguno durante la carga.
    // onEdit: Se mantiene el nombre de la prop `onEdit` por compatibilidad,
    // pero ahora su funcionalidad es la de "ver detalles" del usuario.
    onEdit: (user: UserDTO) => void;
    // onToggleActive: Función para cambiar el estado activo/inactivo de un usuario.
    onToggleActive: (userId: number, currentStatus: boolean) => void;
    // onChangeRole: Función para cambiar el rol de un usuario.
    onChangeRole: (userId: number, newRole: Rol) => void;
    // onHardDelete: Función para eliminar permanentemente un usuario.
    onHardDelete: (userId: number) => void;
}

/**
 * `AdminUserTable` es un componente funcional que muestra una tabla de usuarios
 * para la administración, incluyendo su información básica, rol, estado activo,
 * y acciones como ver detalles, activar/desactivar y eliminar.
 */
const AdminUserTable: React.FC<AdminUserTableProps> = ({
    users,
    isLoading,
    error,
    onEdit, // Ahora se usará para disparar la vista de detalles.
    onToggleActive,
    onChangeRole,
    onHardDelete,
}) => {
    // --- Renderizado condicional basado en el estado de carga y errores ---

    // Si los datos están cargando, muestra un mensaje de carga.
    if (isLoading) {
        return <div className={styles.loadingMessage}>Cargando usuarios...</div>;
    }

    // Si hay un error, muestra un mensaje de error.
    if (error) {
        return <div className={styles.errorMessage}>Error al cargar usuarios: {error}</div>;
    }

    // Si no hay usuarios para mostrar (después de la carga y sin errores), muestra un mensaje.
    if (users.length === 0) {
        return <div className={styles.noDataMessage}>No hay usuarios para mostrar.</div>;
    }

    // --- Renderizado de la tabla de usuarios ---
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                {/* Cabecera de la tabla */}
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
                {/* Cuerpo de la tabla con los datos de los usuarios */}
                <tbody>
                    {/* Mapea cada usuario a una fila de la tabla */}
                    {users.map((user) => (
                        <tr key={user.id} className={styles.tableRow}>
                            <td className={styles.tableTd}>{user.id}</td>
                            <td className={styles.tableTd}>{user.username}</td>
                            <td className={styles.tableTd}>{user.email}</td>
                            {/* Muestra el nombre y apellido, o 'N/A' si no están definidos. */}
                            <td className={styles.tableTd}>{user.firstname || 'N/A'}</td>
                            <td className={styles.tableTd}>{user.lastname || 'N/A'}</td>
                            {/* Celda para el rol del usuario con un selector */}
                            <td className={styles.tableTd}>
                                <select
                                    value={user.role} // El valor seleccionado es el rol actual del usuario.
                                    // Al cambiar, llama a `onChangeRole` con el ID del usuario y el nuevo rol.
                                    onChange={(e) => onChangeRole(user.id, e.target.value as Rol)}
                                    className={styles.roleSelect}
                                >
                                    {/* Mapea todos los valores del enum `Rol` a opciones del selector. */}
                                    {Object.values(Rol).map((rol) => (
                                        <option key={rol} value={rol}>
                                            {rol}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            {/* Celda para el estado 'Activo' del usuario */}
                            <td className={styles.tableTd}>
                                <span className={user.activo ? styles.activeStatus : styles.inactiveStatus}>
                                    {user.activo ? 'Sí' : 'No'}
                                </span>
                            </td>
                            {/* Celda para las acciones del usuario */}
                            <td className={styles.tableTdActions}>
                                {/* BOTÓN DE VER DETALLES */}
                                <button
                                    // Al hacer clic, llama a `onEdit` (que ahora se usa para ver detalles) con el usuario completo.
                                    onClick={() => onEdit(user)}
                                    className={`${styles.actionButton} ${styles.viewButton}`} // Clases de estilo para el botón de ver.
                                    title="Ver detalles del usuario" // Tooltip al pasar el mouse.
                                >
                                    <FaEye className={styles.icon} /> Ver Detalles
                                </button>
                                {/* Botón para activar/desactivar usuario */}
                                <button
                                    // Al hacer clic, llama a `onToggleActive` con el ID del usuario y su estado actual.
                                    onClick={() => onToggleActive(user.id, user.activo)}
                                    // Clases de estilo condicionales según el estado activo/inactivo.
                                    className={`${styles.actionButton} ${user.activo ? styles.deactivateButton : styles.activateButton}`}
                                    // Tooltip condicional.
                                    title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                    {/* Muestra el ícono y texto apropiado según el estado. */}
                                    {user.activo ? <><FaToggleOff className={styles.icon} /> Desactivar</> : <><FaToggleOn className={styles.icon} /> Activar</>}
                                </button>
                                {/* Botón para eliminación permanente (Hard Delete) */}
                                <button
                                    // Al hacer clic, llama a `onHardDelete` con el ID del usuario.
                                    onClick={() => onHardDelete(user.id)}
                                    className={`${styles.actionButton} ${styles.hardDeleteButton}`} // Clases de estilo para el botón de hard delete.
                                    title="Eliminar permanentemente (¡Cuidado!)" // Tooltip de advertencia.
                                >
                                    <FaTrashAlt className={styles.icon} /> {/* Ícono de papelera. */}
                                    <FaExclamationTriangle className={styles.warningIcon} /> {/* Ícono de advertencia. */}
                                    Hard Delete
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
// Archivo: src/components/ui/TalleComp/TalleTable/TalleTable.tsx

import React from 'react';
import styles from './TalleTable.module.css'; // Importa los estilos CSS Modules para la tabla de Talle
import { TalleDTO } from '../../dto/TalleDTO'; // Asegúrate de que esta ruta sea correcta para el DTO de Talle

// Define las propiedades que el componente TalleTable espera recibir
interface TalleTableProps {
    talles: TalleDTO[]; // Un array de objetos TalleDTO a mostrar en la tabla
    loading: boolean; // Indica si los datos están siendo cargados
    error: string | null; // Mensaje de error si ocurre alguno durante la carga
    onEditTalle: (talle: TalleDTO) => void; // Función para manejar la edición de un talle
    onToggleTalleActive: (id: number, currentStatus: boolean) => void; // Función para cambiar el estado activo/inactivo de un talle
    onDeleteTalle: (talle: TalleDTO) => void; // Función para manejar la eliminación de un talle
}

// Componente funcional TalleTable
export const TalleTable: React.FC<TalleTableProps> = ({
    talles,
    loading,
    error,
    onEditTalle,
    onToggleTalleActive,
    onDeleteTalle
}) => {
    // Muestra un mensaje de carga si los datos están siendo cargados
    if (loading) {
        return <p>Cargando talles...</p>;
    }

    // Muestra un mensaje de error si ocurre un problema al cargar los talles
    if (error) {
        return <p className={styles.errorText}>Error al cargar talles: {error}</p>;
    }

    // Muestra un mensaje si no hay talles para mostrar después de la carga
    if (!talles || talles.length === 0) {
        return <p>No hay talles para mostrar.</p>;
    }

    return (
        // Contenedor principal de la tabla
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Mapea cada talle para crear una fila en la tabla */}
                    {talles.map((talle) => (
                        // La key es fundamental para la renderización de listas en React
                        <tr key={talle.id}>
                            <td>{talle.id}</td>
                            <td>{talle.nombreTalle}</td>
                            <td>
                                {/* Muestra el estado activo/inactivo con un estilo visual diferente */}
                                <span className={`${styles.statusPill} ${talle.activo ? styles.active : styles.inactive}`}>
                                    {talle.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                {/* Botón para editar el talle */}
                                <button onClick={() => onEditTalle(talle)} className={styles.editButton}>
                                    Editar
                                </button>
                                {/* Botón para activar/desactivar el talle, cambia de texto y estilo según el estado actual */}
                                <button
                                    onClick={() => onToggleTalleActive(talle.id!, talle.activo)} // Se pasa el ID y el estado actual
                                    className={talle.activo ? styles.deactivateButton : styles.activateButton}
                                >
                                    {talle.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                {/* Botón para eliminar el talle */}
                                <button onClick={() => onDeleteTalle(talle)} className={styles.deleteButton}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
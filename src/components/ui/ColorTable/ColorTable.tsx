// src/components/ui/ColorComp/ColorTable/ColorTable.tsx

import React from 'react';
import styles from './ColorTable.module.css'; // Crea este archivo CSS
import { ColorDTO } from '../../dto/ColorDTO';


interface ColorTableProps {
    colors: ColorDTO[];
    loading: boolean;
    error: string | null;
    onEditColor: (color: ColorDTO) => void;
    onToggleColorActive: (id: number, currentStatus: boolean, nombreColor: string) => void;
    onDeleteColor: (color: ColorDTO) => void;
}

export const ColorTable: React.FC<ColorTableProps> = ({
    colors,
    loading,
    error,
    onEditColor,
    onToggleColorActive,
    onDeleteColor
}) => {
    if (loading) {
        return <p>Cargando colores...</p>;
    }

    if (error) {
        return <p className={styles.errorText}>Error al cargar colores: {error}</p>;
    }

    if (!colors || colors.length === 0) {
        return <p>No hay colores para mostrar.</p>;
    }

    return (
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
                    {colors.map((color) => (
                        <tr key={color.id}>
                            <td>{color.id}</td>
                            <td>{color.nombreColor}</td>
                            <td>
                                <span className={`${styles.statusPill} ${color.activo ? styles.active : styles.inactive}`}>
                                    {color.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                <button onClick={() => onEditColor(color)} className={styles.editButton}>
                                    Editar
                                </button>
                                <button
                                    onClick={() => onToggleColorActive(color.id!, color.activo, color.nombreColor)}
                                    className={color.activo ? styles.deactivateButton : styles.activateButton}
                                >
                                    {color.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={() => onDeleteColor(color)} className={styles.deleteButton}>
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
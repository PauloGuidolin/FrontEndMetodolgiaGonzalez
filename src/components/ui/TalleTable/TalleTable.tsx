// src/components/ui/TalleComp/TalleTable/TalleTable.tsx

import React from 'react';
import styles from './TalleTable.module.css'; // Crea este archivo CSS
import { TalleDTO } from '../../dto/TalleDTO';


interface TalleTableProps {
    talles: TalleDTO[];
    loading: boolean;
    error: string | null;
    onEditTalle: (talle: TalleDTO) => void;
    // Eliminado 'nombreTalle' de la firma si no se usa directamente en el store/lógica de toggle
    onToggleTalleActive: (id: number, currentStatus: boolean) => void;
    onDeleteTalle: (talle: TalleDTO) => void;
}

export const TalleTable: React.FC<TalleTableProps> = ({
    talles,
    loading,
    error,
    onEditTalle,
    onToggleTalleActive,
    onDeleteTalle
}) => {
    if (loading) {
        return <p>Cargando talles...</p>;
    }

    if (error) {
        return <p className={styles.errorText}>Error al cargar talles: {error}</p>;
    }

    // Renderiza este mensaje solo si talles es un array vacío después de cargar
    if (!talles || talles.length === 0) {
        return <p>No hay talles para mostrar.</p>;
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
                    {talles.map((talle) => (
                        // Asegúrate de que talle.id siempre esté presente aquí
                        <tr key={talle.id}>
                            <td>{talle.id}</td>
                            <td>{talle.nombreTalle}</td>
                            <td>
                                <span className={`${styles.statusPill} ${talle.activo ? styles.active : styles.inactive}`}>
                                    {talle.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                <button onClick={() => onEditTalle(talle)} className={styles.editButton}>
                                    Editar
                                </button>
                                <button
                                    onClick={() => onToggleTalleActive(talle.id!, talle.activo)} // Ya no paso nombreTalle si no se usa
                                    className={talle.activo ? styles.deactivateButton : styles.activateButton}
                                >
                                    {talle.activo ? 'Desactivar' : 'Activar'}
                                </button>
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
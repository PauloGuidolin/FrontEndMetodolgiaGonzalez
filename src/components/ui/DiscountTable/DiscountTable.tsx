// src/components/ui/DiscountTable/DiscountTable.tsx

import React from 'react';
import styles from './DiscountTable.module.css';
import { format } from 'date-fns';
import { DescuentoDTO } from '../../dto/DescuentoDTO';

interface DiscountTableProps {
    discounts: DescuentoDTO[];
    loading: boolean;
    error: string | null;
    onEditDiscount: (discount: DescuentoDTO) => void;
    onToggleDiscountActive: (id: number, currentStatus: boolean, denominacion: string) => void;
    onDeleteDiscount: (discount: DescuentoDTO) => void;
}

export const DiscountTable: React.FC<DiscountTableProps> = ({
    discounts,
    loading,
    error,
    onEditDiscount,
    onToggleDiscountActive,
    onDeleteDiscount,
}) => {
    if (loading) {
        return <p className={styles.message}>Cargando descuentos...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>Error al cargar descuentos: {error}</p>;
    }

    if (!discounts || discounts.length === 0) {
        return <p className={styles.message}>No hay descuentos para mostrar.</p>;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Denominación</th>
                        <th>Fecha Desde</th>
                        <th>Fecha Hasta</th>
                        <th>Hora Desde</th>
                        <th>Hora Hasta</th>
                        <th>Descripción</th>
                        <th>Precio Promocional</th> {/* Cambiado a Precio Promocional */}
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {discounts.map((discount) => (
                        <tr key={discount.id}>
                            <td>{discount.id}</td>
                            <td>{discount.denominacion}</td>
                            <td>{format(new Date(discount.fechaDesde), 'dd/MM/yyyy')}</td>
                            <td>{format(new Date(discount.fechaHasta), 'dd/MM/yyyy')}</td>
                            <td>{discount.horaDesde.substring(0, 5)}</td>
                            <td>{discount.horaHasta.substring(0, 5)}</td>
                            <td>{discount.descripcionDescuento}</td>
                            <td>${discount.precioPromocional.toFixed(2)}</td> {/* Formato de moneda */}
                            <td>
                                <span className={`${styles.statusPill} ${discount.activo ? styles.active : styles.inactive}`}>
                                    {discount.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                <button onClick={() => onEditDiscount(discount)} className={styles.editButton}>
                                    Editar
                                </button>
                                <button
                                    onClick={() => onToggleDiscountActive(discount.id!, discount.activo, discount.denominacion)}
                                    className={discount.activo ? styles.deactivateButton : styles.activateButton}
                                >
                                    {discount.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={() => onDeleteDiscount(discount)} className={styles.deleteButton}>
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
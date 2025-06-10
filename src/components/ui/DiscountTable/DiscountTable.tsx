import React from 'react';
import styles from './DiscountTable.module.css';
import { format } from 'date-fns'; // Se utiliza para formatear las fechas.
import { DescuentoDTO } from '../../dto/DescuentoDTO'; // Interfaz para los datos del descuento.

/**
 * Propiedades esperadas por el componente DiscountTable.
 */
interface DiscountTableProps {
    discounts: DescuentoDTO[]; // Array de objetos de descuento a mostrar.
    loading: boolean; // Booleano que indica si los datos están cargando.
    error: string | null; // Mensaje de error si la carga falla.
    onEditDiscount: (discount: DescuentoDTO) => void; // Función callback para editar un descuento.
    onToggleDiscountActive: (id: number, currentStatus: boolean, denominacion: string) => void; // Función callback para cambiar el estado activo/inactivo de un descuento.
    onDeleteDiscount: (discount: DescuentoDTO) => void; // Función callback para eliminar un descuento.
}

/**
 * `DiscountTable` es un componente funcional que renderiza una tabla
 * para la gestión de descuentos en el panel de administración.
 */
export const DiscountTable: React.FC<DiscountTableProps> = ({
    discounts,
    loading,
    error,
    onEditDiscount,
    onToggleDiscountActive,
    onDeleteDiscount,
}) => {
    // Muestra un mensaje de carga mientras se obtienen los datos.
    if (loading) {
        return <p className={styles.message}>Cargando descuentos...</p>;
    }

    // Muestra un mensaje de error si la carga de descuentos falla.
    if (error) {
        return <p className={styles.errorMessage}>Error al cargar descuentos: {error}</p>;
    }

    // Muestra un mensaje si no hay descuentos para mostrar.
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
                        <th>Precio Promocional</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {discounts.map((discount) => (
                        <tr key={discount.id}>
                            <td>{discount.id}</td>
                            <td>{discount.denominacion}</td>
                            {/* Formatea las fechas a 'dd/MM/yyyy' */}
                            <td>{format(new Date(discount.fechaDesde), 'dd/MM/yyyy')}</td>
                            <td>{format(new Date(discount.fechaHasta), 'dd/MM/yyyy')}</td>
                            {/* Muestra solo la parte de la hora (HH:mm) */}
                            <td>{discount.horaDesde.substring(0, 5)}</td>
                            <td>{discount.horaHasta.substring(0, 5)}</td>
                            <td>{discount.descripcionDescuento}</td>
                            {/* Muestra el precio promocional formateado a dos decimales */}
                            <td>${discount.precioPromocional.toFixed(2)}</td>
                            <td>
                                {/* Muestra el estado del descuento con un estilo visual */}
                                <span className={`${styles.statusPill} ${discount.activo ? styles.active : styles.inactive}`}>
                                    {discount.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                {/* Botón para editar el descuento */}
                                <button onClick={() => onEditDiscount(discount)} className={styles.editButton}>
                                    Editar
                                </button>
                                {/* Botón para activar/desactivar el descuento */}
                                <button
                                    onClick={() => onToggleDiscountActive(discount.id!, discount.activo, discount.denominacion)}
                                    className={discount.activo ? styles.deactivateButton : styles.activateButton}
                                >
                                    {discount.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                {/* Botón para eliminar el descuento */}
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

import React from 'react';
import styles from './SalesTable.module.css'; // Estilos CSS Modules para la tabla de ventas
import { OrdenCompraDTO } from '../../dto/OrdenCompraDTO'; // DTO para la Orden de Compra, se espera que incluya usuarioInfoDTO

// Interfaz que define las propiedades del componente SalesTable
interface SalesTableProps {
    orders: OrdenCompraDTO[]; // Un array de objetos OrdenCompraDTO a mostrar en la tabla
    onViewDetails: (orderId: number) => void; // Función para manejar el evento de ver detalles de una orden
}

// Componente funcional SalesTable
export const SalesTable: React.FC<SalesTableProps> = ({ orders, onViewDetails }) => {
    return (
        // Contenedor principal de la tabla
        <div className={styles.tableContainer}>
            {/* Renderizado condicional: si no hay órdenes, muestra un mensaje */}
            {orders.length === 0 ? (
                <p className={styles.noOrdersMessage}>No hay órdenes de venta disponibles.</p>
            ) : (
                // Si hay órdenes, renderiza la tabla
                <table className={styles.salesTable}>
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            {/* Columna para mostrar el nombre y apellido del cliente */}
                            <th>Cliente</th>
                            <th>Fecha Compra</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Tipo Envío</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Mapea cada orden para crear una fila en la tabla */}
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                {/* Muestra el nombre y apellido del cliente, o 'N/A' si no están definidos */}
                                <td>{order.usuarioInfoDTO?.nombre || 'N/A'} {order.usuarioInfoDTO?.apellido || ''}</td>
                                {/* Formatea la fecha de compra a un formato de fecha local */}
                                <td>{new Date(order.fechaCompra).toLocaleDateString()}</td>
                                {/* Muestra el total de la orden formateado a 2 decimales */}
                                <td>${order.total.toFixed(2)}</td>
                                <td>{order.estadoOrden}</td>
                                <td>{order.shippingOption}</td>
                                <td>
                                    {/* Botón para ver los detalles de la orden, que llama a onViewDetails con el ID de la orden */}
                                    <button
                                        className={styles.detailButton}
                                        onClick={() => onViewDetails(order.id)}
                                    >
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
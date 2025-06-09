import React from 'react';
import styles from './SalesTable.module.css';
import { OrdenCompraDTO } from '../../dto/OrdenCompraDTO'; // Asegúrate de que OrdenCompraDTO incluye usuarioInfoDTO

interface SalesTableProps {
    orders: OrdenCompraDTO[];
    onViewDetails: (orderId: number) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ orders, onViewDetails }) => {
    return (
        <div className={styles.tableContainer}>
            {orders.length === 0 ? (
                <p className={styles.noOrdersMessage}>No hay órdenes de venta disponibles.</p>
            ) : (
                <table className={styles.salesTable}>
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>Cliente</th> {/* <<< AGREGADO: Mostrar nombre y apellido del cliente */}
                            {/* <th>Usuario ID</th> Eliminar o mantener según preferencia, si ya mostramos nombre y apellido */}
                            <th>Fecha Compra</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Tipo Envío</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                {/* Mostrar el nombre y apellido del usuario */}
                                <td>{order.usuarioInfoDTO?.nombre || 'N/A'} {order.usuarioInfoDTO?.apellido || ''}</td>
                                {/* <td>{order.usuarioId}</td> */}
                                <td>{new Date(order.fechaCompra).toLocaleDateString()}</td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>{order.estadoOrden}</td>
                                <td>{order.shippingOption}</td>
                                <td>
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
import React from 'react';
import styles from './SaleDetailModal.module.css';
import { OrdenCompraDTO } from '../../../dto/OrdenCompraDTO'; // Asegúrate de que esta ruta sea correcta y que OrdenCompraDTO incluye usuarioInfoDTO

interface SaleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrdenCompraDTO;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ isOpen, onClose, order }) => {
    if (!isOpen) {
        return null;
    }

    const estadoOrdenDisplay = order.estadoOrden || 'Desconocido';
    const shippingOptionDisplay = order.shippingOption || 'N/A';

    // Estos campos ('formaPago' y 'horaEstimadaFin') NO están en tu DTO de backend ni en la entidad.
    // Si necesitas mostrarlos, deben ser añadidos al OrdenCompraDTO en el backend.
    const formaPagoDisplay = 'MercadoPago';
    // Acceso a los datos de la dirección anidada
    const domicilioCalle = order.nuevaDireccion?.calle || 'N/A';
    const domicilioNumero = order.nuevaDireccion?.numero || '';
    const domicilioPiso = order.nuevaDireccion?.piso ? `Piso ${order.nuevaDireccion.piso}` : '';
    const domicilioDepto = order.nuevaDireccion?.departamento ? `Depto ${order.nuevaDireccion.departamento}` : '';

    const domicilioLocalidad = order.nuevaDireccion?.localidad?.nombre || 'N/A';
    const domicilioProvincia = order.nuevaDireccion?.localidad?.provincia?.nombre || 'N/A';

    // ¡¡¡CAMBIO CLAVE AQUÍ PARA ACCEDER A LA INFORMACIÓN DEL USUARIO!!!
    const clienteNombreDisplay = order.usuarioInfoDTO?.nombre || 'N/A';
    const clienteApellidoDisplay = order.usuarioInfoDTO?.apellido || 'N/A';
    const clienteEmailDisplay = order.usuarioInfoDTO?.email || 'N/A';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.modalTitle}>Detalles de la Orden #{order.id}</h2>

                <div className={styles.detailSection}>
                    <h3>Información de la Orden</h3>
                    <p><strong>Fecha:</strong> {new Date(order.fechaCompra).toLocaleString()}</p>
                    <p><strong>Estado:</strong> <span className={`${styles.statusBadge} ${styles[estadoOrdenDisplay.toLowerCase().replace(/_/g, '')]}`}>{estadoOrdenDisplay}</span></p>
                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    <p><strong>Tipo de Envío:</strong> {shippingOptionDisplay}</p>
                    <p><strong>Forma de Pago:</strong> {formaPagoDisplay}</p>
                </div>

                <div className={styles.detailSection}>
                    <h3>Datos del Cliente</h3>
                    {/* Mostrar nombre y apellido del cliente */}
                    <p><strong>Nombre:</strong> {clienteNombreDisplay}</p>
                    <p><strong>Apellido:</strong> {clienteApellidoDisplay}</p>
                    <p><strong>Email:</strong> {clienteEmailDisplay}</p>
                    <p><strong>Teléfono:</strong> {order.buyerPhoneNumber}</p>
                    <p><strong>Domicilio:</strong> {domicilioCalle} {domicilioNumero}, {domicilioPiso} {domicilioDepto} - {domicilioLocalidad}, {domicilioProvincia}</p>
                </div>

                <div className={styles.detailSection}>
                    <h3>Productos en la Orden</h3>
                    {order.detalles && order.detalles.length > 0 ? (
                        <table className={styles.productsTable}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Color</th>
                                    <th>Talle</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.detalles.map((detalle) => (
                                    <tr key={detalle.id}>
                                        <td>{detalle.productoDetalle?.productoDenominacion || 'N/A'}</td>
                                        <td>{detalle.productoDetalle?.color || 'N/A'}</td>
                                        <td>{detalle.productoDetalle?.talle || 'N/A'}</td>
                                        <td>{detalle.cantidad}</td>
                                        <td>${detalle.precioUnitario.toFixed(2)}</td>
                                        <td>${detalle.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay detalles de productos para esta orden.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
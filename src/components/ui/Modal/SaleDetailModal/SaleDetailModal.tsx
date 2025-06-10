
import React from 'react';
import styles from './SaleDetailModal.module.css'; // Estilos CSS Modules para el modal
import { OrdenCompraDTO } from '../../../dto/OrdenCompraDTO'; // DTO para la Orden de Compra, asegúrate que incluye usuarioInfoDTO

// Interfaz que define las propiedades del componente SaleDetailModal
interface SaleDetailModalProps {
    isOpen: boolean; // Controla si el modal está visible
    onClose: () => void; // Función para cerrar el modal
    order: OrdenCompraDTO; // Objeto de tipo OrdenCompraDTO con los detalles de la orden
}

// Componente funcional SaleDetailModal
export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ isOpen, onClose, order }) => {
    // Si el modal no está abierto, no renderiza nada
    if (!isOpen) {
        return null;
    }

    // Determina el estado de la orden a mostrar, usando 'Desconocido' si no está definido
    const estadoOrdenDisplay = order.estadoOrden || 'Desconocido';
    // Determina la opción de envío a mostrar, usando 'N/A' si no está definida
    const shippingOptionDisplay = order.shippingOption || 'N/A';

    // Nota: 'formaPago' y 'horaEstimadaFin' no están en el DTO de backend.
    // Si se requieren, deben ser añadidos en el backend y el DTO correspondiente.
    const formaPagoDisplay = 'MercadoPago'; // Valor fijo por ahora

    // Acceso a los datos de la dirección de envío, con valores por defecto 'N/A' o vacíos si no están definidos
    const domicilioCalle = order.nuevaDireccion?.calle || 'N/A';
    const domicilioNumero = order.nuevaDireccion?.numero || '';
    // Muestra 'Piso X' o vacío si no hay piso
    const domicilioPiso = order.nuevaDireccion?.piso ? `Piso ${order.nuevaDireccion.piso}` : '';
    // Muestra 'Depto X' o vacío si no hay departamento
    const domicilioDepto = order.nuevaDireccion?.departamento ? `Depto ${order.nuevaDireccion.departamento}` : '';

    // Acceso a la localidad y provincia anidadas, con 'N/A' si no están definidas
    const domicilioLocalidad = order.nuevaDireccion?.localidad?.nombre || 'N/A';
    const domicilioProvincia = order.nuevaDireccion?.localidad?.provincia?.nombre || 'N/A';

    // Acceso a la información del usuario del DTO, con 'N/A' si no está definida
    const clienteNombreDisplay = order.usuarioInfoDTO?.nombre || 'N/A';
    const clienteApellidoDisplay = order.usuarioInfoDTO?.apellido || 'N/A';
    const clienteEmailDisplay = order.usuarioInfoDTO?.email || 'N/A';

    return (
        // Overlay del modal que se cierra al hacer click fuera del contenido
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Contenido principal del modal, se detiene la propagación del evento para evitar cierre al hacer click dentro */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Botón para cerrar el modal */}
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {/* Título del modal que muestra el ID de la orden */}
                <h2 className={styles.modalTitle}>Detalles de la Orden #{order.id}</h2>

                {/* Sección de información general de la orden */}
                <div className={styles.detailSection}>
                    <h3>Información de la Orden</h3>
                    {/* Muestra la fecha de compra formateada localmente */}
                    <p><strong>Fecha:</strong> {new Date(order.fechaCompra).toLocaleString()}</p>
                    {/* Muestra el estado de la orden con un estilo dinámico basado en el estado */}
                    <p><strong>Estado:</strong> <span className={`${styles.statusBadge} ${styles[estadoOrdenDisplay.toLowerCase().replace(/_/g, '')]}`}>{estadoOrdenDisplay}</span></p>
                    {/* Muestra el total de la orden formateado a 2 decimales */}
                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    {/* Muestra el tipo de envío */}
                    <p><strong>Tipo de Envío:</strong> {shippingOptionDisplay}</p>
                    {/* Muestra la forma de pago (actualmente fija) */}
                    <p><strong>Forma de Pago:</strong> {formaPagoDisplay}</p>
                </div>

                {/* Sección de datos del cliente */}
                <div className={styles.detailSection}>
                    <h3>Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> {clienteNombreDisplay}</p>
                    <p><strong>Apellido:</strong> {clienteApellidoDisplay}</p>
                    <p><strong>Email:</strong> {clienteEmailDisplay}</p>
                    <p><strong>Teléfono:</strong> {order.buyerPhoneNumber}</p>
                    {/* Muestra la dirección completa del cliente, incluyendo piso y departamento si existen */}
                    <p><strong>Domicilio:</strong> {domicilioCalle} {domicilioNumero}, {domicilioPiso} {domicilioDepto} - {domicilioLocalidad}, {domicilioProvincia}</p>
                </div>

                {/* Sección de productos en la orden */}
                <div className={styles.detailSection}>
                    <h3>Productos en la Orden</h3>
                    {/* Condicional para renderizar la tabla de productos si hay detalles */}
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
                                {/* Mapea los detalles de la orden para mostrar cada producto */}
                                {order.detalles.map((detalle) => (
                                    <tr key={detalle.id}>
                                        {/* Muestra el nombre del producto, color y talle */}
                                        <td>{detalle.productoDetalle?.productoDenominacion || 'N/A'}</td>
                                        <td>{detalle.productoDetalle?.color || 'N/A'}</td>
                                        <td>{detalle.productoDetalle?.talle || 'N/A'}</td>
                                        <td>{detalle.cantidad}</td>
                                        {/* Muestra el precio unitario y subtotal formateados */}
                                        <td>${detalle.precioUnitario.toFixed(2)}</td>
                                        <td>${detalle.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        // Mensaje si no hay productos en la orden
                        <p>No hay detalles de productos para esta orden.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
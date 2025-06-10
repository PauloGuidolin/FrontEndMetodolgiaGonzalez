import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css'; // Importa el CSS compartido

const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [orderDetails, setOrderDetails] = useState<any>(null); // Reemplaza 'any' con tu DTO de Orden

    useEffect(() => {
        if (orderId) {
            console.log(`Obteniendo detalles para la orden ID: ${orderId}`);
            // Aquí deberías realizar la llamada a tu backend para obtener los detalles completos de la orden
            const fetchOrderDetails = async () => {
                try {
                    // Reemplaza con la URL real de tu API
                    const response = await fetch(`http://localhost:8080/api/orders/${orderId}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener los detalles de la orden.');
                    }
                    const data = await response.json();
                    setOrderDetails(data);
                } catch (error) {
                    console.error("Hubo un error al cargar los detalles de la orden:", error);
                    // Opcional: mostrar un mensaje de error al usuario
                }
            };
            fetchOrderDetails();
        }
    }, [orderId]);


    return (
        <div className={styles.statusContainer}> {/* Aplica la clase del contenedor */}
            <h1 className={styles.successTitle}>¡Gracias por tu compra!</h1> {/* Clase para el color del título */}
            <p>Tu orden ha sido confirmada exitosamente.</p>
            {orderId && (
                <h2 className={styles.orderIdHighlight}>Número de Orden: <strong>#{orderId}</strong></h2> 
            )}
            {orderDetails && (
                <div className={styles.orderDetails}> {/* Aplica la clase para detalles adicionales */}
                    {/* Mostrar más detalles de la orden aquí si se obtienen */}
                    <p><strong>Monto Total:</strong> ${orderDetails.montoTotal ? orderDetails.montoTotal.toFixed(2) : 'N/A'}</p>
                    <p><strong>Estado:</strong> {orderDetails.estado || 'N/A'}</p>
                    <p><strong>Dirección de Envío:</strong> {orderDetails.direccionEnvio || 'N/A'}</p>
                    {/* Agrega más campos según la estructura de tu DTO de orden */}
                </div>
            )}
            <p>Hemos enviado una confirmación a tu correo electrónico.</p>
            <Link to="/HomeScreen" className={styles.actionLink}> {/* Clase para el enlace/botón */}
                Continuar Comprando
            </Link>
        </div>
    );
};

export default OrderConfirmation;
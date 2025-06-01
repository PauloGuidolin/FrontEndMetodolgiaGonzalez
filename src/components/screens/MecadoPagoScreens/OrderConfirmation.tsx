// src/pages/OrderConfirmation.tsx (Esta es la página que faltaba)
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [orderDetails, setOrderDetails] = useState<any>(null); // Reemplaza 'any' con tu DTO de Orden

    useEffect(() => {
        if (orderId) {
            // En una aplicación real, deberías obtener los detalles de la orden de tu backend
            // usando el orderId para mostrar información específica.
            // Por ahora, solo mostraremos el ID.
            console.log(`Obteniendo detalles para la orden ID: ${orderId}`);
            // Ejemplo:
            // const fetchOrder = async () => {
            //     try {
            //         const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            //         const data = await response.json();
            //         setOrderDetails(data);
            //     } catch (error) {
            //         console.error("Error al obtener detalles de la orden:", error);
            //     }
            // };
            // fetchOrder();
        }
    }, [orderId]);


    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu orden ha sido confirmada exitosamente.</p>
            {orderId && (
                <h2>Número de Orden: <strong>#{orderId}</strong></h2>
            )}
            {orderDetails && (
                <div>
                    {/* Mostrar más detalles de la orden aquí si se obtienen */}
                    <p>Monto Total: {orderDetails.montoTotal}</p>
                    <p>Dirección de Envío: {orderDetails.direccionEnvio}</p>
                </div>
            )}
            <p>Hemos enviado una confirmación a tu correo electrónico.</p>
            <Link to="/orders" style={{ marginRight: '10px' }}>Ver mis Pedidos</Link>
            <Link to="/HomeScreen">Continuar Comprando</Link>
        </div>
    );
};

export default OrderConfirmation;
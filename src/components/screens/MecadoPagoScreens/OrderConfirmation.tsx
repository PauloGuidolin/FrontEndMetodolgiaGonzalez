// Archivo: src/components/screens/MecadoPagoScreens/OrderConfirmation.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './PaymentStatus.module.css'; // Importa el CSS compartido

// Define una interfaz para el DTO de OrdenCompra si la tienes en el frontend
// Si no, puedes usar 'any' temporalmente, pero es recomendable definirla.
interface OrdenCompraDTO {
    id: number;
    total: number;
    fechaCompra: string; // O Date
    estadoOrden: string;
    direccionEnvio?: string; // Podría ser un objeto de DireccionDTO
    mercadopagoPreferenceId?: string;
    mercadopagoPaymentId?: string;
    // ... otros campos que tu backend devuelve para una orden
}

// Interfaz para la respuesta de tu backend /process-payment-result
interface BackendPaymentResponse {
    message: string;
    newStatus: string; // 'PAGADA', 'PENDIENTE_PAGO', 'RECHAZADA'
}

const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams<{ orderId?: string }>(); // orderId puede ser opcional al principio
    const location = useLocation(); // Hook para acceder a la URL y query params
    const navigate = useNavigate(); // Hook para navegar programáticamente

    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null); // Estado del pago según MP/Backend
    const [orderDetails, setOrderDetails] = useState<OrdenCompraDTO | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processOrder = async () => {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams(location.search);
            const collection_id = queryParams.get('collection_id');
            const collection_status = queryParams.get('collection_status');
            const external_reference = queryParams.get('external_reference'); // Tu ID de orden de compra
            const preference_id = queryParams.get('preference_id');

            // Caso 1: Redirección desde Mercado Pago (contiene query parameters)
            if (collection_id && external_reference && preference_id) {
                console.log("Mercado Pago redirection detected with params:", {
                    collection_id, collection_status, external_reference, preference_id
                });

                try {
                    // Llama a tu backend para procesar el resultado final del pago
                    const response = await fetch(`http://localhost:8080/api/payments/process-payment-result?collection_id=${collection_id}&collection_status=${collection_status}&external_reference=${external_reference}&preference_id=${preference_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // Puedes añadir headers de autenticación si los necesitas (ej. un token JWT)
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al procesar el pago en el backend.');
                    }

                    const data: BackendPaymentResponse = await response.json();
                    setStatusMessage(data.message);
                    setPaymentStatus(data.newStatus);
                    console.log("Backend payment processing response:", data);

                    // Una vez que el backend procesa y confirma, redirige a una URL limpia
                    // con el ID de la orden para que el componente pueda cargar los detalles.
                    // Usa replace: true para no guardar la URL con query params en el historial.
                    navigate(`/order-confirmation/${external_reference}`, { replace: true });

                } catch (err: any) {
                    console.error("Error al procesar el pago de Mercado Pago:", err);
                    setError(err.message || "No se pudo verificar el estado del pago.");
                    setLoading(false); // Detener la carga en caso de error
                }
            }
            // Caso 2: Navegación directa a /order-confirmation/:orderId (sin query params de MP)
            else if (orderId) {
                console.log(`Navegación directa a detalles de orden ID: ${orderId}`);
                try {
                    // Llama a tu backend para obtener los detalles completos de la orden
                    // ⭐⭐⭐⭐ CAMBIO A LA URL CORRECTA PARA TU BACKEND ⭐⭐⭐⭐
                    const response = await fetch(`http://localhost:8080/orden_compra/dto/${orderId}`);
                    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
                    if (!response.ok) {
                        throw new Error('Error al obtener los detalles de la orden.');
                    }
                    const data: OrdenCompraDTO = await response.json();
                    setOrderDetails(data);
                    setStatusMessage(`Orden #${data.id} - Estado: ${data.estadoOrden}`);
                    setPaymentStatus(data.estadoOrden); // Sincroniza el estado del pago con el de la orden
                    console.log("Order details loaded:", data);
                } catch (err: any) {
                    console.error("Hubo un error al cargar los detalles de la orden:", err);
                    setError(err.message || "No se pudieron cargar los detalles de la orden.");
                } finally {
                    setLoading(false);
                }
            }
            // Caso 3: No hay orderId ni query params de MP
            else {
                setError("No se encontraron detalles de la orden para confirmar. URL inválida.");
                setLoading(false);
            }
        };

        processOrder();
    }, [location.search, orderId, navigate]); // Dependencias: re-ejecutar si cambian los query params o el orderId

    if (loading) {
        return (
            <div className={`${styles.statusContainer} ${styles.loading}`}>
                <h2>Procesando su orden...</h2>
                <p>Por favor, espere un momento mientras confirmamos su pago.</p>
                {/* Opcional: spinner de carga */}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.statusContainer} ${styles.error}`}>
                <h1 className={styles.errorTitle}>¡Ocurrió un error!</h1>
                <p>{error}</p>
                <p>Si cree que esto es un error, por favor, contacte a soporte.</p>
                <Link to="/HomeScreen" className={styles.actionLink}>Volver al Inicio</Link>
            </div>
        );
    }

    // Renderizado basado en el estado final del pago/orden
    const renderStatusContent = () => {
        switch (paymentStatus) {
            case 'PAGADA':
                return (
                    <div className={`${styles.statusContainer} ${styles.success}`}>
                        <h1 className={styles.successTitle}>¡Gracias por tu compra!</h1>
                        <p className="lead">Tu pago ha sido **aprobado** y tu orden ha sido confirmada exitosamente.</p>
                        {orderDetails && (
                            <h2 className={styles.orderIdHighlight}>Número de Orden: <strong>#{orderDetails.id}</strong></h2>
                        )}
                        {orderDetails ? (
                            <div className={styles.orderDetails}>
                                <p><strong>Monto Total:</strong> ${orderDetails.total ? orderDetails.total.toFixed(2) : 'N/A'}</p>
                                <p><strong>Estado Actual:</strong> {orderDetails.estadoOrden || 'N/A'}</p>
                                <p><strong>Fecha de Compra:</strong> {new Date(orderDetails.fechaCompra).toLocaleDateString()}</p>
                                {/* Puedes añadir más detalles aquí */}
                            </div>
                        ) : (
                            <p>Cargando detalles de la orden...</p>
                        )}
                        <p>Hemos enviado una confirmación a tu correo electrónico.</p>
                        <Link to="/HomeScreen" className={styles.actionLink}>Continuar Comprando</Link>
                    </div>
                );
            case 'PENDIENTE_PAGO':
                return (
                    <div className={`${styles.statusContainer} ${styles.pending}`}>
                        <h1 className={styles.pendingTitle}>Pago Pendiente</h1>
                        <p className="lead">Tu pago está **pendiente de aprobación** o requiere acción adicional.</p>
                        {orderDetails && (
                             <h2 className={styles.orderIdHighlight}>Número de Orden: <strong>#{orderDetails.id}</strong></h2>
                        )}
                        {orderDetails ? (
                            <div className={styles.orderDetails}>
                                <p><strong>Monto Total:</strong> ${orderDetails.total ? orderDetails.total.toFixed(2) : 'N/A'}</p>
                                <p><strong>Estado Actual:</strong> {orderDetails.estadoOrden || 'N/A'}</p>
                                <p><strong>Fecha de Compra:</strong> {new Date(orderDetails.fechaCompra).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p>Cargando detalles de la orden...</p>
                        )}
                        <p>Recibirás una notificación cuando el estado de tu pago cambie.</p>
                        <Link to="/UserProfile" className={`${styles.actionLink} ${styles.primaryButton}`}>Ver mis pedidos</Link>
                        <Link to="/HomeScreen" className={styles.actionLink}>Volver al Inicio</Link>
                    </div>
                );
            case 'RECHAZADA':
                return (
                    <div className={`${styles.statusContainer} ${styles.failure}`}>
                        <h1 className={styles.failureTitle}>¡Pago Rechazado!</h1>
                        <p className="lead">Lo sentimos, tu pago ha sido **rechazado**.</p>
                        {orderDetails && (
                             <h2 className={styles.orderIdHighlight}>Número de Orden: <strong>#{orderDetails.id}</strong></h2>
                        )}
                         {orderDetails ? (
                            <div className={styles.orderDetails}>
                                <p><strong>Monto Total:</strong> ${orderDetails.total ? orderDetails.total.toFixed(2) : 'N/A'}</p>
                                <p><strong>Estado Actual:</strong> {orderDetails.estadoOrden || 'N/A'}</p>
                                <p><strong>Fecha de Compra:</strong> {new Date(orderDetails.fechaCompra).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p>No se pudo cargar la información de la orden.</p>
                        )}
                        <p>Por favor, intenta con otro método de pago o revisa la información de tu tarjeta.</p>
                        <Link to="/CartScreen" className={`${styles.actionLink} ${styles.primaryButton}`}>Intentar de nuevo</Link>
                        <Link to="/HelpScreen" className={styles.actionLink}>Necesito Ayuda</Link>
                    </div>
                );
            default:
                return (
                    <div className={`${styles.statusContainer} ${styles.unknown}`}>
                        <h1 className={styles.unknownTitle}>Estado de la Orden Desconocido</h1>
                        <p className="lead">No se pudo determinar el estado exacto de tu orden en este momento.</p>
                        <p>Por favor, verifica el estado en tu perfil de usuario o contacta a soporte.</p>
                        {orderId && (
                            <h2 className={styles.orderIdHighlight}>ID de Referencia: <strong>#{orderId}</strong></h2>
                        )}
                        <Link to="/UserProfile" className={`${styles.actionLink} ${styles.primaryButton}`}>Ver mis pedidos</Link>
                        <Link to="/HomeScreen" className={styles.actionLink}>Volver al Inicio</Link>
                    </div>
                );
        }
    };

    return renderStatusContent();
};

export default OrderConfirmation;
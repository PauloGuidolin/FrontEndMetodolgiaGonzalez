import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCartStore } from '../../../store/cartStore';
// Este componente no necesita estilos directamente porque redirige casi inmediatamente.
// Mantenemos el div base por si hay un ligero retraso en la redirección.

const CheckoutSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const collectionStatus = queryParams.get('collection_status'); // 'approved', 'rejected', 'pending'
        const paymentId = queryParams.get('payment_id');
        const externalReference = queryParams.get('external_reference'); // Este sería el ID de tu orden

        if (collectionStatus === 'approved') {
            toast.success(`Pago aprobado. ID de pago: ${paymentId}. Orden: ${externalReference}.`);
            clearCart(); // Limpiar el carrito en pago exitoso
            navigate(`/order-confirmation/${externalReference}`, { replace: true });
        } else if (collectionStatus === 'rejected') {
            toast.error(`Pago rechazado. Motivo: ${queryParams.get('reason')}.`);
            navigate('/checkout/failure', { replace: true });
        } else if (collectionStatus === 'pending') {
            toast.info(`Pago pendiente. ID de pago: ${paymentId}.`);
            navigate('/checkout/pending', { replace: true });
        } else {
            toast.info("Pago procesado. Verifique el estado de su orden.");
            navigate('/orders', { replace: true });
        }
    }, [location, navigate, clearCart]);

    return (
        // Se mantiene el estilo inline básico, ya que este componente es una página de "carga"
        // y se redirige rápidamente. Los estilos compartidos se aplicarán en las páginas de destino.
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Procesando tu pago...</h1>
            <p>Por favor, espera mientras confirmamos el estado de tu transacción.</p>
        </div>
    );
};

export default CheckoutSuccess;
// src/pages/CheckoutFailure.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutFailure: React.FC = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>¡El pago ha fallado!</h1>
            <p>Hubo un problema al procesar tu pago. Por favor, intenta de nuevo o contacta a soporte.</p>
            <Link to="/cart">Volver al Carrito</Link>
        </div>
    );
};

export default CheckoutFailure;
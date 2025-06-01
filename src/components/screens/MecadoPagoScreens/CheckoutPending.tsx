// src/pages/CheckoutPending.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutPending: React.FC = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Tu pago está pendiente.</h1>
            <p>Mercado Pago está procesando tu transacción. Recibirás una confirmación por correo electrónico cuando se apruebe.</p>
            <Link to="/HomeScreen">Volver al Inicio</Link>
        </div>
    );
};

export default CheckoutPending;
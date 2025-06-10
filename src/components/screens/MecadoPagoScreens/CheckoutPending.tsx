import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css'; // Importa el CSS compartido

const CheckoutPending: React.FC = () => {
    return (
        <div className={styles.statusContainer}> {/* Aplica la clase del contenedor */}
            <h1 className={styles.pendingTitle}>Tu pago está pendiente.</h1> {/* Clase para el color del título */}
            <p>Mercado Pago está procesando tu transacción. Recibirás una confirmación por correo electrónico cuando se apruebe.</p>
            <Link to="/HomeScreen" className={styles.actionLink}> {/* Clase para el enlace/botón */}
                Volver al Inicio
            </Link>
        </div>
    );
};

export default CheckoutPending;
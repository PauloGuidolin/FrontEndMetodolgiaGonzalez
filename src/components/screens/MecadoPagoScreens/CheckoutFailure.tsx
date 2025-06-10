import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PaymentStatus.module.css'; // Importa el CSS compartido

const CheckoutFailure: React.FC = () => {
    return (
        <div className={styles.statusContainer}> {/* Aplica la clase del contenedor */}
            <h1 className={styles.failureTitle}>¡El pago ha fallado!</h1> {/* Clase para el color del título */}
            <p>Hubo un problema al procesar tu pago. Por favor, intenta de nuevo o contacta a soporte.</p>
            <Link to="/cart" className={styles.actionLink}> {/* Clase para el enlace/botón */}
                Volver al Carrito
            </Link>
        </div>
    );
};

export default CheckoutFailure;
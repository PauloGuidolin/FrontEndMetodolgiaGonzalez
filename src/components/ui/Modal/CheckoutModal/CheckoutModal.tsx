import React from 'react';
import styles from './CheckoutModal.module.css';

// Define los tipos para las props del modal (puedes ajustarlos si necesitas más datos)
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number; // Pasamos el subtotal para mostrarlo en el resumen
  // Podrías añadir más props aquí para pasar datos de envío, descuentos, etc.
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, subtotal }) => {
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // Función para manejar el clic en el overlay y cerrar el modal
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic fue directamente en el overlay (no en el contenido del modal), cerrar
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Formatear el subtotal a moneda local (Argentina)
  const formattedSubtotal = subtotal.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  return (
    // Overlay que cubre toda la pantalla
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      {/* Contenido principal del modal */}
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Detalle del pedido</h2>
        </div>

        <div className={styles.modalBody}>
          {/* Sección de Envío - Lado Izquierdo */}
          <div className={styles.shippingSection}>
            <h3>Envío</h3>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Teléfono</label>
              <input type="text" id="phone" placeholder="Ingrese número de teléfono..." className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Dirección</label>
              <input type="text" id="address" placeholder="Ingrese la dirección..." className={styles.inputField} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="department">Departamento</label>
              <input type="text" id="department" placeholder="Departamento..." className={styles.inputField} />
            </div>

            {/* Sección de Método de Pago - Lado Izquierdo */}
            <h3 className={styles.paymentTitle}>Método de pago</h3>
            <div className={styles.paymentMethods}>
              <div className={styles.radioGroup}>
                <input type="radio" id="mercadopago" name="paymentMethod" value="mercadopago" />
                <label htmlFor="mercadopago">Mercado Pago</label>
              </div>
            </div>

            <button className={styles.confirmButton}>
              Confirmar la compra
            </button>
          </div>

          {/* Resumen del Pedido - Lado Derecho */}
          <div className={styles.orderSummary}>
            <h2>Resumen del Pedido</h2>
            <div className={styles.summaryItem}>
              <span>Subtotal:</span>
              <span>{formattedSubtotal}</span> {/* Usamos el subtotal pasado por props */}
            </div>
            <div className={styles.summaryItem}>
              <span>Envío:</span>
              <span>Costo a calcular</span>
            </div>
             {/* Otros costos - Placeholder basado en la imagen */}
             <div className={styles.summaryItem}>
              <span>Otros costos:</span>
              <span>$0.00</span> {/* Placeholder */}
            </div>
            <div className={styles.summaryTotal}>
              <span>Total Estimado:</span>
               <span>{formattedSubtotal}</span> {/* Por ahora es igual al subtotal */}
            </div>
            <button className={styles.proceedToPaymentButton}>
              Proceder al pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
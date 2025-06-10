import React, { useState } from "react";
import styles from "./CartScreen.module.css";
import { toast } from "react-toastify";

import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import CartCard from "../../ui/Cards/CartCard/CartCard";
import CheckoutModal from "../../ui/Modal/CheckoutModal/CheckoutModal";

import { useCartStore } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";

import RegisterModal from "../../ui/Modal/Register/RegisterModal";
import LoginModal from "../../ui/Modal/LogIn/LoginModal";

/**
 * Componente principal para la pantalla del carrito de compras.
 * Permite visualizar los productos en el carrito, ajustar cantidades, eliminarlos,
 * y proceder al pago, requiriendo autenticación si el usuario no ha iniciado sesión.
 */
const CartScreen: React.FC = () => {
  // Obtiene estados y acciones del store de carrito (Zustand).
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  // Obtiene estados del store de autenticación (Zustand).
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Estados locales para controlar la visibilidad de los modales.
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  /**
   * Abre el modal de checkout si el carrito no está vacío y el usuario está autenticado.
   * De lo contrario, muestra un mensaje de advertencia o abre el modal de inicio de sesión.
   */
  const openCheckoutModal = () => {
    // Verifica si el carrito está vacío.
    if (cartItems.length === 0) {
      toast.info("Tu carrito está vacío.");
      return;
    }

    // Si el usuario está autenticado, abre el modal de checkout.
    if (isAuthenticated && user) {
      setIsCheckoutModalOpen(true);
    } else {
      // Si no está autenticado, pide iniciar sesión y abre el modal de login.
      toast.info("Debes iniciar sesión para proceder con el pago.");
      setIsLoginModalOpen(true);
    }
  };

  /**
   * Cierra el modal de checkout.
   */
  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  /**
   * Abre el modal de inicio de sesión y cierra el de registro.
   */
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  /**
   * Cierra el modal de inicio de sesión.
   */
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  /**
   * Abre el modal de registro y cierra el de inicio de sesión.
   */
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  /**
   * Cierra el modal de registro.
   */
  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  /**
   * Callback que se ejecuta al iniciar sesión exitosamente.
   * Cierra el modal de login y abre el modal de checkout.
   */
  const onLoginSuccess = () => {
    closeLoginModal();
    setIsCheckoutModalOpen(true);
  };

  /**
   * Maneja el cambio de cantidad de un producto en el carrito.
   * @param productoDetalleId - El ID del detalle del producto a actualizar.
   * @param newQuantity - La nueva cantidad deseada del producto.
   */
  const handleQuantityChange = (
    productoDetalleId: number,
    newQuantity: number
  ) => {
    // Si la nueva cantidad es menor a 1, el producto se elimina del carrito.
    if (newQuantity < 1) {
      removeFromCart(productoDetalleId);
      return;
    }

    // Busca el ítem en el carrito para verificar el stock.
    const itemInCart = cartItems.find(
      (item) => item.productDetail.id === productoDetalleId
    );

    // Si el producto existe y la nueva cantidad excede el stock disponible, muestra una advertencia.
    if (itemInCart && newQuantity > itemInCart.productDetail.stockActual) {
      toast.warn(
        `No hay suficiente stock para ${itemInCart.product.denominacion} (color: ${itemInCart.productDetail.color}, talle: ${itemInCart.productDetail.talle}). Stock disponible: ${itemInCart.productDetail.stockActual}`
      );
      return;
    }

    // Actualiza la cantidad del producto en el carrito.
    updateQuantity(productoDetalleId, newQuantity);
  };

  /**
   * Maneja la eliminación de un producto del carrito.
   * @param productoDetalleId - El ID del detalle del producto a eliminar.
   */
  const handleRemove = (productoDetalleId: number) => {
    removeFromCart(productoDetalleId);
  };

  // Calcula el subtotal total de los productos en el carrito.
  const subtotal = getTotalPrice();

  // Formatea el subtotal a la moneda local (ARS).
  const formattedSubtotal = subtotal.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={styles.containerPrincipal}>
      <Header />
      {/* Contenedor principal del layout del carrito */}
      <div className={styles.cartContainer}>
        <div className={styles.cartContent}>
          {/* Lista de productos en el carrito */}
          <div className={styles.productList}>
            {cartItems.map((item) => (
              <CartCard
                key={item.productDetail.id}
                product={item.product}
                productDetail={item.productDetail}
                quantity={item.quantity}
                onQuantityChange={(newQuantity) =>
                  handleQuantityChange(item.productDetail.id!, newQuantity)
                }
                onRemove={() => handleRemove(item.productDetail.id!)}
              />
            ))}
            {/* Mensaje cuando el carrito está vacío */}
            {cartItems.length === 0 && (
              <p className={styles.emptyCart}>Tu carrito está vacío.</p>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className={styles.orderSummary}>
            <h2>Resumen del Pedido</h2>
            <div className={styles.summaryItem}>
              <span>Subtotal:</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Envío:</span>
              <span>Costo a calcular</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Descuentos:</span>
              <span>$0.00</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total Estimado:</span>
              <span>{formattedSubtotal}</span>
            </div>
            {/* Botón para proceder al pago, deshabilitado si el carrito está vacío */}
            <button
              className={styles.checkoutButton}
              onClick={openCheckoutModal}
              disabled={cartItems.length === 0}
            >
              Proceder al pago
            </button>
            {/* Mensaje para usuarios no autenticados cuando hay productos en el carrito */}
            {!isAuthenticated && cartItems.length > 0 && (
              <p className={styles.authMessage}>
                Inicia sesión para continuar con el pago.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {/* Modal de checkout */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        subtotal={subtotal}
        user={isAuthenticated ? user : null}
      />
      {/* Modal de inicio de sesión */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onRegisterClick={openRegisterModal}
        onLoginSuccess={onLoginSuccess}
      />
      {/* Modal de registro (solo se renderiza si está abierto) */}
      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={closeRegisterModal}
          onLoginClick={openLoginModal}
        />
      )}
    </div>
  );
};

export default CartScreen;
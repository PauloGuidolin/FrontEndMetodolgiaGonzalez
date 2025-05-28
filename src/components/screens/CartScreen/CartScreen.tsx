import React, { useState } from "react";
import styles from "./CartScreen.module.css";
import { toast } from "react-toastify";

import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import CartCard from "../../ui/Cards/CartCard/CartCard";
import CheckoutModal from "../../ui/Modal/CheckoutModal/CheckoutModal";


import { useCartStore } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";
import { CreateOrdenCompraDTO } from "../../dto/OrdenCompraDTO";

import { useNavigate } from "react-router-dom";
import { orderService } from "../../../https/orderApi";
import RegisterModal from "../../ui/Modal/Register/RegisterModal";
import LoginModal from "../../ui/Modal/LogIn/LoginModal";

const CartScreen: React.FC = () => {
    const cartItems = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);
    const clearCart = useCartStore((state) => state.clearCart);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Nuevo estado para el LoginModal
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false); // Nuevo estado para el RegisterModal
    const navigate = useNavigate();

    const openCheckoutModal = () => {
        if (cartItems.length === 0) {
            toast.info("Tu carrito está vacío.");
            return;
        }

        if (isAuthenticated && user) {
            setIsCheckoutModalOpen(true);
        } else {
            toast.info("Debes iniciar sesión para proceder con el pago.");
            setIsLoginModalOpen(true); // Abre el modal de login si no está autenticado
        }
    };

    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
    };

    // Funciones para manejar los modales de Login/Register
    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false); // Asegúrate de que el modal de registro esté cerrado
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false); // Asegúrate de que el modal de login esté cerrado
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    // Callback que se ejecuta cuando el login es exitoso desde el LoginModal
    const onLoginSuccess = () => {
        closeLoginModal(); // Cierra el modal de login
        setIsCheckoutModalOpen(true); // Abre el modal de checkout automáticamente
    };

    const handleQuantityChange = (
        productoDetalleId: number,
        newQuantity: number
    ) => {
        if (newQuantity < 1) {
            removeFromCart(productoDetalleId);
            return;
        }

        const itemInCart = cartItems.find(item => item.productDetail.id === productoDetalleId);
        if (itemInCart && newQuantity > itemInCart.productDetail.stockActual) {
            toast.warn(`No hay suficiente stock para ${itemInCart.product.denominacion} (color: ${itemInCart.productDetail.color}, talle: ${itemInCart.productDetail.talle}). Stock disponible: ${itemInCart.productDetail.stockActual}`);
            return;
        }

        updateQuantity(productoDetalleId, newQuantity);
    };

    const handleRemove = (productoDetalleId: number) => {
        removeFromCart(productoDetalleId);
    };

    const subtotal = getTotalPrice();

    const formattedSubtotal = subtotal.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const isCheckoutDisabled = cartItems.length === 0 || !isAuthenticated; // Se mantiene la deshabilitación basada en la autenticación para el botón principal

    const handleConfirmOrder = async (orderData: CreateOrdenCompraDTO) => {
        try {
            if (!orderData.usuarioId) {
                toast.error("Error: ID de usuario no disponible para la orden.");
                throw new Error("ID de usuario no disponible");
            }

            console.log("Enviando orden:", orderData);

            const newOrder = await orderService.createDTO(orderData);
            console.log("Orden creada exitosamente:", newOrder);
            toast.success("Orden de compra creada exitosamente.");

            clearCart();
            closeCheckoutModal();

            navigate('/order-confirmation', { state: { orderId: newOrder.id } });

        } catch (error) {
            console.error("Error al confirmar la orden en CartScreen:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(`Error al procesar tu orden: ${errorMessage}. Por favor, intenta de nuevo.`);
            throw error;
        }
    };

    return (
        <div>
            <div>
                <Header />
            </div>
            <div className={styles.cartContainer}>
                <div className={styles.cartContent}>
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
                        {cartItems.length === 0 && (
                            <p className={styles.emptyCart}>Tu carrito está vacío.</p>
                        )}
                    </div>
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
                        <button
                            className={styles.checkoutButton}
                            onClick={openCheckoutModal}
                            disabled={cartItems.length === 0} // Deshabilitar si el carrito está vacío
                        >
                            Proceder al pago
                        </button>
                        {!isAuthenticated && cartItems.length > 0 && (
                            <p className={styles.authMessage}>
                                Inicia sesión para continuar con el pago.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <Footer />
            </div>

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={closeCheckoutModal}
                subtotal={subtotal}
                user={isAuthenticated ? user : null}
                onConfirmOrder={handleConfirmOrder}
            />

            {/* Renderiza el LoginModal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                onRegisterClick={openRegisterModal} // Permite cambiar a RegisterModal
                onLoginSuccess={onLoginSuccess} // Pasa el callback para reabrir CheckoutModal
            />

            {/* Renderiza el RegisterModal si lo tienes */}
            {/* Si aún no tienes RegisterModal, puedes quitar esta parte por ahora */}
            {isRegisterModalOpen && (
                <RegisterModal
                    isOpen={isRegisterModalOpen}
                    onClose={closeRegisterModal}
                    onLoginClick={openLoginModal} // Permite cambiar a LoginModal
                    // onRegisterSuccess={...} // Si quieres auto-login o cerrar ambos modales, similar a onLoginSuccess
                />
            )}
        </div>
    );
};

export default CartScreen;
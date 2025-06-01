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

const CartScreen: React.FC = () => {
    const cartItems = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);
    // const clearCart = useCartStore((state) => state.clearCart); // Eliminado: 'clearCart' no se usa

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    // const navigate = useNavigate(); // Eliminado: 'navigate' no se usa

   const openCheckoutModal = () => {
    console.log("Intentando abrir el modal de checkout...");
    console.log("Elementos en el carrito:", cartItems.length);
    console.log("Usuario autenticado:", isAuthenticated);
    console.log("Objeto user:", user);

    if (cartItems.length === 0) {
        toast.info("Tu carrito está vacío.");
        return;
    }

    if (isAuthenticated && user) {
        console.log("Usuario autenticado y carrito no vacío. Abriendo CheckoutModal.");
        setIsCheckoutModalOpen(true);
    } else {
        console.log("Usuario no autenticado. Abriendo LoginModal.");
        toast.info("Debes iniciar sesión para proceder con el pago.");
        setIsLoginModalOpen(true);
    }
};
    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
    };

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    const onLoginSuccess = () => {
        closeLoginModal();
        setIsCheckoutModalOpen(true);
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
                            disabled={cartItems.length === 0}
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
                subtotal={subtotal} // Esto es lo que estás enviando
                user={isAuthenticated ? user : null}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                onRegisterClick={openRegisterModal}
                onLoginSuccess={onLoginSuccess}
            />

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
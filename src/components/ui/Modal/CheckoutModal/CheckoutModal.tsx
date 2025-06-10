// CheckoutModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./CheckoutModal.module.css";
import { useCartStore } from "../../../../store/cartStore";
import { useAuthStore } from "../../../../store/authStore";
import { useMercadoPagoStore } from "../../../../store/mercadoPagoStore";
import { UserDTO } from "../../../dto/UserDTO";
import { DireccionDTO } from "../../../dto/DireccionDTO";
import { toast } from "react-toastify";
import { LocalidadDTO, ProvinciaDTO } from "../../../dto/location";
import { CreateOrdenCompraDetalleDTO, MercadoPagoItemRequestDTO, MercadoPagoPreferenceRequestDTO } from "../../../dto/MercadoPagoDTOs";
import InputField from "../../InputField/InputField";
import { AddressForm } from "../AddressForm/AddressForm";
import { formatCurrency } from "../../../../types/formatUtils";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    user: UserDTO | null;
}

const ivaPercentage = 0.21; // 21% de IVA

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, subtotal, user }) => {
    const { items: cartItems, clearCart } = useCartStore();
    const { fetchUser } = useAuthStore();

    const {
        initPoint,
        isLoading: loadingPaymentProcess,
        error: paymentError,
        createPreference,
        resetState,
    } = useMercadoPagoStore();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [selectedShippingOption, setSelectedShippingOption] =
        useState<"delivery" | "pickup">("delivery");

    // Inicializamos selectedAddress para permitir null
    const [selectedAddress, setSelectedAddress] = useState<DireccionDTO | null>(null);

    const currentShippingCost = useMemo(() => {
        return selectedShippingOption === "delivery" ? 500 : 0;
    }, [selectedShippingOption]);

    const ivaAmount = useMemo(() => {
        return subtotal * ivaPercentage;
    }, [subtotal]);

    const totalWithShippingAndTaxes = useMemo(() => {
        return subtotal + ivaAmount + currentShippingCost;
    }, [subtotal, ivaAmount, currentShippingCost]);


    useEffect(() => {
        if (!isOpen) {
            setFirstName("");
            setLastName("");
            setPhone("");
            setEmail("");
            setSelectedShippingOption("delivery");
            setSelectedAddress(null);
            resetState();
            return;
        }

        if (user?.id) {
            fetchUser();
        }
    }, [isOpen, user?.id, fetchUser, resetState]);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstname || "");
            setLastName(user.lastname || "");
            setPhone(user.telefono || "");
            setEmail(user.email || "");

            if (user.addresses && user.addresses.length > 0) {
                console.log(
                    "DEBUG: Usuario tiene direcciones existentes. Cargando primera dirección."
                );
                setSelectedAddress({
                    ...user.addresses[0],
                });
            } else {
                console.log(
                    "DEBUG: Usuario NO tiene direcciones existentes. Empezando con una nueva dirección vacía."
                );
                setSelectedAddress({
                    id: undefined,
                    calle: "",
                    numero: 0,
                    piso: null,
                    departamento: null,
                    cp: 0,
                    localidad: null,
                    active: true
                });
            }
        } else if (isOpen) {
            setFirstName("");
            setLastName("");
            setPhone("");
            setEmail("");
            setSelectedAddress(null);
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (initPoint) {
            window.location.href = initPoint;
            clearCart();
            onClose();
        }
    }, [initPoint, clearCart, onClose]);

    useEffect(() => {
        if (paymentError) {
            toast.error(paymentError);
        }
    }, [paymentError]);

    const handleProceedToPay = useCallback(async () => {
        if (!user || !user.id) {
            toast.error("Debe iniciar sesión para proceder al pago.");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("El carrito está vacío. Agregue productos para continuar.");
            return;
        }

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !phone.trim() ||
            !email.trim()
        ) {
            toast.error(
                "Por favor, complete todos sus datos personales (Nombre, Apellido, Teléfono, Email)."
            );
            return;
        }

        let addressDisplayString: string = "";
        let finalDireccionId: number | null = null;
        let nuevaDireccionData: Partial<DireccionDTO> | null = null;

        if (selectedShippingOption === "delivery") {
            if (
                !selectedAddress ||
                !selectedAddress.calle?.trim() ||
                selectedAddress.numero === undefined ||
                selectedAddress.numero <= 0 ||
                selectedAddress.cp === undefined ||
                selectedAddress.cp <= 0 ||
                !selectedAddress.localidad ||
                !selectedAddress.localidad.id
            ) {
                toast.error(
                    "Por favor, complete todos los campos de la dirección de envío (Calle, Número, Código Postal y Localidad)."
                );
                return;
            }

            addressDisplayString = `${selectedAddress.calle} ${selectedAddress.numero}`;
            if (selectedAddress.piso)
                addressDisplayString += `, Piso: ${selectedAddress.piso}`;
            if (selectedAddress.departamento)
                addressDisplayString += `, Dpto: ${selectedAddress.departamento}`;
            addressDisplayString += `, ${selectedAddress.localidad.nombre}`;
            if (selectedAddress.localidad.provincia?.nombre) {
                addressDisplayString += ` (${selectedAddress.localidad.provincia.nombre})`;
            }
            addressDisplayString += `, CP: ${selectedAddress.cp}`;

            if (selectedAddress.id) {
                finalDireccionId = selectedAddress.id;
                nuevaDireccionData = null;
            } else {
                nuevaDireccionData = {
                    calle: selectedAddress.calle,
                    numero: selectedAddress.numero,
                    piso: selectedAddress.piso,
                    departamento: selectedAddress.departamento,
                    cp: selectedAddress.cp,
                    localidad: selectedAddress.localidad
                        ? ({
                            id: selectedAddress.localidad.id,
                            nombre: selectedAddress.localidad.nombre,
                            provincia: selectedAddress.localidad.provincia ? {
                                id: selectedAddress.localidad.provincia.id,
                                nombre: selectedAddress.localidad.provincia.nombre,
                                active: selectedAddress.localidad.provincia.active || false
                            } as ProvinciaDTO : null,
                            active: selectedAddress.localidad.active || false
                        } as LocalidadDTO)
                        : null,
                    active: true
                };
                finalDireccionId = null;
            }
        } else {
            addressDisplayString = "Retiro en Sucursal";
            finalDireccionId = null;
            nuevaDireccionData = null;
        }

        const detallesOrdenParaMP: CreateOrdenCompraDetalleDTO[] = cartItems.map(
            (item) => ({
                productoDetalleId: item.productDetail.id!,
                cantidad: item.quantity,
                precioUnitario: parseFloat(((item.product.precioFinal || item.product.precioOriginal || 0) * (1 + ivaPercentage)).toFixed(2)),
            })
        );

        const mpItems: MercadoPagoItemRequestDTO[] = cartItems.map((item) => ({
            id: item.productDetail.id?.toString() || "",
            title: `${item.product.denominacion} - ${item.productDetail.color?.nombreColor || ''} - ${item.productDetail.talle?.nombreTalle || ''}`,
            description: `Color: ${item.productDetail.color?.nombreColor || ''}, Talle: ${item.productDetail.talle?.nombreTalle || ''}`,
            pictureUrl:
                item.product.imagenes?.[0]?.url || "https://via.placeholder.com/150",
            categoryId: item.product.categorias?.[0]?.denominacion || "Otros",
            quantity: item.quantity,
            unitPrice: parseFloat(((item.product.precioFinal || item.product.precioOriginal || 0) * (1 + ivaPercentage)).toFixed(2)),
        }));

        const mpRequestData: MercadoPagoPreferenceRequestDTO = {
            items: mpItems,
            external_reference: `orden-${Date.now()}-${user.id}`,
            userId: user.id!,
            payerName: firstName,
            payerLastName: lastName,
            payerEmail: email,
            buyerPhoneNumber: phone,
            shippingOption: selectedShippingOption,
            shippingCost: currentShippingCost,
            
            back_urls: {
                success: `${window.location.origin}/checkout/success`,
                failure: `${window.location.origin}/checkout/failure`,
                pending: `${window.location.origin}/checkout/pending`,
            },
            auto_return: "approved",
            montoTotal: totalWithShippingAndTaxes,
            direccionId: finalDireccionId,
            nuevaDireccion: nuevaDireccionData,
            detalles: detallesOrdenParaMP,
            notification_url: `${import.meta.env.VITE_API_BASE_URL}/mercadopago/webhook`,
        };

        console.log("DEBUG: Datos de la preferencia de MP a enviar:", mpRequestData);

        try {
            await createPreference(mpRequestData);
            toast.success("Redireccionando a Mercado Pago...");
        } catch (error: any) {
            console.error("Error capturado en el componente:", error);
        }
    }, [
        user,
        cartItems,
        firstName,
        lastName,
        phone,
        email,
        selectedShippingOption,
        selectedAddress,
        currentShippingCost,
        totalWithShippingAndTaxes,
        createPreference,
        subtotal,
        ivaAmount
    ]);

    if (!isOpen) return null;

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.isOpen : ''}`}>
            <div className={styles.modalContent}>
                {/* Aquí puedes agregar un encabezado de modal si no lo tienes */}
                <div className={styles.modalHeader}>
                    <h2>Finalizar Compra</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles.modalBodyWrapper}> {/* Este es el contenedor de las dos columnas */}
                    <div className={styles.checkoutFormsSection}> {/* Columna izquierda: Formularios */}
                        {user ? (
                            <>
                                <div className={styles.personalInfoSection}>
                                    <h3>Datos Personales</h3>
                                    <InputField
                                        id="firstName"
                                        label="Nombre"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={styles.inputField}
                                        disabled={!!user?.firstname}
                                    />
                                    <InputField
                                        id="lastName"
                                        label="Apellido"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={styles.inputField}
                                        disabled={!!user?.lastname}
                                    />
                                    <InputField
                                        id="phone"
                                        label="Teléfono"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Ej: 2615551234"
                                        className={styles.inputField}
                                    />
                                    <InputField
                                        id="email"
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ej: tuemail@example.com"
                                        className={styles.inputField}
                                        disabled={!!user?.email}
                                    />
                                </div>

                                <div className={styles.shippingAddressSection}>
                                    <h3>Opciones de Envío</h3>
                                    <div className={styles.paymentMethods}>
                                        <div className={styles.radioGroup}>
                                            <input
                                                type="radio"
                                                id="deliveryOption"
                                                name="shippingOption"
                                                value="delivery"
                                                checked={selectedShippingOption === "delivery"}
                                                onChange={() => setSelectedShippingOption("delivery")}
                                            />
                                            <label htmlFor="deliveryOption">Envío a Domicilio</label>
                                        </div>
                                        <div className={styles.radioGroup}>
                                            <input
                                                type="radio"
                                                id="pickupOption"
                                                name="shippingOption"
                                                value="pickup"
                                                checked={selectedShippingOption === "pickup"}
                                                onChange={() => setSelectedShippingOption("pickup")}
                                            />
                                            <label htmlFor="pickupOption">
                                                Retirar en Sucursal (Gratis)
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {selectedShippingOption === "delivery" && (
                                    <div className={styles.shippingAddressSection}>
                                        <h3>Dirección de Envío</h3>
                                        {user?.addresses && user.addresses.length > 0 ? (
                                            <div className={styles.addressSelection}>
                                                <p>
                                                    Selecciona una dirección existente o ingresa una
                                                    nueva:
                                                </p>
                                                <select
                                                    className={styles.selectField}
                                                    onChange={(e) => {
                                                        const selectedId = e.target.value;
                                                        if (selectedId === "new") {
                                                            console.log(
                                                                "DEBUG: Opción 'Nueva Dirección' seleccionada."
                                                            );
                                                            setSelectedAddress({
                                                                id: undefined,
                                                                calle: "",
                                                                numero: 0,
                                                                piso: null,
                                                                departamento: null,
                                                                cp: 0,
                                                                localidad: null,
                                                                active: true
                                                            });
                                                        } else {
                                                            console.log(
                                                                "DEBUG: Opción de dirección existente seleccionada. ID:",
                                                                selectedId
                                                            );
                                                            const foundAddress = user.addresses?.find(
                                                                (addr) => addr.id?.toString() === selectedId
                                                            );
                                                            setSelectedAddress(foundAddress || null);
                                                        }
                                                    }}
                                                    value={selectedAddress?.id?.toString() || "new"}
                                                >
                                                    <option value="new">
                                                        -- Ingresar Nueva Dirección --
                                                    </option>
                                                    {user.addresses.map((address) => (
                                                        <option
                                                            key={address.id}
                                                            value={address.id?.toString()}
                                                        >
                                                            {address.calle} {address.numero}
                                                            {address.piso && `, Piso: ${address.piso}`}
                                                            {address.departamento &&
                                                                `, Dpto: ${address.departamento}`}
                                                            , {address.localidad?.nombre} (
                                                            {address.localidad?.provincia?.nombre})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <p>Ingresa una nueva dirección de envío:</p>
                                        )}

                                        {selectedAddress && (
                                            <AddressForm
                                                address={selectedAddress}
                                                onAddressChange={(_idx, updatedAddr) =>
                                                    setSelectedAddress(updatedAddr)
                                                }
                                                index={0}
                                                onRemoveAddress={() => {}}
                                                showRemoveButton={false}
                                            />
                                        )}
                                    </div>
                                )}
                                {/* Botón de "Confirmar Compra" dentro de la sección de formularios */}
                                <div className={styles.paymentSection}>
                                    <button
                                        type="button"
                                        className={styles.confirmButton}
                                        onClick={handleProceedToPay}
                                        disabled={loadingPaymentProcess || cartItems.length === 0}
                                    >
                                        {loadingPaymentProcess
                                            ? "Procesando..."
                                            : "Proceder al Pago"}
                                    </button>
                                    {paymentError && (
                                        <p className={styles.errorText}>{paymentError}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className={styles.noUserMessage}>
                                Por favor, inicia sesión para completar tu compra.
                            </p>
                        )}
                    </div>

                    <div className={styles.cartSummarySection}> {/* Columna derecha: Resumen del Pedido */}
                        <h3>Resumen del Pedido</h3>

                        <div className={styles.orderSummary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal (Productos sin IVA):</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>IVA ({ivaPercentage * 100}% de Productos):</span>
                                <span>{formatCurrency(ivaAmount)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Costo de Envío:</span>
                                <span>{formatCurrency(currentShippingCost)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                <span>Total a Pagar:</span>
                                <span>{formatCurrency(totalWithShippingAndTaxes)}</span>
                            </div>
                        </div>
                        {/* Botón "Proceder al pago" en el resumen del pedido */}
                        {/* Se puede duplicar el botón o moverlo aquí si solo debe aparecer en el resumen */}
                        {user && ( // Solo muestra el botón si hay un usuario logueado
                            <button
                                type="button"
                                className={styles.proceedToPaymentButton} // Nueva clase para el botón en el resumen
                                onClick={handleProceedToPay}
                                disabled={loadingPaymentProcess || cartItems.length === 0}
                            >
                                {loadingPaymentProcess
                                    ? "Procesando..."
                                    : "Proceder al Pago"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
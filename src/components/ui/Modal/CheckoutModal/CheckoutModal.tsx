
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./CheckoutModal.module.css"; // Estilos CSS para el modal.
import { useCartStore } from "../../../../store/cartStore"; // Store de Zustand para el carrito de compras.
import { useAuthStore } from "../../../../store/authStore"; // Store de Zustand para la autenticación del usuario.
import { useMercadoPagoStore } from "../../../../store/mercadoPagoStore"; // Store de Zustand para la integración con Mercado Pago.
import { UserDTO } from "../../../dto/UserDTO"; // DTO para la estructura de datos del usuario.
import { DireccionDTO } from "../../../dto/DireccionDTO"; // DTO para la estructura de datos de la dirección.
import { toast } from "react-toastify"; // Para mostrar notificaciones toast.
import { LocalidadDTO, ProvinciaDTO } from "../../../dto/location"; // DTOs para localidad y provincia.
import { CreateOrdenCompraDetalleDTO, MercadoPagoItemRequestDTO, MercadoPagoPreferenceRequestDTO } from "../../../dto/MercadoPagoDTOs"; // DTOs para la solicitud de preferencia de Mercado Pago.
import InputField from "../../InputField/InputField"; // Componente genérico para campos de entrada.
import { AddressForm } from "../AddressForm/AddressForm"; // Componente para el formulario de dirección.
import { formatCurrency } from "../../../../types/formatUtils"; // Utilidad para formatear valores de moneda.

/**
 * Propiedades esperadas por el componente CheckoutModal.
 */
interface CheckoutModalProps {
    isOpen: boolean; // Booleano que controla la visibilidad del modal.
    onClose: () => void; // Función callback para cerrar el modal.
    subtotal: number; // El subtotal de los productos en el carrito (sin IVA ni envío).
    user: UserDTO | null; // El objeto UserDTO del usuario logueado, o null si no hay ninguno.
}

// Porcentaje de IVA fijo para calcular impuestos.
const ivaPercentage = 0.21; // 21% de IVA

/**
 * `CheckoutModal` es un componente de modal que maneja el flujo de checkout.
 * Muestra los datos personales del usuario, opciones de envío, campos de dirección
 * y un resumen del pedido antes de redirigir a Mercado Pago para el pago.
 *
 * @param {CheckoutModalProps} props Las propiedades para controlar el modal y los datos.
 * @returns {JSX.Element | null} El componente modal o null si no está abierto.
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, subtotal, user }) => {
    // Acceso a estados y acciones del store de carrito.
    const { items: cartItems, clearCart } = useCartStore();
    // Acceso a acciones del store de autenticación.
    const { fetchUser } = useAuthStore();

    // Acceso a estados y acciones del store de Mercado Pago.
    const {
        initPoint, // URL de redirección a Mercado Pago.
        isLoading: loadingPaymentProcess, // Estado de carga del proceso de pago.
        error: paymentError, // Mensaje de error del proceso de pago.
        createPreference, // Función para crear la preferencia de pago en Mercado Pago.
        resetState, // Función para resetear el estado del store de Mercado Pago.
    } = useMercadoPagoStore();

    // Estados locales para los datos personales del usuario.
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    // Estado local para la opción de envío seleccionada (delivery o pickup).
    const [selectedShippingOption, setSelectedShippingOption] =
        useState<"delivery" | "pickup">("delivery");

    // Estado local para la dirección de envío seleccionada o ingresada.
    const [selectedAddress, setSelectedAddress] = useState<DireccionDTO | null>(null);

    // Costo de envío calculado dinámicamente según la opción de envío.
    const currentShippingCost = useMemo(() => {
        return selectedShippingOption === "delivery" ? 500 : 0;
    }, [selectedShippingOption]);

    // Cantidad de IVA calculada en base al subtotal.
    const ivaAmount = useMemo(() => {
        return subtotal * ivaPercentage;
    }, [subtotal]);

    // Total a pagar, incluyendo subtotal, IVA y costo de envío.
    const totalWithShippingAndTaxes = useMemo(() => {
        return subtotal + ivaAmount + currentShippingCost;
    }, [subtotal, ivaAmount, currentShippingCost]);


    // Efecto para inicializar estados y limpiar el store al abrir/cerrar el modal.
    useEffect(() => {
        if (!isOpen) {
            // Resetea todos los estados locales a sus valores iniciales cuando el modal se cierra.
            setFirstName("");
            setLastName("");
            setPhone("");
            setEmail("");
            setSelectedShippingOption("delivery");
            setSelectedAddress(null);
            resetState(); // Limpia el estado de Mercado Pago.
            return;
        }

        // Si el modal se abre y hay un usuario logueado, se intenta actualizar sus datos.
        if (user?.id) {
            fetchUser();
        }
    }, [isOpen, user?.id, fetchUser, resetState]);

    // Efecto para cargar los datos del usuario en los campos del formulario.
    useEffect(() => {
        if (user) {
            // Rellena los campos personales con los datos del usuario.
            setFirstName(user.firstname || "");
            setLastName(user.lastname || "");
            setPhone(user.telefono || "");
            setEmail(user.email || "");

            // Carga la primera dirección del usuario si existe, o inicializa una dirección vacía.
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
                    id: undefined, // undefined para indicar que es una nueva dirección.
                    calle: "",
                    numero: 0,
                    piso: null,
                    departamento: null,
                    cp: 0,
                    localidad: null,
                    active: true // Asume que una nueva dirección estará activa.
                });
            }
        } else if (isOpen) {
            // Si no hay usuario, se vacían los campos.
            setFirstName("");
            setLastName("");
            setPhone("");
            setEmail("");
            setSelectedAddress(null);
        }
    }, [user, isOpen]); // Dependencias: `user` y `isOpen`.

    // Efecto para redirigir a Mercado Pago una vez que se obtiene el `initPoint`.
    useEffect(() => {
        if (initPoint) {
            window.location.href = initPoint; // Redirige al usuario.
            clearCart(); // Limpia el carrito después de iniciar el pago.
            onClose(); // Cierra el modal.
        }
    }, [initPoint, clearCart, onClose]);

    // Efecto para mostrar errores de pago.
    useEffect(() => {
        if (paymentError) {
            toast.error(paymentError); // Muestra el mensaje de error.
        }
    }, [paymentError]);

    /**
     * Maneja el proceso de "Proceder al Pago".
     * Realiza validaciones, construye la solicitud de preferencia de Mercado Pago y la envía.
     */
    const handleProceedToPay = useCallback(async () => {
        // Validaciones iniciales
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

        let addressDisplayString: string = ""; // Cadena para la descripción de la dirección.
        let finalDireccionId: number | null = null; // ID de la dirección si es existente.
        let nuevaDireccionData: Partial<DireccionDTO> | null = null; // Datos de una nueva dirección.

        // Lógica condicional basada en la opción de envío.
        if (selectedShippingOption === "delivery") {
            // Validaciones para la dirección de envío si se selecciona "delivery".
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

            // Construye la cadena de visualización de la dirección.
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

            // Determina si la dirección es existente o nueva.
            if (selectedAddress.id) {
                finalDireccionId = selectedAddress.id;
                nuevaDireccionData = null;
            } else {
                // Si es una nueva dirección, se prepara el objeto `DireccionDTO` parcial.
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
                finalDireccionId = null; // No hay ID de dirección si es nueva.
            }
        } else {
            // Si la opción es "pickup", la dirección de envío no es necesaria.
            addressDisplayString = "Retiro en Sucursal";
            finalDireccionId = null;
            nuevaDireccionData = null;
        }

        // Prepara los detalles de la orden para ser enviados al backend.
        const detallesOrdenParaMP: CreateOrdenCompraDetalleDTO[] = cartItems.map(
            (item) => ({
                productoDetalleId: item.productDetail.id!,
                cantidad: item.quantity,
                // Calcula el precio unitario incluyendo IVA.
                precioUnitario: parseFloat(((item.product.precioFinal || item.product.precioOriginal || 0) * (1 + ivaPercentage)).toFixed(2)),
            })
        );

        // Prepara los ítems para la solicitud de Mercado Pago.
        const mpItems: MercadoPagoItemRequestDTO[] = cartItems.map((item) => ({
            id: item.productDetail.id?.toString() || "",
            title: `${item.product.denominacion} - ${item.productDetail.color?.nombreColor || ''} - ${item.productDetail.talle?.nombreTalle || ''}`,
            description: `Color: ${item.productDetail.color?.nombreColor || ''}, Talle: ${item.productDetail.talle?.nombreTalle || ''}`,
            pictureUrl:
                item.product.imagenes?.[0]?.url || "https://via.placeholder.com/150", // URL de la primera imagen o un placeholder.
            categoryId: item.product.categorias?.[0]?.denominacion || "Otros", // Categoría principal o "Otros".
            quantity: item.quantity,
            // Precio unitario con IVA para Mercado Pago.
            unitPrice: parseFloat(((item.product.precioFinal || item.product.precioOriginal || 0) * (1 + ivaPercentage)).toFixed(2)),
        }));

        // Construye el objeto de solicitud de preferencia de Mercado Pago.
        const mpRequestData: MercadoPagoPreferenceRequestDTO = {
            items: mpItems,
            external_reference: `orden-${Date.now()}-${user.id}`, // Referencia única para la orden.
            userId: user.id!,
            payerName: firstName,
            payerLastName: lastName,
            payerEmail: email,
            buyerPhoneNumber: phone,
            shippingOption: selectedShippingOption,
            shippingCost: currentShippingCost,

            back_urls: {
                success: `${window.location.origin}/checkout/success`, // URL de retorno para pago exitoso.
                failure: `${window.location.origin}/checkout/failure`, // URL de retorno para pago fallido.
                pending: `${window.location.origin}/checkout/pending`, // URL de retorno para pago pendiente.
            },
            auto_return: "approved", // Redirige automáticamente al éxito.
            montoTotal: totalWithShippingAndTaxes, // Monto total de la compra.
            direccionId: finalDireccionId, // ID de la dirección existente.
            nuevaDireccion: nuevaDireccionData, // Datos de la nueva dirección (si aplica).
            detalles: detallesOrdenParaMP, // Detalles de los ítems de la orden.
            notification_url: `${import.meta.env.VITE_API_BASE_URL}/mercadopago/webhook`, // URL para notificaciones de Mercado Pago.
        };

        console.log("DEBUG: Datos de la preferencia de MP a enviar:", mpRequestData);

        try {
            await createPreference(mpRequestData); // Envía la solicitud para crear la preferencia.
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

    // Si el modal no está abierto, no renderiza nada.
    if (!isOpen) return null;

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.isOpen : ''}`}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Finalizar Compra</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times; {/* Botón para cerrar el modal */}
                    </button>
                </div>

                <div className={styles.modalBodyWrapper}> {/* Contenedor de dos columnas */}
                    <div className={styles.checkoutFormsSection}> {/* Columna izquierda: Formularios */}
                        {user ? (
                            <>
                                {/* Sección de Datos Personales */}
                                <div className={styles.personalInfoSection}>
                                    <h3>Datos Personales</h3>
                                    <InputField
                                        id="firstName"
                                        label="Nombre"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={styles.inputField}
                                        disabled={!!user?.firstname} // Deshabilita si el nombre ya está en el usuario.
                                    />
                                    <InputField
                                        id="lastName"
                                        label="Apellido"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={styles.inputField}
                                        disabled={!!user?.lastname} // Deshabilita si el apellido ya está en el usuario.
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
                                        disabled={!!user?.email} // Deshabilita si el email ya está en el usuario.
                                    />
                                </div>

                                {/* Sección de Opciones de Envío */}
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

                                {/* Sección de Dirección de Envío (visible solo si se selecciona "delivery") */}
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
                                                    // Valor seleccionado: el ID de la dirección actual o "new".
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

                                        {/* Formulario de dirección (visible solo si selectedAddress no es null) */}
                                        {selectedAddress && (
                                            <AddressForm
                                                address={selectedAddress}
                                                // Cuando cambia la dirección en el formulario hijo, actualiza el estado local.
                                                onAddressChange={(_idx, updatedAddr) =>
                                                    setSelectedAddress(updatedAddr)
                                                }
                                                index={0} // El índice 0 ya que solo se maneja una dirección a la vez aquí.
                                                onRemoveAddress={() => {}} // No se permite eliminar direcciones desde aquí.
                                                showRemoveButton={false} // Oculta el botón de eliminar.
                                            />
                                        )}
                                    </div>
                                )}
                                {/* Botón "Proceder al Pago" en la sección de formularios */}
                                <div className={styles.paymentSection}>
                                    <button
                                        type="button"
                                        className={styles.confirmButton}
                                        onClick={handleProceedToPay}
                                        disabled={loadingPaymentProcess || cartItems.length === 0} // Deshabilitado si está procesando o el carrito está vacío.
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
                        {/* Botón "Proceder al pago" en el resumen del pedido (duplicado para visibilidad si se desea) */}
                        {user && ( // Solo muestra el botón si hay un usuario logueado.
                            <button
                                type="button"
                                className={styles.proceedToPaymentButton} // Nueva clase para el botón en el resumen.
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
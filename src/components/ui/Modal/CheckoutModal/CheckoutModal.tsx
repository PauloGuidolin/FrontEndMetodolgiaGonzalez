import React, { useState, useEffect, useMemo } from "react";
import styles from "./CheckoutModal.module.css";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO";
import { CreateOrdenCompraDTO } from "../../../dto/OrdenCompraDTO";
import { DomicilioDTO } from "../../../dto/DomicilioDTO";
import { useCartStore } from "../../../../store/cartStore";
import { CreateOrdenCompraDetalleDTO } from "../../../dto/OrdenCompraDetalleDTO";

// Definimos un tipo para las opciones de envío
type ShippingOption = "pickup" | "delivery";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    user?: UserDTO | null;
    onConfirmOrder: (orderData: CreateOrdenCompraDTO) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    subtotal,
    user,
    onConfirmOrder,
}) => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [selectedAddress, setSelectedAddress] = useState<DomicilioDTO | null>(
        null
    );
    const [newAddressStreet, setNewAddressStreet] = useState<string>("");
    const [newAddressNumber, setNewAddressNumber] = useState<string>("");
    const [newAddressFloor, setNewAddressFloor] = useState<string>("");
    const [newAddressDepartment, setNewAddressDepartment] = useState<string>("");
    const [newAddressCp, setNewAddressCp] = useState<string>("");

    // Nuevo estado para la opción de envío seleccionada
    // Por defecto, iniciamos con "delivery" para que la dirección se muestre inicialmente
    const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption>("delivery"); 

    const cartItems = useCartStore((state) => state.items);

    // Costos fijos de ejemplo
    const deliveryCost = 800; // Costo de envío a domicilio
    const ivaPercentage = 0.21; // 21% de IVA

    // Calcular el costo de envío basado en la opción seleccionada
    const currentShippingCost = useMemo(() => {
        return selectedShippingOption === "delivery" ? deliveryCost : 0;
    }, [selectedShippingOption, deliveryCost]);

    // Calcular el total con envío e IVA usando useMemo para optimización
    const totalWithShippingAndTaxes = useMemo(() => {
        const ivaAmount = subtotal * ivaPercentage;
        return subtotal + currentShippingCost + ivaAmount;
    }, [subtotal, currentShippingCost, ivaPercentage]);


    useEffect(() => {
        if (isOpen && user) {
            setFirstName(user.firstname || "");
            setLastName(user.lastname || "");
            setPhone(user.telefono || "");

            // Si el usuario tiene direcciones, preselecciona la primera y carga sus datos
            if (user.addresses && user.addresses.length > 0) {
                setSelectedAddress(user.addresses[0]);
                setNewAddressStreet(user.addresses[0].calle || "");
                setNewAddressNumber(user.addresses[0].numero?.toString() || "");
                setNewAddressFloor(user.addresses[0].piso || "");
                setNewAddressDepartment(user.addresses[0].departamento || "");
                setNewAddressCp(user.addresses[0].cp?.toString() || "");
            } else {
                // Si no tiene direcciones, asegúrate de que los campos de nueva dirección estén vacíos
                setSelectedAddress(null);
                setNewAddressStreet("");
                setNewAddressNumber("");
                setNewAddressFloor("");
                setNewAddressDepartment("");
                setNewAddressCp("");
            }
            // Al abrir el modal, siempre queremos que la opción de envío sea "delivery" por defecto
            // para que los campos de dirección sean visibles si el usuario tiene direcciones.
            setSelectedShippingOption("delivery");
        }
    }, [isOpen, user]);

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleConfirmPurchase = async () => {
        if (!user) {
            toast.error("Error: Usuario no autenticado.");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("El carrito está vacío. No se puede crear una orden.");
            return;
        }

        if (!phone.trim()) {
            toast.error("Por favor, ingrese un número de teléfono.");
            return;
        }

        let addressToSend: string = "";
        let newDomicilioDTO: DomicilioDTO | undefined = undefined;

        if (selectedShippingOption === "delivery") {
            // Lógica para Envío a Domicilio: valida y construye la dirección
            if (selectedAddress && user.addresses?.some(addr => addr.id === selectedAddress.id)) {
                addressToSend = `${selectedAddress.calle} ${selectedAddress.numero}, ${selectedAddress.localidad?.nombre}, ${selectedAddress.localidad?.provincia?.nombre}, CP: ${selectedAddress.cp}`;
            } else {
                if (
                    !newAddressStreet.trim() ||
                    !newAddressNumber.trim() ||
                    !newAddressCp.trim()
                ) {
                    toast.error(
                        "Por favor, complete todos los campos de la dirección de envío (Calle, Número, Código Postal)."
                    );
                    return;
                }
                addressToSend = `${newAddressStreet} ${newAddressNumber}`;
                if (newAddressFloor) addressToSend += `, Piso: ${newAddressFloor}`;
                if (newAddressDepartment)
                    addressToSend += `, Dpto: ${newAddressDepartment}`;
                addressToSend += `, CP: ${newAddressCp}`;

                newDomicilioDTO = {
                    calle: newAddressStreet,
                    numero: parseInt(newAddressNumber),
                    piso: newAddressFloor || null,
                    departamento: newAddressDepartment || null,
                    cp: parseInt(newAddressCp),
                    localidad: null, // Asume que la localidad se manejará en el backend o no es necesaria aquí.
                };
            }
        } else {
            // Lógica para Retiro en Sucursal: no se necesita una dirección específica del usuario
            addressToSend = "Retiro en Sucursal"; // Puedes poner la dirección física de la sucursal si quieres.
        }


        const detallesOrden: CreateOrdenCompraDetalleDTO[] = cartItems.map(
            (item) => ({
                productoDetalleId: item.productDetail.id!,
                cantidad: item.quantity,
            })
        );

        const orderData: CreateOrdenCompraDTO = {
            usuarioId: user.id!,
            direccionEnvio: addressToSend, // La dirección o "Retiro en Sucursal"
            telefono: phone,
            detalles: detallesOrden,
            // Si tu DTO de `CreateOrdenCompraDTO` puede recibir estos campos:
            // tipoEnvio: selectedShippingOption,
            // costoEnvio: currentShippingCost,
            // montoTotal: totalWithShippingAndTaxes,
            // nuevaDireccion: newDomicilioDTO, // Solo si es una nueva dirección y relevante para el backend
        };

        console.log("Datos de la orden a enviar:", orderData);

        try {
            await onConfirmOrder(orderData);
            toast.success(
                "Orden de compra creada exitosamente. Redirigiendo a Mercado Pago..."
            );
            onClose();
        } catch (error) {
            console.error("Error al confirmar la orden:", error);
            toast.error(
                "Hubo un error al procesar tu orden. Por favor, intenta de nuevo."
            );
        }
    };

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.isOpen : ''}`} onClick={handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detalle del pedido</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles.modalBodyWrapper}>
                    {/* Sección de Formularios (Datos Personales, Envío, Pago) - Columna Izquierda */}
                    <div className={styles.checkoutFormsSection}>
                        {/* Sección de Datos Personales */}
                        <div className={styles.personalInfoSection}>
                            <h3>Datos Personales</h3>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">Nombre</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={styles.inputField}
                                    disabled={!!user?.firstname}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">Apellido</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={styles.inputField}
                                    disabled={!!user?.lastname}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Teléfono</label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Ingrese número de teléfono..."
                                    className={styles.inputField}
                                />
                            </div>
                        </div>

                        {/* Sección de Opciones de Envío */}
                        <div className={styles.shippingAddressSection}> {/* Reutilizamos esta clase para agrupar */}
                            <h3>Opciones de Envío</h3>
                            <div className={styles.paymentMethods}> {/* Reutilizamos la clase para radio buttons */}
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
                                    <label htmlFor="pickupOption">Retirar en Sucursal (Gratis)</label>
                                </div>
                            </div>
                        </div>


                        {/* Sección de Dirección de Envío (CONDICIONAL) */}
                        {selectedShippingOption === "delivery" && (
                            <div className={styles.shippingAddressSection}>
                                <h3>Dirección de Envío</h3>
                                {user?.addresses && user.addresses.length > 0 ? (
                                    <div className={styles.addressSelection}>
                                        <p>Selecciona una dirección existente o ingresa una nueva:</p>
                                        <select
                                            className={styles.selectField}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                if (selectedId === "new") {
                                                    setSelectedAddress(null);
                                                    setNewAddressStreet("");
                                                    setNewAddressNumber("");
                                                    setNewAddressFloor("");
                                                    setNewAddressDepartment("");
                                                    setNewAddressCp("");
                                                } else {
                                                    const foundAddress = user.addresses?.find(
                                                        (addr) => addr.id?.toString() === selectedId
                                                    );
                                                    setSelectedAddress(foundAddress || null);
                                                    if (foundAddress) {
                                                        setNewAddressStreet(foundAddress.calle || "");
                                                        setNewAddressNumber(
                                                            foundAddress.numero?.toString() || ""
                                                        );
                                                        setNewAddressFloor(foundAddress.piso || "");
                                                        setNewAddressDepartment(foundAddress.departamento || "");
                                                        setNewAddressCp(foundAddress.cp?.toString() || "");
                                                    }
                                                }
                                            }}
                                            value={selectedAddress?.id?.toString() || (selectedAddress === null ? "new" : "")}
                                        >
                                            <option value="">-- Seleccionar Dirección --</option>
                                            {user.addresses.map((address) => (
                                                <option key={address.id} value={address.id?.toString()}>
                                                    {address.calle} {address.numero}
                                                    {address.piso && `, Piso: ${address.piso}`}
                                                    {address.departamento && `, Dpto: ${address.departamento}`}
                                                    , {address.localidad?.nombre} ({address.localidad?.provincia?.nombre})
                                                </option>
                                            ))}
                                            <option value="new">-- Ingresar Nueva Dirección --</option>
                                        </select>
                                    </div>
                                ) : (
                                    <p>Ingresa una nueva dirección de envío:</p>
                                )}

                                {/* Campos para nueva dirección (solo si no hay dirección seleccionada o se eligió "nueva") */}
                                {(user?.addresses?.length === 0 || selectedAddress === null) && (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="newAddressStreet">Calle</label>
                                            <input
                                                type="text"
                                                id="newAddressStreet"
                                                placeholder="Ej: Av. Siempre Viva"
                                                className={styles.inputField}
                                                value={newAddressStreet}
                                                onChange={(e) => setNewAddressStreet(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="newAddressNumber">Número</label>
                                            <input
                                                type="number"
                                                id="newAddressNumber"
                                                placeholder="Ej: 742"
                                                className={styles.inputField}
                                                value={newAddressNumber}
                                                onChange={(e) => setNewAddressNumber(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="newAddressFloor">Piso (opcional)</label>
                                            <input
                                                type="text"
                                                id="newAddressFloor"
                                                placeholder="Ej: 3"
                                                className={styles.inputField}
                                                value={newAddressFloor}
                                                onChange={(e) => setNewAddressFloor(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="newAddressDepartment">Departamento (opcional)</label>
                                            <input
                                                type="text"
                                                id="newAddressDepartment"
                                                placeholder="Ej: B"
                                                className={styles.inputField}
                                                value={newAddressDepartment}
                                                onChange={(e) => setNewAddressDepartment(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="newAddressCp">Código Postal</label>
                                            <input
                                                type="text"
                                                id="newAddressCp"
                                                placeholder="Ej: 5500"
                                                className={styles.inputField}
                                                value={newAddressCp}
                                                onChange={(e) => setNewAddressCp(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Sección de Método de Pago */}
                        <div className={styles.paymentMethodSection}>
                            <h3>Método de pago</h3>
                            <div className={styles.paymentMethods}>
                                <div className={styles.radioGroup}>
                                    <input
                                        type="radio"
                                        id="mercadopago"
                                        name="paymentMethod"
                                        value="mercadopago"
                                        checked={true}
                                        readOnly
                                    />
                                    <label htmlFor="mercadopago">Mercado Pago</label>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Confirmar Compra */}
                        <button
                            className={styles.confirmButton}
                            onClick={handleConfirmPurchase}
                        >
                            Confirmar la compra
                        </button>
                    </div>

                    {/* Resumen del Pedido - Columna Derecha */}
                    <div className={styles.orderSummary}>
                        <h2>Resumen del Pedido</h2>
                        <div className={styles.summaryItem}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Envío:</span>
                            <span>
                                {selectedShippingOption === "delivery"
                                    ? formatCurrency(currentShippingCost)
                                    : "Gratis"} {/* Ahora solo dice "Gratis" */}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>IVA ({ivaPercentage * 100}%):</span>
                            <span>{formatCurrency(subtotal * ivaPercentage)}</span>
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>Total Estimado:</span>
                            <span>{formatCurrency(totalWithShippingAndTaxes)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
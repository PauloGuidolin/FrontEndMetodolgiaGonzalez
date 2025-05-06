import React, { useState } from "react"; // Importa useState
import styles from "./CartScreen.module.css";

// Importa el nuevo modal y sus tipos (si los creaste en el mismo lugar)


import { Color } from "../../Types/IColor";
import { Talle } from "../../Types/ITalle";
import { Sexo } from "../../Types/ISexo";
import { ICategoria } from "../../Types/ICategoria";
import { IImagen } from "../../Types/IImagen";
import { IProductoDetalle } from "../../Types/IProductoDetalle";
import { IProducto } from "../../Types/IProducto";
import { IDescuento } from "../../Types/IDescuento";
import CartCard from "../../ui/Cards/CartCard/CartCard";
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import CheckoutModal from "../../ui/Modal/CheckoutModal/CheckoutModal";

// ¡OJO! Estos son datos de ejemplo. Deberás conectar esto con tu estado real del carrito.
const ejemploCarrito: {
  productoDetalle: IProductoDetalle;
  cantidad: number;
}[] = [
  {
    productoDetalle: {
      id: 1,
      producto: {
        id: 101,
        denominacion: "Zapatillas Superstar II",
        precioVenta: 50000,
        sexo: Sexo.MASCULINO,
        tienePromocion: false,
        categorias: [{ id: 1, denominacion: "Calzado" } as ICategoria],
        imagenes: [{ id: 10, denominacion: "../../../../images/zapaAdidas.avif" } as IImagen],
        productos_detalles: [],
        descuentos: [],
      } as IProducto,
      color: Color.MARRON,
      talle: Talle.M,
      precioCompra: 30000,
      stockActual: 5,
      stockMaximo: 10,
      cantidad: 1,
    },
    cantidad: 1,
  },
  {
    productoDetalle: {
      id: 2,
      producto: {
        id: 102,
        denominacion: "Remera Algodón",
        precioVenta: 15000,
        sexo: Sexo.FEMENINO,
        tienePromocion: true,
        categorias: [{ id: 2, denominacion: "Ropa" } as ICategoria],
        imagenes: [{ id: 11, denominacion: "../../../../images/camperonBoca.png" } as IImagen],
        productos_detalles: [],
        descuentos: [
          {
            id: 100,
            denominacion: "Promo Verano",
            precioPromocional: 12000, // Usar este precio si tienePromocion es true y hay descuentos
          } as IDescuento,
        ],
      } as IProducto,
      color: Color.AZUL,
      talle: Talle.S,
      precioCompra: 9000,
      stockActual: 10,
      stockMaximo: 20,
      cantidad: 2,
    },
    cantidad: 2,
  },
   { // Otro ítem para probar con el mismo producto pero diferente detalle (si aplica) o solo para tener más items
    productoDetalle: {
      id: 3, // Importante: un ID de detalle de producto único
      producto: {
        id: 103,
        denominacion: "Pantalón Deportivo",
        precioVenta: 30000,
        sexo: Sexo.MASCULINO,
        tienePromocion: false,
        categorias: [{ id: 2, denominacion: "Ropa" } as ICategoria],
        imagenes: [{ id: 12, denominacion: "../../../../images/pantalon.avif" } as IImagen], // Reemplaza con una imagen real
        productos_detalles: [],
        descuentos: [],
      } as IProducto,
      color: Color.NEGRO,
      talle: Talle.L,
      precioCompra: 18000,
      stockActual: 8,
      stockMaximo: 15,
      cantidad: 1,
    },
    cantidad: 1,
  },
];

const CartScreen: React.FC = () => {
  // Estado para controlar la visibilidad del modal de checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Función para abrir el modal
  const openCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
  };

  // Función para cerrar el modal
  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };


  // Aquí iría el estado real del carrito y las funciones para actualizarlo
  // Por ahora, usamos el ejemploCarrito
  const handleQuantityChange = (
    productoDetalleId: number,
    newQuantity: number
  ) => {
    console.log(`Cambiar cantidad de ${productoDetalleId} a ${newQuantity}`);
    // Lógica para actualizar la cantidad en el carrito (ej: actualizando un estado)
    // Debes asegurarte de que newQuantity no sea menor a 1 si quieres evitar cantidad 0 aquí
    // Si newQuantity es 0, probablemente llamarías a handleRemove
  };

  const handleRemove = (productoDetalleId: number) => {
    console.log(`Eliminar producto con ID ${productoDetalleId}`);
    // Lógica para eliminar el item del carrito (ej: filtrando un estado)
  };

  // Calcular el subtotal 
  const subtotal = ejemploCarrito.reduce(
    (acc, item) => {
        const producto = item.productoDetalle.producto;
        let precioUnitario = 0; // Inicializamos con un valor seguro

        if (producto) { // Nos aseguramos de que producto no sea null/undefined
            if (producto.tienePromocion && producto.descuentos && producto.descuentos.length > 0) {
                // Si tiene promoción y descuentos, usamos el precio promocional
                // Usamos ?? 0 para asegurar que precioPromocional sea un número (aunque debería serlo por el tipo)
                precioUnitario = producto.descuentos[0].precioPromocional ?? 0;
            } else {
                // Si no tiene promoción o no hay descuentos válidos, usamos el precio de venta
                // Usamos || 0 para asegurar que precioVenta sea un número si es undefined/null
                precioUnitario = producto.precioVenta || 0;
            }
        }
        // Si producto es null/undefined, precioUnitario se queda en 0, lo cual es correcto para el cálculo.

        // Sumamos al acumulador
        return acc + precioUnitario * item.cantidad;
    },
    0 // Inicializamos el acumulador en 0
  );

   // Formatear el subtotal para mostrar en la pantalla principal
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
            {/* Mapea sobre el carrito de ejemplo */}
            {ejemploCarrito.map((item) => (
              <CartCard
                key={item.productoDetalle.id} // Usa el ID del detalle para la key
                productDetail={item.productoDetalle}
                quantity={item.cantidad}
                onQuantityChange={(newQuantity) =>
                  handleQuantityChange(item.productoDetalle.id!, newQuantity)
                }
                onRemove={() => handleRemove(item.productoDetalle.id!)}
              />
            ))}
            {ejemploCarrito.length === 0 && (
              <p className={styles.emptyCart}>Tu carrito está vacío.</p>
            )}
          </div>
          <div className={styles.orderSummary}>
            <h2>Resumen del Pedido</h2>
            <div className={styles.summaryItem}>
              <span>Subtotal:</span>
              <span>{formattedSubtotal}</span> {/* Muestra el subtotal formateado */}
            </div>
            <div className={styles.summaryItem}>
              <span>Envío:</span>
              <span>Costo a calcular</span>
            </div>
             {/* Aquí podrías calcular y mostrar los descuentos aplicados al total si los hay */}
             <div className={styles.summaryItem}>
               <span>Descuentos:</span>
               {/* Esto requeriría lógica adicional para calcular descuentos sobre el total, no solo por item */}
               <span>$0.00</span>
             </div>
            <div className={styles.summaryTotal}>
              <span>Total Estimado:</span>
               <span>{formattedSubtotal}</span> {/* Por ahora, igual al subtotal */}
            </div>
            <button
              className={styles.checkoutButton}
              disabled={ejemploCarrito.length === 0}
              onClick={openCheckoutModal} // Agrega el handler para abrir el modal
            >
              Proceder al pago
            </button>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>

      {/* Renderiza el modal, pasando el estado y el handler para cerrarlo */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        subtotal={subtotal} // Pasamos el subtotal al modal
      />
    </div>
  );
};

export default CartScreen;
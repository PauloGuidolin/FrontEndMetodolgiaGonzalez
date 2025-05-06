import React from "react";
import styles from "./CartScreen.module.css";

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
        productos_detalles: [], // Podría tener otros detalles (ej: diferentes tallas/colores)
        descuentos: [],
      } as IProducto,
      color: Color.MARRON,
      talle: Talle.M,
      precioCompra: 30000,
      stockActual: 5,
      stockMaximo: 10,
      cantidad: 1, // Cantidad en el carrito (¡OJO! Esto podría manejarse aparte)
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
            precioPromocional: 12000,
          } as IDescuento,
        ],
      } as IProducto,
      color: Color.AZUL,
      talle: Talle.S,
      precioCompra: 9000,
      stockActual: 10,
      stockMaximo: 20,
      cantidad: 2, // Cantidad en el carrito
    },
    cantidad: 2,
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
              precioPromocional: 12000,
            } as IDescuento,
          ],
        } as IProducto,
        color: Color.AZUL,
        talle: Talle.S,
        precioCompra: 9000,
        stockActual: 10,
        stockMaximo: 20,
        cantidad: 2, // Cantidad en el carrito
      },
      cantidad: 2,
  }
  // ... más items en el carrito
];

const CartScreen: React.FC = () => {
  // Aquí iría el estado real del carrito y las funciones para actualizarlo
  const handleQuantityChange = (
    productoDetalleId: number,
    newQuantity: number
  ) => {
    console.log(`Cambiar cantidad de ${productoDetalleId} a ${newQuantity}`);
    // Lógica para actualizar la cantidad en el carrito
  };

  const handleRemove = (productoDetalleId: number) => {
    console.log(`Eliminar producto con ID ${productoDetalleId}`);
    // Lógica para eliminar el item del carrito
  };

  // Calcular el subtotal (ejemplo)
  const subtotal = ejemploCarrito.reduce(
    (acc, item) =>
      acc + (item.productoDetalle.producto?.precioVenta || 0) * item.cantidad,
    0
  );

  return (
        <div>
          <div>
            <Header />
          </div>
          <div className={styles.cartContainer}>
            <div className={styles.cartContent}>
              <div className={styles.productList}>
                {ejemploCarrito.map((item) => (
                  <CartCard
                    key={item.productoDetalle.id}
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
                  <span>${subtotal.toLocaleString("es-AR")}</span>
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
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                <button
                  className={styles.checkoutButton}
                  disabled={ejemploCarrito.length === 0}
                >
                  Proceder al pago
                </button>
              </div>
            </div>
          </div>
          <div>
            <Footer />
          </div>
        </div>
      );
};

export default CartScreen;

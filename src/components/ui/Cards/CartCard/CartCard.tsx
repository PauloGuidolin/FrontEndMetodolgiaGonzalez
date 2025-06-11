import React from "react";
import styles from "./CartCard.module.css";
import { ProductoDTO } from "../../../dto/ProductoDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";

/**
 * Propiedades esperadas por el componente CartCard.
 */
interface CartCardProps {
  product: ProductoDTO; // Datos generales del producto.
  productDetail: ProductoDetalleDTO; // Detalles específicos del producto (color, talle, stock).
  quantity: number; // Cantidad actual del producto en el carrito.
  onQuantityChange: (newQuantity: number) => void; // Callback para cambiar la cantidad.
  onRemove: () => void; // Callback para eliminar el producto del carrito.
}

/**
 * `CartCard` es un componente que muestra un producto individual dentro del carrito de compras,
 * permitiendo ajustar la cantidad y eliminar el artículo.
 */
const CartCard: React.FC<CartCardProps> = ({
  product,
  productDetail,
  quantity,
  onQuantityChange,
  onRemove,
}) => {
  // Obtiene la URL de la primera imagen del producto o usa una imagen por defecto.
  const imageUrl = product.imagenes?.[0]?.url || "/images/default_product.jpg";

  // Accede a la denominación del producto.
  const productName = product.denominacion;

  // Determina el precio a mostrar: `precioFinal` (con promoción) o `precioOriginal`.
  const displayPrice = product.precioFinal || product.precioOriginal || 0;

  // Formatea el precio a moneda argentina (ARS).
  const formattedPrice = displayPrice.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /**
   * Incrementa la cantidad del producto en el carrito, validando contra el stock disponible.
   */
  const handleIncrement = () => {
    if (quantity < productDetail.stockActual) {
      onQuantityChange(quantity + 1);
    }
  };

  /**
   * Decrementa la cantidad del producto en el carrito.
   * La lógica de eliminación si la cantidad llega a 0 debe ser manejada por `onQuantityChange`.
   */
  const handleDecrement = () => {
    onQuantityChange(quantity - 1);
  };

  return (
    <div className={styles.cartCard}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={productName} className={styles.productImage} />
      </div>
      <div className={styles.productInfo}>
        <h4 className={styles.productName}>{productName}</h4>
        {/* Muestra la categoría si existe */}
        {product.categorias && product.categorias[0]?.denominacion && (
          <p className={styles.details}>
            Categoría: {product.categorias[0].denominacion}
          </p>
        )}
        {/* Muestra el género si existe */}
        {product.sexo && (
          <p className={styles.details}>Género: {product.sexo}</p>
        )}
        {/* Muestra el color y el talle, obtenidos del `productDetail` */}
        <p className={styles.details}>
          Color: {productDetail.color.nombreColor}
        </p>
        <p className={styles.details}>
          Talle: {productDetail.talle.nombreTalle}
        </p>

        <p className={styles.productPrice}>Precio Unitario: {formattedPrice}</p>

        {/* Muestra el precio original tachado si hay una promoción activa y el precio final es diferente */}
        {product.tienePromocion &&
          product.precioFinal !== product.precioOriginal && (
            <p className={styles.productOriginalPrice}>
              <del>
                Precio Original: $
                {product.precioOriginal?.toLocaleString("es-AR")}
              </del>
            </p>
          )}

        <div className={styles.quantityControl}>
          <button
            onClick={handleDecrement}
            className={styles.quantityButton}
            disabled={quantity <= 1} // Deshabilita el botón si la cantidad es 1 o menos.
          >
            -
          </button>
          <span className={styles.quantity}>{quantity}</span>
          <button
            onClick={handleIncrement}
            className={styles.quantityButton}
            disabled={quantity >= productDetail.stockActual} // Deshabilita el botón si se alcanza el stock máximo.
          >
            +
          </button>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={onRemove} className={styles.removeButton}>
          <span role="img" aria-label="Eliminar">
            🗑️
          </span>
        </button>
      </div>
    </div>
  );
};

export default CartCard;

import React from "react";
import styles from "./CartCard.module.css";
import { IProductoDetalle } from "../../../../types/IProductoDetalle";

interface CartCardProps {
  productDetail: IProductoDetalle;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  onRemove: () => void;
}

const CartCard: React.FC<CartCardProps> = ({
  productDetail,
  quantity,
  onQuantityChange,
  onRemove,
}) => {
  const handleQuantityChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newQuantity = parseInt(event.target.value);
    onQuantityChange(newQuantity);
  };

  return (
    <div className={styles.cartCard}>
      <div className={styles.imageContainer}>
        {productDetail.producto?.imagenes &&
          productDetail.producto.imagenes[0]?.denominacion && (
            <img
              src={`URL_BASE_DE_IMAGENES/${productDetail.producto.imagenes[0].denominacion}`}
              alt={productDetail.producto.denominacion}
              className={styles.productImage}
            />
          )}
      </div>
      <div className={styles.productDetails}>
        <h3 className={styles.productName}>
          {productDetail.producto?.denominacion}
        </h3>
        {productDetail.producto?.categorias &&
          productDetail.producto.categorias[0]?.denominacion && (
            <p className={styles.productCategory}>
              Categoría: {productDetail.producto.categorias[0].denominacion}
            </p>
          )}
        {productDetail.producto?.sexo && (
          <p className={styles.productGender}>
            Género: {productDetail.producto.sexo}
          </p>
        )}
        <p className={styles.productColor}>Color: {productDetail.color}</p>
        <p className={styles.productSize}>Talle: {productDetail.talle}</p>
        <p className={styles.productPrice}>
          Precio: $
          {productDetail.producto?.precioVenta?.toLocaleString("es-AR")}
        </p>
        {productDetail.producto?.tienePromocion &&
          productDetail.producto.descuentos &&
          productDetail.producto.descuentos[0]?.precioPromocional && (
            <p className={styles.productDiscount}>
              Precio con descuento: $
              {productDetail.producto.descuentos[0].precioPromocional.toLocaleString(
                "es-AR"
              )}
            </p>
          )}
      </div>
      <div className={styles.quantityControls}>
        <label htmlFor={`quantity-${productDetail.id}`}>Cantidad:</label>
        <select
          id={`quantity-${productDetail.id}`}
          value={quantity}
          onChange={handleQuantityChange}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
      </div>
      <button className={styles.removeButton} onClick={onRemove}>
        <span role="img" aria-label="Eliminar">
          🗑️
        </span>
      </button>
    </div>
  );
};

export default CartCard;

import React from "react";
import styles from "./CartCard.module.css";
import { ProductoDTO } from "../../../dto/ProductoDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";


interface CartCardProps {
    product: ProductoDTO;
    productDetail: ProductoDetalleDTO;
    quantity: number;
    onQuantityChange: (newQuantity: number) => void;
    onRemove: () => void;
}

const CartCard: React.FC<CartCardProps> = ({
    product,
    productDetail,
    quantity,
    onQuantityChange,
    onRemove,
}) => {
    // Para la imagen, usamos el 'url' del ImagenDTO que está en el ProductoDTO
    const imageUrl = product.imagenes?.[0]?.url || '/images/default_product.jpg'; // Usar una imagen por defecto si no hay

    // Accedemos a la denominación del producto principal
    const productName = product.denominacion;

    // Calculamos el precio: si tiene promocion, usamos precioFinal, sino, precioOriginal
    // Basándonos en tus DTOs de backend, el precioFinal ya debería reflejar la promoción.
    const displayPrice = product.precioFinal || product.precioOriginal || 0; // Fallback a 0

    const formattedPrice = displayPrice.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const handleIncrement = () => {
        // Validación para no superar el stock disponible para ese detalle de producto
        if (quantity < productDetail.stockActual) {
            onQuantityChange(quantity + 1);
        }
        // Opcional: podrías agregar un toast.warn aquí si el stock es 0 o se alcanzó el límite.
    };

    const handleDecrement = () => {
        // onQuantityChange manejará que si la cantidad llega a 0, se elimine el producto.
        onQuantityChange(quantity - 1);
    };

    return (
        <div className={styles.cartCard}>
            <div className={styles.imageContainer}>
                <img
                    src={imageUrl}
                    alt={productName}
                    className={styles.productImage}
                />
            </div>
            <div className={styles.productInfo}>
                <h4 className={styles.productName}>
                    {productName}
                </h4>
                {/* Categoría: Accedemos directamente desde product.categorias */}
                {product.categorias && product.categorias[0]?.denominacion && (
                    <p className={styles.details}>
                        Categoría: {product.categorias[0].denominacion}
                    </p>
                )}
                {/* Sexo: Accedemos directamente desde product.sexo */}
                {product.sexo && (
                    <p className={styles.details}>
                        Género: {product.sexo}
                    </p>
                )}
                {/* Color y Talle: Accedemos desde productDetail, usando las propiedades correctas */}
                <p className={styles.details}>Color: {productDetail.color.nombreColor}</p> {/* CORREGIDO AQUÍ */}
                <p className={styles.details}>Talle: {productDetail.talle.nombreTalle}</p> {/* CORREGIDO AQUÍ */}

                {/* Mostrar precio final (con o sin promoción) */}
                <p className={styles.productPrice}>
                    Precio Unitario: {formattedPrice}
                </p>

                {/* Si tiene promoción y el precio final es diferente al original, mostrar el original tachado */}
                {product.tienePromocion && product.precioFinal !== product.precioOriginal && (
                    <p className={styles.productOriginalPrice}>
                        <del>Precio Original: ${product.precioOriginal?.toLocaleString("es-AR")}</del>
                    </p>
                )}

                <div className={styles.quantityControl}>
                    <button onClick={handleDecrement} className={styles.quantityButton} disabled={quantity <= 1}>-</button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button onClick={handleIncrement} className={styles.quantityButton} disabled={quantity >= productDetail.stockActual}>+</button>
                </div>
            </div>
            <div className={styles.actions}>
                <button onClick={onRemove} className={styles.removeButton}>
                    <span role="img" aria-label="Eliminar">🗑️</span>
                </button>
            </div>
        </div>
    );
};

export default CartCard;

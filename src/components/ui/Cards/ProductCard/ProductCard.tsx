import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { ProductoDTO } from "../../../dto/ProductoDTO";
import { ImagenDTO } from "../../../dto/ImagenDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";

/**
 * Define las propiedades esperadas por el componente ProductCard.
 */
interface ProductCardProps {
  product: ProductoDTO; // El objeto de datos del producto a mostrar.
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  /**
   * Maneja el clic en la tarjeta del producto, navegando a la página de detalles.
   * Si el producto no tiene ID, se muestra una advertencia en consola.
   */
  const handleCardClick = () => {
    if (product.id !== undefined && product.id !== null) {
      navigate(`/product/${product.id}`); // Navega a la ruta de detalle del producto.
    } else {
      console.warn(
        `Product ${
          product.denominacion || "Unknown Product"
        } has no ID, cannot navigate.`
      );
    }
  };

  // Determina si el producto tiene una promoción activa.
  const hasPromotion = product.tienePromocion ?? false;

  // Extrae nombres de colores únicos de los detalles del producto para mostrarlos.
  const uniqueColors = Array.from(
    new Set(
      Array.isArray(product.productos_detalles)
        ? (product.productos_detalles
            .map((detail: ProductoDetalleDTO) => detail.color?.nombreColor)
            .filter(Boolean) as string[])
        : []
    )
  );

  // Extrae nombres de tallas únicas de los detalles del producto para mostrarlas.
  const uniqueSizes = Array.from(
    new Set(
      Array.isArray(product.productos_detalles)
        ? (product.productos_detalles
            .map((detail: ProductoDetalleDTO) => detail.talle?.nombreTalle)
            .filter(Boolean) as string[])
        : []
    )
  );

  // Obtiene la URL de la primera imagen del producto, o una imagen de placeholder si no hay.
  const firstImageUrl =
    Array.isArray(product.imagenes) &&
    product.imagenes.length > 0 &&
    product.imagenes[0]
      ? (product.imagenes[0] as ImagenDTO).url
      : "https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen";

  // --- Logs de depuración (Mantener para monitoreo de datos del producto) ---
  console.log(`--- Card for product ${product.denominacion || product.id} ---`);
  console.log("   ID:", product.id);
  console.log("   Denominación:", product.denominacion);
  console.log("   precioOriginal:", product.precioOriginal);
  console.log("   precioFinal:", product.precioFinal);
  console.log("   tienePromocion:", product.tienePromocion);
  console.log(
    "   descuento (ID):",
    product.descuento ? product.descuento.id : "N/A"
  );
  console.log(
    "   descuento (activo):",
    product.descuento ? product.descuento.activo : "N/A"
  );
  console.log(
    "   descuento (precioPromocional):",
    product.descuento ? product.descuento.precioPromocional : "N/A"
  );
  console.log("   Imágenes:", product.imagenes);
  console.log("   Detalles de Producto:", product.productos_detalles);
  console.log("   Categorías:", product.categorias);
  console.log("   Colores únicos:", uniqueColors);
  console.log("   Tallas únicas:", uniqueSizes);
  console.log("--------------------------------------------------");

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Indicador de promoción si el producto está en promoción */}
      {hasPromotion && (
        <span className={styles.promotionIndicator}>¡Promoción!</span>
      )}
      <div className={styles.imageContainer}>
        <img
          className={styles.productImage}
          src={firstImageUrl}
          alt={product.denominacion || "Imagen de producto"}
          // Maneja errores de carga de imagen, reemplazando con una imagen de error.
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Evita bucles infinitos de error.
            target.src =
              "https://placehold.co/600x400/E2E8F0/FFFFFF?text=Error+al+cargar+imagen";
            console.error(
              `Error loading image for product: ${
                product.denominacion || "Unknown Product"
              }`,
              "Failed URL:",
              firstImageUrl
            );
          }}
        />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.productName}>
          {product.denominacion || "Producto Desconocido"}
        </div>

        {/* Muestra las categorías del producto si están disponibles */}
        {Array.isArray(product.categorias) && product.categorias.length > 0 && (
          <div className={styles.categoryContainer}>
            {product.categorias.map((categoria: CategoriaDTO, index) => {
              // Genera una key única para cada categoría.
              const key =
                categoria.id !== undefined && categoria.id !== null
                  ? categoria.id
                  : categoria.denominacion || index;
              const categoryName = categoria.denominacion;

              // Valida que el nombre de la categoría sea válido antes de renderizar.
              if (!categoryName || typeof categoryName !== "string") {
                console.warn(
                  "Skipping rendering for invalid category item in ProductCard:",
                  categoria
                );
                return null;
              }

              return (
                <span key={key} className={styles.categoryTag}>
                  {categoryName}
                </span>
              );
            })}
          </div>
        )}

        {/* Muestra los colores y tallas únicos disponibles para el producto */}
        {Array.isArray(product.productos_detalles) &&
          product.productos_detalles.length > 0 && (
            <div className={styles.detailsContainer}>
              {uniqueColors.length > 0 && (
                <div>
                  <strong>Colores:</strong> {uniqueColors.join(", ")}
                </div>
              )}
              {uniqueSizes.length > 0 && (
                <div>
                  <strong>Tallas:</strong> {uniqueSizes.join(", ")}
                </div>
              )}
            </div>
          )}

        {/* Sección de precios, mostrando precio original si hay promoción y precio final */}
        <div className={styles.priceContainer}>
          {/* Muestra el precio original tachado si hay promoción */}
          {hasPromotion &&
            typeof product.precioOriginal === "number" &&
            product.precioOriginal > 0 && (
              <span className={styles.originalPrice}>
                ${product.precioOriginal.toFixed(2)}
              </span>
            )}
          {/* Muestra el precio final. Si no es numérico, usa el precio original o '0.00' */}
          <span className={styles.finalPrice}>
            $
            {typeof product.precioFinal === "number" &&
            product.precioFinal !== null
              ? product.precioFinal.toFixed(2)
              : typeof product.precioOriginal === "number"
              ? product.precioOriginal.toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

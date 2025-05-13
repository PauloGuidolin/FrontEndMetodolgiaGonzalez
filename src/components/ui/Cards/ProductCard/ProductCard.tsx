// Archivo: src/components/ProductCard/ProductCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Usamos react-router-dom para navegación
import { ProductoDTO } from '../../../dto/ProductoDTO'; // Importamos la interfaz del DTO de Producto
import styles from './ProductCard.module.css'; // Importamos el archivo de módulo CSS

// Definimos las props que el componente ProductCard espera recibir
interface ProductCardProps {
  product: ProductoDTO; // El producto a mostrar, usando la interfaz ProductoDTO
}

// Componente funcional ProductCard
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate(); // Hook para la navegación

  // Función para manejar el clic en la tarjeta
  // Podríamos navegar a una página de detalle del producto
  const handleCardClick = () => {
    // Navegar a la ruta del detalle del producto.
    // Asume que tienes una ruta configurada como '/product/:id'
    navigate(`/product/${product.id}`);
    console.log(`Clicked on product: ${product.denominacion}`);
  };

  // Usamos las clases del módulo CSS para estilizar la tarjeta
  return (
    <div
      className={styles.card} // Usamos la clase 'card' del módulo CSS
      onClick={handleCardClick} // Manejador de clic en la tarjeta
    >
      {/* Imagen del producto */}
      {/* Usamos la primera imagen de la lista 'imagenes' del DTO */}
      {/* Añadimos un fallback si no hay imágenes o la URL falla */}
      <div className={styles.imageContainer}> {/* Contenedor de imagen con clase CSS Module */}
        <img
          className={styles.productImage} // Usamos la clase 'productImage' del módulo CSS
          src={product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen'}
          alt={product.denominacion || 'Imagen de producto'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Evita bucles infinitos de error
            target.src = 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Error+al+cargar+imagen'; // Fallback en caso de error de carga
          }}
        />
      </div>


      {/* Contenido de la tarjeta */}
      <div className={styles.cardContent}> {/* Contenido con clase CSS Module */}
        {/* Nombre del producto */}
        <div className={styles.productName}>{product.denominacion}</div> {/* Nombre con clase CSS Module */}

        {/* Categorías del producto */}
        {/* Mostramos las categorías como etiquetas */}
        <div className={styles.categoryContainer}> {/* Contenedor de categorías con clase CSS Module */}
            {product.categorias?.map((categoria, index) => (
                <span key={index} className={styles.categoryTag}> {/* Etiqueta de categoría con clase CSS Module */}
                    {categoria}
                </span>
            ))}
        </div>

        {/* Precio del producto */}
        {/* Mostramos el precio original (si es diferente del final) y el precio final */}
        <div className={styles.priceContainer}> {/* Contenedor de precios con clase CSS Module */}
            {product.tienePromocion && product.precioOriginal !== product.precioFinal && (
                <span className={styles.originalPrice}>${product.precioOriginal?.toFixed(2)}</span> // Precio original con clase CSS Module
            )}
            <span className={styles.finalPrice}>${product.precioFinal?.toFixed(2)}</span> {/* Precio final con clase CSS Module */}
        </div>

        {/* Indicador de promoción (opcional) */}
        {product.tienePromocion && (
             <span className={styles.promotionIndicator}> {/* Indicador de promoción con clase CSS Module */}
                ¡Promoción!
             </span>
        )}
      </div>

      {/* Pie de la tarjeta (opcional) */}
      {/* Si usas el pie, también deberías añadirle una clase del módulo CSS */}
      {/* <div className={styles.cardFooter}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ver Detalles
        </button>
      </div> */}
    </div>
  );
};

export default ProductCard;

// Archivo: src/components/ProductCard/ProductCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ProductoDTO } from '../../../dto/ProductoDTO';
import { ProductoDetalleDTO } from '../../../dto/ProductoDetalleDTO';
import { CategoriaDTO } from '../../../dto/CategoriaDTO';



interface ProductCardProps {
    product: ProductoDTO;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (product.id !== undefined && product.id !== null) {
            navigate(`/product/${product.id}`);
        } else {
            console.warn(`Product ${product.denominacion || 'Unknown Product'} has no ID, cannot navigate.`);
        }
    };

    const hasPromotion = product.tienePromocion ?? false;

    // Extraer colores únicos de los detalles para mostrar
    // Usar product.productos_detalles según el nombre del campo en el DTO
    const uniqueColors = Array.from(new Set(Array.isArray(product.productos_detalles) ? product.productos_detalles.map((detail: ProductoDetalleDTO) => detail.color).filter(Boolean) : []));

    // Extraer tallas únicas de los detalles para mostrar
    // Usar product.productos_detalles según el nombre del campo en el DTO
    const uniqueSizes = Array.from(new Set(Array.isArray(product.productos_detalles) ? product.productos_detalles.map((detail: ProductoDetalleDTO) => detail.talle).filter(Boolean) : []));

    // Obtener la URL de la primera imagen
    // Acceder a la propiedad 'denominacion' del objeto ImagenDTO
    const firstImageUrl = Array.isArray(product.imagenes) && product.imagenes.length > 0 && product.imagenes[0]
        ? product.imagenes[0].denominacion // <--- Acceder a .denominacion para obtener la URL
        : 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen'; // Placeholder si no hay imagen

    // Logs de depuración para verificar los datos recibidos en el frontend
    console.log(`Card for product ${product.denominacion || product.id}:`);
    console.log("  precioOriginal:", product.precioOriginal);
    console.log("  precioFinal:", product.precioFinal);
    console.log("  tienePromocion:", product.tienePromocion);
    console.log("  imagenes:", product.imagenes); // Verifica que sean objetos con denominacion
    console.log("  productos_detalles:", product.productos_detalles); // Verifica que sean objetos
    console.log("  categorias:", product.categorias); // Verifica que sean objetos con id/denominacion


    return (
        <div className={styles.card} onClick={handleCardClick}>
            {hasPromotion && (<span className={styles.promotionIndicator}>¡Promoción!</span>)}
            <div className={styles.imageContainer}>
                <img
                    className={styles.productImage}
                    src={firstImageUrl} // Usar la URL calculada
                    alt={product.denominacion || 'Imagen de producto'}
                    onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Error+al+cargar+imagen'; console.error(`Error loading image for product: ${product.denominacion || 'Unknown Product'}`, 'Failed URL:', firstImageUrl); }}
                />
            </div>

            <div className={styles.cardContent}>
                <div className={styles.productName}>{product.denominacion || 'Producto Desconocido'}</div>

                {/* Categorías - Usar objetos CategoriaDTO y key por ID */}
                {Array.isArray(product.categorias) && product.categorias.length > 0 && (
                    <div className={styles.categoryContainer}>
                        {product.categorias.map((categoria: CategoriaDTO, index) => {
                            // Usar el ID de la categoría como key si está disponible
                            const key = categoria.id !== undefined && categoria.id !== null ? categoria.id : categoria.denominacion || index;
                            const categoryName = categoria.denominacion;

                             if (!categoryName || typeof categoryName !== 'string') {
                                 console.warn("Skipping rendering for invalid category item in ProductCard:", categoria);
                                 return null;
                             }

                            return (
                                <span key={key} className={styles.categoryTag}>{categoryName}</span>
                            );
                        })}
                    </div>
                )}

                {/* Contenedor para Colores y Tallas - Usar product.productos_detalles */}
                {Array.isArray(product.productos_detalles) && product.productos_detalles.length > 0 && (
                    <div className={styles.detailsContainer}>
                        {uniqueColors.length > 0 && (<div><strong>Colores:</strong> {uniqueColors.join(', ')}</div>)}
                        {uniqueSizes.length > 0 && (<div><strong>Tallas:</strong> {uniqueSizes.join(', ')}</div>)}
                    </div>
                )}

                {/* Precio del producto - Mostrar Original si hay promo, siempre mostrar Final */}
                <div className={styles.priceContainer}>
                    {/* Muestra precio original (del DTO) si tiene promoción y es un número válido */}
                    {hasPromotion && typeof product.precioOriginal === 'number' && product.precioOriginal > 0 && (
                         <span className={styles.originalPrice}>${product.precioOriginal.toFixed(2)}</span>
                    )}
                    {/* Muestra el precio final (del DTO), usando precioOriginal como fallback si precioFinal es null */}
                    {/* Asegurarse de que el precio final sea un número válido antes de toFixed */}
                    <span className={styles.finalPrice}>
                        ${typeof product.precioFinal === 'number'
                            ? product.precioFinal.toFixed(2)
                            : (typeof product.precioOriginal === 'number' ? product.precioOriginal.toFixed(2) : '0.00') // Fallback a original si final no es numérico
                        }
                    </span>
                </div>

            </div>

        </div>
    );
};

export default ProductCard;

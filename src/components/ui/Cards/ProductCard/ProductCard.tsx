// src/components/ProductCard/ProductCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ProductoDTO } from '../../../dto/ProductoDTO';
import { ImagenDTO } from '../../../dto/ImagenDTO';
import { CategoriaDTO } from '../../../dto/CategoriaDTO';
import { ProductoDetalleDTO } from '../../../dto/ProductoDetalleDTO';
import { ColorDTO } from '../../../dto/ColorDTO'; // Importar ColorDTO
import { TalleDTO } from '../../../dto/TalleDTO'; // Importar TalleDTO

interface ProductCardProps {
    product: ProductoDTO;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (product.id !== undefined && product.id !== null) {
            navigate(`/product/${product.id}`); // Navega a la ruta de detalle
        } else {
            console.warn(`Product ${product.denominacion || 'Unknown Product'} has no ID, cannot navigate.`);
        }
    };

    const hasPromotion = product.tienePromocion ?? false;

    // Extraer nombres de colores únicos de los detalles para mostrar
    // Asegurarse de que detail.color y detail.talle no sean null/undefined
    const uniqueColors = Array.from(new Set(Array.isArray(product.productos_detalles) ?
        product.productos_detalles
            .map((detail: ProductoDetalleDTO) => detail.color?.nombreColor) // Accede a nombreColor
            .filter(Boolean) as string[] // Filtra los null/undefined y asegura el tipo string[]
        : []
    ));

    // Extraer nombres de tallas únicas de los detalles para mostrar
    const uniqueSizes = Array.from(new Set(Array.isArray(product.productos_detalles) ?
        product.productos_detalles
            .map((detail: ProductoDetalleDTO) => detail.talle?.nombreTalle) // Accede a nombreTalle
            .filter(Boolean) as string[] // Filtra los null/undefined y asegura el tipo string[]
        : []
    ));

    // Obtener la URL de la primera imagen
    const firstImageUrl = Array.isArray(product.imagenes) && product.imagenes.length > 0 && product.imagenes[0]
        ? (product.imagenes[0] as ImagenDTO).url
        : 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen';

    // --- Logs de depuración (¡ESTOS SON MUY IMPORTANTES AHORA!) ---
    console.log(`--- Card for product ${product.denominacion || product.id} ---`);
    console.log("  ID:", product.id);
    console.log("  Denominación:", product.denominacion);
    console.log("  precioOriginal:", product.precioOriginal);
    console.log("  precioFinal:", product.precioFinal);
    console.log("  tienePromocion:", product.tienePromocion);
    console.log("  descuento (ID):", product.descuento ? product.descuento.id : "N/A"); // Check if discount exists
    console.log("  descuento (activo):", product.descuento ? product.descuento.activo : "N/A"); // Check discount active state
    console.log("  descuento (precioPromocional):", product.descuento ? product.descuento.precioPromocional : "N/A"); // Check promotional price
    console.log("  Imágenes:", product.imagenes);
    console.log("  Detalles de Producto:", product.productos_detalles);
    console.log("  Categorías:", product.categorias);
    console.log("  Colores únicos:", uniqueColors);
    console.log("  Tallas únicas:", uniqueSizes);
    console.log("--------------------------------------------------");


    return (
        <div className={styles.card} onClick={handleCardClick}>
            {hasPromotion && (<span className={styles.promotionIndicator}>¡Promoción!</span>)}
            <div className={styles.imageContainer}>
                <img
                    className={styles.productImage}
                    src={firstImageUrl}
                    alt={product.denominacion || 'Imagen de producto'}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://placehold.co/600x400/E2E8F0/FFFFFF?text=Error+al+cargar+imagen';
                        console.error(`Error loading image for product: ${product.denominacion || 'Unknown Product'}`, 'Failed URL:', firstImageUrl);
                    }}
                />
            </div>

            <div className={styles.cardContent}>
                <div className={styles.productName}>{product.denominacion || 'Producto Desconocido'}</div>

                {/* Categorías */}
                {Array.isArray(product.categorias) && product.categorias.length > 0 && (
                    <div className={styles.categoryContainer}>
                        {product.categorias.map((categoria: CategoriaDTO, index) => {
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

                {/* Contenedor para Colores y Tallas */}
                {Array.isArray(product.productos_detalles) && product.productos_detalles.length > 0 && (
                    <div className={styles.detailsContainer}>
                        {uniqueColors.length > 0 && (<div><strong>Colores:</strong> {uniqueColors.join(', ')}</div>)}
                        {uniqueSizes.length > 0 && (<div><strong>Tallas:</strong> {uniqueSizes.join(', ')}</div>)}
                    </div>
                )}

                {/* Precio del producto */}
                <div className={styles.priceContainer}>
                    {/* Muestra precio original (del DTO) si tiene promoción y es un número válido */}
                    {hasPromotion && typeof product.precioOriginal === 'number' && product.precioOriginal > 0 && (
                        <span className={styles.originalPrice}>${product.precioOriginal.toFixed(2)}</span>
                    )}
                    {/* Muestra el precio final (del DTO) */}
                    <span className={styles.finalPrice}>
                        ${typeof product.precioFinal === 'number' && product.precioFinal !== null
                            ? product.precioFinal.toFixed(2)
                            : (typeof product.precioOriginal === 'number' ? product.precioOriginal.toFixed(2) : '0.00') // Fallback a original si final no es numérico o es null
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
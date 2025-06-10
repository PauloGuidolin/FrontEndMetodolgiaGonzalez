import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useProductDetailStore } from "../../../store/productDetailStore";
import { useCartStore } from "../../../store/cartStore";

import styles from "./ProductDetailPage.module.css";
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import { ImagenDTO } from "../../dto/ImagenDTO";
import { ColorDTO } from "../../dto/ColorDTO";
import { TalleDTO } from "../../dto/TalleDTO";
import { ProductoDetalleDTO } from "../../dto/ProductoDetalleDTO"; // Asegúrate de importar ProductoDetalleDTO


const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Hooks de Zustand para el estado del producto y el carrito
    const selectedProduct = useProductDetailStore((state) => state.selectedProduct);
    const loadingProduct = useProductDetailStore((state) => state.loadingProduct);
    const errorProduct = useProductDetailStore((state) => state.errorProduct);
    const fetchProductById = useProductDetailStore((state) => state.fetchProductById);
    const clearSelectedProduct = useProductDetailStore((state) => state.clearSelectedProduct);

    const selectedProductDetail = useProductDetailStore((state) => state.selectedProductDetail);
    const loadingDetail = useProductDetailStore((state) => state.loadingDetail);
    const errorDetail = useProductDetailStore((state) => state.errorDetail);
    const fetchProductDetailByProductTalleColor = useProductDetailStore((state) => state.fetchProductDetailByProductTalleColor);
    const clearSelectedProductDetail = useProductDetailStore((state) => state.clearSelectedProductDetail);

    const addToCart = useCartStore((state) => state.addToCart);

    // Estados locales del componente
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedTalleId, setSelectedTalleId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);

    // Efecto para cargar el producto al montar y limpiar al desmontar
    useEffect(() => {
        if (id) {
            fetchProductById(Number(id));
        }
        return () => {
            clearSelectedProduct();
            clearSelectedProductDetail();
        };
    }, [id, fetchProductById, clearSelectedProduct, clearSelectedProductDetail]);

    // Calcula todas las opciones de colores disponibles para el producto (únicos por ID)
    // Estos son todos los colores que tiene el producto, sin importar stock o talle.
    const allUniqueColors: ColorDTO[] = useMemo(() => {
        const uniqueColorIds = new Set<number>();
        const colors: ColorDTO[] = [];
        selectedProduct?.productos_detalles?.forEach(pd => {
            if (pd.color && !uniqueColorIds.has(pd.color.id)) {
                uniqueColorIds.add(pd.color.id);
                colors.push(pd.color);
            }
        });
        return colors;
    }, [selectedProduct]);

    // Calcula todas las opciones de talles disponibles para el producto (únicos por ID)
    // Estos son todos los talles que tiene el producto, sin importar stock o color.
    const allUniqueTalles: TalleDTO[] = useMemo(() => {
        const uniqueTalleIds = new Set<number>();
        const talles: TalleDTO[] = [];
        selectedProduct?.productos_detalles?.forEach(pd => {
            if (pd.talle && !uniqueTalleIds.has(pd.talle.id)) {
                uniqueTalleIds.add(pd.talle.id);
                talles.push(pd.talle);
            }
        });
        return talles;
    }, [selectedProduct]);

    // Opciones de talles disponibles basadas en el color SELECCIONADO y el stock actual.
    const availableTallesForSelectedColor: TalleDTO[] = useMemo(() => {
        if (!selectedProduct || !selectedProduct.productos_detalles) return [];

        if (selectedColorId === null) {
            // Si no hay color seleccionado, mostramos todos los talles que tienen stock,
            // independientemente del color (esto es menos útil si el usuario debe elegir color y talle)
            // O podemos optar por no mostrar nada hasta que elija un color.
            // Por ahora, devolveremos talles que tienen stock con CUALQUIER color.
            const tallesWithStock = selectedProduct.productos_detalles
                .filter(pd => pd.stockActual > 0)
                .map(pd => pd.talle)
                .filter((talle): talle is TalleDTO => talle !== null);

            const uniqueTalleIds = new Set<number>();
            const uniqueTalles: TalleDTO[] = [];
            tallesWithStock.forEach(talle => {
                if (!uniqueTalleIds.has(talle.id)) {
                    uniqueTalleIds.add(talle.id);
                    uniqueTalles.push(talle);
                }
            });
            return uniqueTalles;

        } else {
            // Si hay un color seleccionado, filtramos los detalles por ese color y stock.
            const tallesForColorWithStock = selectedProduct.productos_detalles
                .filter(pd => pd.color?.id === selectedColorId && pd.stockActual > 0)
                .map(pd => pd.talle)
                .filter((talle): talle is TalleDTO => talle !== null);

            const uniqueTalleIds = new Set<number>();
            const uniqueTalles: TalleDTO[] = [];
            tallesForColorWithStock.forEach(talle => {
                if (!uniqueTalleIds.has(talle.id)) {
                    uniqueTalleIds.add(talle.id);
                    uniqueTalles.push(talle);
                }
            });
            return uniqueTalles;
        }
    }, [selectedProduct, selectedColorId]);

    // Opciones de colores disponibles basadas en el talle SELECCIONADO y el stock actual.
    const availableColorsForSelectedTalle: ColorDTO[] = useMemo(() => {
        if (!selectedProduct || !selectedProduct.productos_detalles) return [];

        if (selectedTalleId === null) {
            // Si no hay talle seleccionado, mostramos todos los colores que tienen stock,
            // independientemente del talle.
            const colorsWithStock = selectedProduct.productos_detalles
                .filter(pd => pd.stockActual > 0)
                .map(pd => pd.color)
                .filter((color): color is ColorDTO => color !== null);

            const uniqueColorIds = new Set<number>();
            const uniqueColors: ColorDTO[] = [];
            colorsWithStock.forEach(color => {
                if (!uniqueColorIds.has(color.id)) {
                    uniqueColorIds.add(color.id);
                    uniqueColors.push(color);
                }
            });
            return uniqueColors;

        } else {
            // Si hay un talle seleccionado, filtramos los detalles por ese talle y stock.
            const colorsForTalleWithStock = selectedProduct.productos_detalles
                .filter(pd => pd.talle?.id === selectedTalleId && pd.stockActual > 0)
                .map(pd => pd.color)
                .filter((color): color is ColorDTO => color !== null);

            const uniqueColorIds = new Set<number>();
            const uniqueColors: ColorDTO[] = [];
            colorsForTalleWithStock.forEach(color => {
                if (!uniqueColorIds.has(color.id)) {
                    uniqueColorIds.add(color.id);
                    uniqueColors.push(color);
                }
            });
            return uniqueColors;
        }
    }, [selectedProduct, selectedTalleId]);


    // Efecto para inicializar la imagen principal y las selecciones de color/talle
    useEffect(() => {
        if (selectedProduct) {
            // Inicializa la imagen principal
            if (!mainImageUrl && selectedProduct.imagenes && selectedProduct.imagenes.length > 0) {
                setMainImageUrl(selectedProduct.imagenes[0].url);
            } else if (!selectedProduct.imagenes || selectedProduct.imagenes.length === 0) {
                setMainImageUrl(undefined);
            }

            // Inicializa selectedColorId si no está seleccionado o si la selección actual no es válida.
            // Prioriza mantener la selección si es posible.
            if (selectedColorId === null || !availableColorsForSelectedTalle.some(c => c.id === selectedColorId)) {
                setSelectedColorId(availableColorsForSelectedTalle.length > 0 ? availableColorsForSelectedTalle[0].id : null);
            }

            // Inicializa selectedTalleId si no está seleccionado o si la selección actual no es válida.
            // Prioriza mantener la selección si es posible.
            if (selectedTalleId === null || !availableTallesForSelectedColor.some(t => t.id === selectedTalleId)) {
                setSelectedTalleId(availableTallesForSelectedColor.length > 0 ? availableTallesForSelectedColor[0].id : null);
            }
        }
    }, [selectedProduct, mainImageUrl, selectedColorId, selectedTalleId, availableColorsForSelectedTalle, availableTallesForSelectedColor]);


    // Efecto para buscar el ProductoDetalle cuando cambian las selecciones
    useEffect(() => {
        if (selectedProduct && selectedColorId !== null && selectedTalleId !== null) {
            const colorObj = allUniqueColors.find(c => c.id === selectedColorId);
            const talleObj = allUniqueTalles.find(t => t.id === selectedTalleId);

            if (colorObj && talleObj) {
                fetchProductDetailByProductTalleColor(
                    selectedProduct.id,
                    talleObj.nombreTalle,
                    colorObj.nombreColor
                );
            } else {
                // Si la combinación de IDs no se encuentra (lo que podría ocurrir si el producto no tiene ese detalle)
                console.warn("No se encontró el objeto de Color o Talle para los IDs seleccionados. Limpiando detalle.");
                clearSelectedProductDetail();
            }
        } else {
            clearSelectedProductDetail(); // Limpiar el detalle si el color o talle no están seleccionados
        }
    }, [
        selectedColorId,
        selectedTalleId,
        selectedProduct,
        fetchProductDetailByProductTalleColor,
        clearSelectedProductDetail,
        allUniqueColors, // Asegúrate de que estas dependencias sean correctas
        allUniqueTalles
    ]);

    // Manejador para el cambio de color
    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newColorId = Number(e.target.value);
        setSelectedColorId(newColorId);
        // Cuando cambias el color, el talle seleccionado puede dejar de ser válido.
        // Lo que hacemos es re-evaluar los talles disponibles para el nuevo color.
        // El useEffect de inicialización y ajuste de talles se encargará de esto.
        setQuantity(1); // Reiniciar cantidad
    }, []);

    // Manejador para el cambio de talle
    const handleTalleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTalleId = Number(e.target.value);
        setSelectedTalleId(newTalleId);
        // Cuando cambias el talle, el color seleccionado puede dejar de ser válido.
        // Lo que hacemos es re-evaluar los colores disponibles para el nuevo talle.
        // El useEffect de inicialización y ajuste de colores se encargará de esto.
        setQuantity(1); // Reiniciar cantidad
    }, []);


    // Función para manejar el clic en las miniaturas
    const handleThumbnailClick = (imageUrl: string | undefined) => {
        setMainImageUrl(imageUrl);
    };

    // Manejador para agregar al carrito
    const handleAddToCart = () => {
        if (!selectedProduct) {
            toast.error("Error: Producto no cargado. Intenta de nuevo.");
            return;
        }

        const currentSelectedColor = allUniqueColors.find(c => c.id === selectedColorId)?.nombreColor;
        const currentSelectedTalle = allUniqueTalles.find(t => t.id === selectedTalleId)?.nombreTalle;

        if (selectedColorId === null || selectedTalleId === null) {
            toast.error("Por favor, selecciona un color y un talle.");
            return;
        }

        if (!selectedProductDetail) {
            toast.error("No se encontró la combinación de color y talle seleccionada. Por favor, elige otra.");
            return;
        }

        if (quantity <= 0) {
            toast.error("La cantidad debe ser al menos 1.");
            return;
        }

        if (selectedProductDetail.stockActual < quantity) {
            toast.error(`No hay suficiente stock. Solo quedan ${selectedProductDetail.stockActual} unidades.`);
            return;
        }

        addToCart(selectedProduct, selectedProductDetail, quantity);
        toast.success(`"${selectedProduct.denominacion}" (color: ${currentSelectedColor || 'N/A'}, talle: ${currentSelectedTalle || 'N/A'}) añadido al carrito.`);

        setQuantity(1);
    };

    // Manejo de estados de carga y error del producto principal
    if (loadingProduct)
        return <div className={styles.loadingMessage}>Cargando producto...</div>;
    if (errorProduct)
        return <div className={styles.errorMessage}>{errorProduct}</div>;
    if (!selectedProduct)
        return <div className={styles.notFoundMessage}>Producto no encontrado.</div>;

    return (
        <>
            <Header />
            <div className={styles.productDetailPage}>
                <div className={styles.breadcrumb}>
                    Home / Calzado / {selectedProduct.denominacion}
                </div>

                <div className={styles.productContent}>
                    <div className={styles.productImages}>
                        <div className={styles.thumbnailGallery}>
                            {selectedProduct.imagenes?.map((img: ImagenDTO, index: number) => (
                                <img
                                    key={img.id || `thumbnail-${index}`}
                                    src={img.url}
                                    alt={`${selectedProduct.denominacion} thumbnail ${index + 1}`}
                                    className={`${styles.thumbnail} ${mainImageUrl === img.url ? styles.active : ''}`}
                                    onClick={() => handleThumbnailClick(img.url)}
                                />
                            ))}
                        </div>
                        <div className={styles.mainImage}>
                            <img
                                src={mainImageUrl || selectedProduct.imagenes?.[0]?.url || "https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen"}
                                alt={selectedProduct.denominacion}
                            />
                        </div>
                    </div>

                    <div className={styles.productInfo}>
                        <h1>{selectedProduct.denominacion}</h1>
                        <p className={styles.productDescription}>
                            {selectedProduct.denominacion}
                        </p>
                        <p className={styles.productPrice}>
                            {selectedProduct.tienePromocion && typeof selectedProduct.precioOriginal === 'number' && (
                                <span className={styles.originalPrice}>
                                    ${selectedProduct.precioOriginal.toFixed(2)}
                                </span>
                            )}
                            <span className={styles.finalPrice}>
                                ${typeof selectedProduct.precioFinal === 'number'
                                    ? selectedProduct.precioFinal.toFixed(2)
                                    : (typeof selectedProduct.precioOriginal === 'number' ? selectedProduct.precioOriginal.toFixed(2) : '0.00')
                                }
                            </span>
                        </p>

                        <div className={styles.productOptions}>
                            <div>
                                <label htmlFor="color-select">Seleccionar color:</label>
                                <select
                                    id="color-select"
                                    value={selectedColorId === null ? "" : selectedColorId}
                                    onChange={handleColorChange}
                                    disabled={availableColorsForSelectedTalle.length === 0}
                                >
                                    <option value="">Seleccionar color</option>
                                    {availableColorsForSelectedTalle.map((color: ColorDTO) => (
                                        <option key={color.id} value={color.id}>
                                            {color.nombreColor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="talle-select">Seleccionar talle:</label>
                                <select
                                    id="talle-select"
                                    value={selectedTalleId === null ? "" : selectedTalleId}
                                    onChange={handleTalleChange}
                                    disabled={availableTallesForSelectedColor.length === 0}
                                >
                                    <option value="">Seleccionar talle</option>
                                    {availableTallesForSelectedColor.map((talle: TalleDTO) => (
                                        <option key={talle.id} value={talle.id}>
                                            {talle.nombreTalle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Mensajes de stock */}
                        {selectedColorId !== null &&
                            selectedTalleId !== null &&
                            !loadingDetail && // Solo mostrar si no se está cargando el detalle
                            selectedProductDetail && // Si se encontró un detalle
                            selectedProductDetail.stockActual > 0 ? (
                                <p className={styles.stockInfo}>
                                    Stock disponible: {selectedProductDetail.stockActual}
                                </p>
                            ) : (selectedColorId !== null && selectedTalleId !== null) && !loadingDetail && !errorDetail && (
                                <p className={`${styles.stockInfo} ${styles.noStock}`}>
                                    No hay stock disponible para la combinación de color y talle seleccionada.
                                </p>
                            )}

                        {loadingDetail && selectedColorId !== null && selectedTalleId !== null &&
                            <p className={styles.stockInfo}>Verificando stock...</p>
                        }
                        {errorDetail && <p className={styles.errorMessage}>{errorDetail}</p>}

                        <div className={styles.quantitySelector}>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                className={styles.quantityInput}
                                disabled={
                                    !selectedProductDetail || selectedProductDetail.stockActual === 0 || loadingDetail
                                }
                            />
                        </div>

                        <button
                            className={styles.addToCartButton}
                            onClick={handleAddToCart}
                            disabled={
                                !selectedProductDetail ||
                                selectedProductDetail.stockActual < quantity ||
                                quantity === 0 ||
                                loadingDetail
                            }
                        >
                            Agregar al carrito <span className={styles.arrow}>➔</span>
                        </button>

                        <div className={styles.paymentShippingInfo}>
                            <p>Métodos de pago</p>
                            <p>Devoluciones y Envíos</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductDetailPage;
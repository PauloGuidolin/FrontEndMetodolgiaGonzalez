import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useProductDetailStore } from "../../../store/productDetailStore";
import { useCartStore } from "../../../store/cartStore";

import styles from "./ProductDetailPage.module.css";
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import { ProductoDetalleDTO } from "../../dto/ProductoDetalleDTO";
import { ImagenDTO } from "../../dto/ImagenDTO";
import { ColorDTO } from "../../dto/ColorDTO";
import { TalleDTO } from "../../dto/TalleDTO";
import { ProductoDTO } from "../../dto/ProductoDTO";

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
    const allAvailableColors: ColorDTO[] = useMemo(() => {
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
    const allAvailableTalles: TalleDTO[] = useMemo(() => {
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

    // Filtra los talles disponibles basándose en el color seleccionado y el stock
    const filteredAvailableTalles = useMemo(() => {
        if (!selectedProduct || !selectedProduct.productos_detalles) return [];

        let relevantDetails = selectedProduct.productos_detalles;

        // Si hay un color seleccionado, filtramos los detalles por ese color
        if (selectedColorId !== null) {
            relevantDetails = relevantDetails.filter(pd => pd.color?.id === selectedColorId);
        }

        // De los detalles relevantes, obtenemos los talles que tienen stock
        const tallesWithStock = relevantDetails
            .filter(pd => pd.stockActual > 0)
            .map(pd => pd.talle)
            .filter((talle): talle is TalleDTO => talle !== null);

        // Aseguramos unicidad por ID
        const uniqueTalleIds = new Set<number>();
        const uniqueTalles: TalleDTO[] = [];
        tallesWithStock.forEach(talle => {
            if (!uniqueTalleIds.has(talle.id)) {
                uniqueTalleIds.add(talle.id);
                uniqueTalles.push(talle);
            }
        });

        return uniqueTalles;
    }, [selectedProduct, selectedColorId]);

    // Filtra los colores disponibles basándose en el talle seleccionado y el stock
    const filteredAvailableColors = useMemo(() => {
        if (!selectedProduct || !selectedProduct.productos_detalles) return [];

        let relevantDetails = selectedProduct.productos_detalles;

        // Si hay un talle seleccionado, filtramos los detalles por ese talle
        if (selectedTalleId !== null) {
            relevantDetails = relevantDetails.filter(pd => pd.talle?.id === selectedTalleId);
        }

        // De los detalles relevantes, obtenemos los colores que tienen stock
        const colorsWithStock = relevantDetails
            .filter(pd => pd.stockActual > 0)
            .map(pd => pd.color)
            .filter((color): color is ColorDTO => color !== null);

        // Aseguramos unicidad por ID
        const uniqueColorIds = new Set<number>();
        const uniqueColors: ColorDTO[] = [];
        colorsWithStock.forEach(color => {
            if (!uniqueColorIds.has(color.id)) {
                uniqueColorIds.add(color.id);
                uniqueColors.push(color);
            }
        });

        return uniqueColors;
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

            // Inicializa selectedColorId si no está seleccionado y hay colores disponibles (filtrados)
            if (selectedColorId === null && filteredAvailableColors.length > 0) {
                setSelectedColorId(filteredAvailableColors[0].id);
            }

            // Inicializa selectedTalleId si no está seleccionado y hay talles disponibles (filtrados)
            if (selectedTalleId === null && filteredAvailableTalles.length > 0) {
                setSelectedTalleId(filteredAvailableTalles[0].id);
            }
        }
    }, [selectedProduct, mainImageUrl, selectedColorId, selectedTalleId, filteredAvailableColors, filteredAvailableTalles]);


    // Efecto para ajustar selectedTalleId si la opción actual ya no está disponible
    useEffect(() => {
        if (selectedTalleId !== null && !filteredAvailableTalles.some(talle => talle.id === selectedTalleId)) {
            setSelectedTalleId(filteredAvailableTalles.length > 0 ? filteredAvailableTalles[0].id : null);
        }
    }, [selectedTalleId, filteredAvailableTalles]);

    // Efecto para ajustar selectedColorId si la opción actual ya no está disponible
    useEffect(() => {
        if (selectedColorId !== null && !filteredAvailableColors.some(color => color.id === selectedColorId)) {
            setSelectedColorId(filteredAvailableColors.length > 0 ? filteredAvailableColors[0].id : null);
        }
    }, [selectedColorId, filteredAvailableColors]);


    // Efecto para cargar el ProductoDetalle específico cuando cambian color/talle/producto
    useEffect(() => {
        if (selectedProduct && selectedColorId !== null && selectedTalleId !== null) {
            // Buscamos los objetos completos de Color y Talle de las listas "allAvailable"
            // para asegurar que pasamos los nombres correctos a la función de búsqueda.
            const colorObj = allAvailableColors.find(c => c.id === selectedColorId);
            const talleObj = allAvailableTalles.find(t => t.id === selectedTalleId);

            if (colorObj && talleObj) {
                fetchProductDetailByProductTalleColor(
                    selectedProduct.id,
                    talleObj.nombreTalle,
                    colorObj.nombreColor
                );
            } else {
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
        allAvailableColors,
        allAvailableTalles
    ]);

    // Función para manejar el clic en las miniaturas
    const handleThumbnailClick = (imageUrl: string | undefined) => {
        setMainImageUrl(imageUrl);
    };

    // Manejador para agregar al carrito
    const handleAddToCart = () => {
        // Validación temprana para asegurar que selectedProduct no es null
        if (!selectedProduct) {
            toast.error("Error: Producto no cargado. Intenta de nuevo.");
            return;
        }

        const currentSelectedColor = allAvailableColors.find(c => c.id === selectedColorId)?.nombreColor;
        const currentSelectedTalle = allAvailableTalles.find(t => t.id === selectedTalleId)?.nombreTalle;

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

        // En este punto, selectedProduct está garantizado como no nulo
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
                                <label htmlFor="talle-select">Seleccionar talla:</label>
                                <select
                                    id="talle-select"
                                    value={selectedTalleId === null ? "" : selectedTalleId}
                                    onChange={(e) => setSelectedTalleId(Number(e.target.value))}
                                    disabled={filteredAvailableTalles.length === 0}
                                >
                                    <option value="">Seleccionar talla</option>
                                    {filteredAvailableTalles.map((talle: TalleDTO) => (
                                        <option key={talle.id} value={talle.id}>
                                            {talle.nombreTalle}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="color-select">Seleccionar color:</label>
                                <select
                                    id="color-select"
                                    value={selectedColorId === null ? "" : selectedColorId}
                                    onChange={(e) => setSelectedColorId(Number(e.target.value))}
                                    disabled={filteredAvailableColors.length === 0}
                                >
                                    <option value="">Seleccionar color</option>
                                    {filteredAvailableColors.map((color: ColorDTO) => (
                                        <option key={color.id} value={color.id}>
                                            {color.nombreColor}
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
                                loadingDetail // Deshabilitar el botón mientras se carga el detalle
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
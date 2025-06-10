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
import { ProductoDetalleDTO } from "../../dto/ProductoDetalleDTO";

/**
 * Componente `ProductDetailPage`
 * Muestra los detalles de un producto específico, permitiendo al usuario
 * seleccionar color, talle y cantidad, y añadirlo al carrito.
 * La información del producto y sus detalles se gestionan a través de stores de Zustand.
 */
const ProductDetailPage: React.FC = () => {
  // Obtiene el `id` del producto de los parámetros de la URL.
  const { id } = useParams<{ id: string }>();

  // **Hooks de Zustand para el estado del producto y el carrito**
  // Estado y acciones relacionadas con la carga del producto principal.
  const selectedProduct = useProductDetailStore((state) => state.selectedProduct);
  const loadingProduct = useProductDetailStore((state) => state.loadingProduct);
  const errorProduct = useProductDetailStore((state) => state.errorProduct);
  const fetchProductById = useProductDetailStore((state) => state.fetchProductById);
  const clearSelectedProduct = useProductDetailStore((state) => state.clearSelectedProduct);

  // Estado y acciones relacionadas con la carga del detalle específico del producto (combinación color/talle).
  const selectedProductDetail = useProductDetailStore((state) => state.selectedProductDetail);
  const loadingDetail = useProductDetailStore((state) => state.loadingDetail);
  const errorDetail = useProductDetailStore((state) => state.errorDetail);
  const fetchProductDetailByProductTalleColor = useProductDetailStore((state) => state.fetchProductDetailByProductTalleColor);
  const clearSelectedProductDetail = useProductDetailStore((state) => state.clearSelectedProductDetail);

  // Acción para añadir productos al carrito.
  const addToCart = useCartStore((state) => state.addToCart);

  // **Estados locales del componente**
  // ID del color seleccionado por el usuario.
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  // ID del talle seleccionado por el usuario.
  const [selectedTalleId, setSelectedTalleId] = useState<number | null>(null);
  // Cantidad de unidades a añadir al carrito.
  const [quantity, setQuantity] = useState<number>(1);
  // URL de la imagen principal que se muestra en la galería.
  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);

  // **Efecto para cargar el producto y limpiar estados al montar/desmontar**
  useEffect(() => {
    // Si hay un ID en la URL, carga el producto correspondiente.
    if (id) {
      fetchProductById(Number(id));
    }
    // Función de limpieza que se ejecuta al desmontar el componente
    // para resetear los estados del producto y su detalle en el store.
    return () => {
      clearSelectedProduct();
      clearSelectedProductDetail();
    };
  }, [id, fetchProductById, clearSelectedProduct, clearSelectedProductDetail]); // Dependencias del efecto.

  // **Cálculo de opciones disponibles para el producto (colores y talles)**

  /**
   * `useMemo` para obtener todos los colores únicos disponibles para el producto.
   * Se recalcula solo cuando `selectedProduct` cambia.
   */
  const allUniqueColors: ColorDTO[] = useMemo(() => {
    const uniqueColorIds = new Set<number>();
    const colors: ColorDTO[] = [];
    selectedProduct?.productos_detalles?.forEach((pd) => {
      if (pd.color && !uniqueColorIds.has(pd.color.id)) {
        uniqueColorIds.add(pd.color.id);
        colors.push(pd.color);
      }
    });
    return colors;
  }, [selectedProduct]);

  /**
   * `useMemo` para obtener todos los talles únicos disponibles para el producto.
   * Se recalcula solo cuando `selectedProduct` cambia.
   */
  const allUniqueTalles: TalleDTO[] = useMemo(() => {
    const uniqueTalleIds = new Set<number>();
    const talles: TalleDTO[] = [];
    selectedProduct?.productos_detalles?.forEach((pd) => {
      if (pd.talle && !uniqueTalleIds.has(pd.talle.id)) {
        uniqueTalleIds.add(pd.talle.id);
        talles.push(pd.talle);
      }
    }
    );
    return talles;
  }, [selectedProduct]);

  /**
   * `useMemo` para obtener los talles disponibles para el `selectedColorId` actual,
   * filtrando por productos_detalles que tengan stock.
   * Se recalcula cuando `selectedProduct` o `selectedColorId` cambian.
   */
  const availableTallesForSelectedColor: TalleDTO[] = useMemo(() => {
    if (!selectedProduct || !selectedProduct.productos_detalles) return [];

    if (selectedColorId === null) {
      // Si no hay color seleccionado, se muestran todos los talles con stock de cualquier color.
      const tallesWithStock = selectedProduct.productos_detalles
        .filter((pd) => pd.stockActual > 0)
        .map((pd) => pd.talle)
        .filter((talle): talle is TalleDTO => talle !== null);

      const uniqueTalleIds = new Set<number>();
      const uniqueTalles: TalleDTO[] = [];
      tallesWithStock.forEach((talle) => {
        if (!uniqueTalleIds.has(talle.id)) {
          uniqueTalleIds.add(talle.id);
          uniqueTalles.push(talle);
        }
      });
      return uniqueTalles;
    } else {
      // Si hay un color seleccionado, se filtran los talles por ese color y stock.
      const tallesForColorWithStock = selectedProduct.productos_detalles
        .filter((pd) => pd.color?.id === selectedColorId && pd.stockActual > 0)
        .map((pd) => pd.talle)
        .filter((talle): talle is TalleDTO => talle !== null);

      const uniqueTalleIds = new Set<number>();
      const uniqueTalles: TalleDTO[] = [];
      tallesForColorWithStock.forEach((talle) => {
        if (!uniqueTalleIds.has(talle.id)) {
          uniqueTalleIds.add(talle.id);
          uniqueTalles.push(talle);
        }
      });
      return uniqueTalles;
    }
  }, [selectedProduct, selectedColorId]);

  /**
   * `useMemo` para obtener los colores disponibles para el `selectedTalleId` actual,
   * filtrando por productos_detalles que tengan stock.
   * Se recalcula cuando `selectedProduct` o `selectedTalleId` cambian.
   */
  const availableColorsForSelectedTalle: ColorDTO[] = useMemo(() => {
    if (!selectedProduct || !selectedProduct.productos_detalles) return [];

    if (selectedTalleId === null) {
      // Si no hay talle seleccionado, se muestran todos los colores con stock de cualquier talle.
      const colorsWithStock = selectedProduct.productos_detalles
        .filter((pd) => pd.stockActual > 0)
        .map((pd) => pd.color)
        .filter((color): color is ColorDTO => color !== null);

      const uniqueColorIds = new Set<number>();
      const uniqueColors: ColorDTO[] = [];
      colorsWithStock.forEach((color) => {
        if (!uniqueColorIds.has(color.id)) {
          uniqueColorIds.add(color.id);
          uniqueColors.push(color);
        }
      });
      return uniqueColors;
    } else {
      // Si hay un talle seleccionado, se filtran los colores por ese talle y stock.
      const colorsForTalleWithStock = selectedProduct.productos_detalles
        .filter((pd) => pd.talle?.id === selectedTalleId && pd.stockActual > 0)
        .map((pd) => pd.color)
        .filter((color): color is ColorDTO => color !== null);

      const uniqueColorIds = new Set<number>();
      const uniqueColors: ColorDTO[] = [];
      colorsForTalleWithStock.forEach((color) => {
        if (!uniqueColorIds.has(color.id)) {
          uniqueColorIds.add(color.id);
          uniqueColors.push(color);
        }
      });
      return uniqueColors;
    }
  }, [selectedProduct, selectedTalleId]);

  // **Efecto para inicializar la imagen principal y las selecciones de color/talle**
  useEffect(() => {
    if (selectedProduct) {
      // Inicializa la imagen principal si aún no está definida.
      if (!mainImageUrl && selectedProduct.imagenes && selectedProduct.imagenes.length > 0) {
        setMainImageUrl(selectedProduct.imagenes[0].url);
      } else if (!selectedProduct.imagenes || selectedProduct.imagenes.length === 0) {
        setMainImageUrl(undefined); // Si no hay imágenes, no hay URL principal.
      }

      // Inicializa `selectedColorId` o lo ajusta si la selección actual no es válida
      // en base a los colores disponibles para el talle actual.
      if (selectedColorId === null || !availableColorsForSelectedTalle.some(c => c.id === selectedColorId)) {
        setSelectedColorId(availableColorsForSelectedTalle.length > 0 ? availableColorsForSelectedTalle[0].id : null);
      }

      // Inicializa `selectedTalleId` o lo ajusta si la selección actual no es válida
      // en base a los talles disponibles para el color actual.
      if (selectedTalleId === null || !availableTallesForSelectedColor.some(t => t.id === selectedTalleId)) {
        setSelectedTalleId(availableTallesForSelectedColor.length > 0 ? availableTallesForSelectedColor[0].id : null);
      }
    }
  }, [selectedProduct, mainImageUrl, selectedColorId, selectedTalleId, availableColorsForSelectedTalle, availableTallesForSelectedColor]);

  // **Efecto para buscar el ProductoDetalle cuando cambian las selecciones de color y talle**
  useEffect(() => {
    // Solo busca el detalle si un producto principal está cargado y hay un color y talle seleccionados.
    if (selectedProduct && selectedColorId !== null && selectedTalleId !== null) {
      // Encuentra los objetos completos de color y talle usando sus IDs.
      const colorObj = allUniqueColors.find((c) => c.id === selectedColorId);
      const talleObj = allUniqueTalles.find((t) => t.id === selectedTalleId);

      // Si se encuentran ambos objetos, realiza la búsqueda del detalle.
      if (colorObj && talleObj) {
        fetchProductDetailByProductTalleColor(
          selectedProduct.id,
          talleObj.nombreTalle,
          colorObj.nombreColor
        );
      } else {
        // Si no se encuentra una combinación válida, limpia el detalle seleccionado.
        clearSelectedProductDetail();
      }
    } else {
      // Si no hay color o talle seleccionado, limpia el detalle.
      clearSelectedProductDetail();
    }
  }, [
    selectedColorId,
    selectedTalleId,
    selectedProduct,
    fetchProductDetailByProductTalleColor,
    clearSelectedProductDetail,
    allUniqueColors,
    allUniqueTalles,
  ]);

  // **Manejadores de eventos**

  /**
   * Maneja el cambio de selección del color.
   * Resetea la cantidad a 1 después del cambio.
   */
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newColorId = Number(e.target.value);
    setSelectedColorId(newColorId);
    setQuantity(1); // Reinicia la cantidad al cambiar el color.
  }, []);

  /**
   * Maneja el cambio de selección del talle.
   * Resetea la cantidad a 1 después del cambio.
   */
  const handleTalleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTalleId = Number(e.target.value);
    setSelectedTalleId(newTalleId);
    setQuantity(1); // Reinicia la cantidad al cambiar el talle.
  }, []);

  /**
   * Maneja el clic en las miniaturas de imágenes para cambiar la imagen principal.
   * @param imageUrl La URL de la imagen seleccionada.
   */
  const handleThumbnailClick = (imageUrl: string | undefined) => {
    setMainImageUrl(imageUrl);
  };

  /**
   * Maneja la acción de añadir el producto al carrito.
   * Realiza validaciones de selección y stock antes de añadir.
   */
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Error: Producto no cargado. Intenta de nuevo.");
      return;
    }

    // Obtiene los nombres de color y talle para el mensaje de éxito.
    const currentSelectedColor = allUniqueColors.find(
      (c) => c.id === selectedColorId
    )?.nombreColor;
    const currentSelectedTalle = allUniqueTalles.find(
      (t) => t.id === selectedTalleId
    )?.nombreTalle;

    // Valida que se hayan seleccionado color y talle.
    if (selectedColorId === null || selectedTalleId === null) {
      toast.error("Por favor, selecciona un color y un talle.");
      return;
    }

    // Valida que se haya encontrado un detalle de producto para la combinación seleccionada.
    if (!selectedProductDetail) {
      toast.error(
        "No se encontró la combinación de color y talle seleccionada. Por favor, elige otra."
      );
      return;
    }

    // Valida que la cantidad sea al menos 1.
    if (quantity <= 0) {
      toast.error("La cantidad debe ser al menos 1.");
      return;
    }

    // Valida que haya suficiente stock para la cantidad solicitada.
    if (selectedProductDetail.stockActual < quantity) {
      toast.error(
        `No hay suficiente stock. Solo quedan ${selectedProductDetail.stockActual} unidades.`
      );
      return;
    }

    // Añade el producto al carrito.
    addToCart(selectedProduct, selectedProductDetail, quantity);
    toast.success(
      `"${selectedProduct.denominacion}" (color: ${
        currentSelectedColor || "N/A"
      }, talle: ${currentSelectedTalle || "N/A"}) añadido al carrito.`
    );

    // Reinicia la cantidad a 1 después de añadir al carrito.
    setQuantity(1);
  };

  // **Renderizado condicional para estados de carga y error del producto principal**
  if (loadingProduct) return <div className={styles.loadingMessage}>Cargando producto...</div>;
  if (errorProduct) return <div className={styles.errorMessage}>{errorProduct}</div>;
  if (!selectedProduct) return <div className={styles.notFoundMessage}>Producto no encontrado.</div>;

  return (
    <>
      <Header />
      <div className={styles.productDetailPage}>
        {/* Breadcrumb de navegación */}
        <div className={styles.breadcrumb}>
          Home / Calzado / {selectedProduct.denominacion}
        </div>

        <div className={styles.productContent}>
          {/* Sección de imágenes del producto */}
          <div className={styles.productImages}>
            {/* Galería de miniaturas */}
            <div className={styles.thumbnailGallery}>
              {selectedProduct.imagenes?.map((img: ImagenDTO, index: number) => (
                <img
                  key={img.id || `thumbnail-${index}`} // Usa el ID de la imagen o un índice como fallback
                  src={img.url}
                  alt={`${selectedProduct.denominacion} thumbnail ${index + 1}`}
                  className={`${styles.thumbnail} ${
                    mainImageUrl === img.url ? styles.active : ""
                  }`}
                  onClick={() => handleThumbnailClick(img.url)}
                />
              ))}
            </div>
            {/* Imagen principal del producto */}
            <div className={styles.mainImage}>
              <img
                src={
                  mainImageUrl ||
                  selectedProduct.imagenes?.[0]?.url ||
                  "https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen"
                }
                alt={selectedProduct.denominacion}
              />
            </div>
          </div>

          {/* Sección de información y opciones del producto */}
          <div className={styles.productInfo}>
            <h1>{selectedProduct.denominacion}</h1>
            <p className={styles.productDescription}>{selectedProduct.denominacion}</p>
            {/* Precios: muestra precio original tachado si hay promoción */}
            <p className={styles.productPrice}>
              {selectedProduct.tienePromocion &&
                typeof selectedProduct.precioOriginal === "number" && (
                  <span className={styles.originalPrice}>
                    ${selectedProduct.precioOriginal.toFixed(2)}
                  </span>
                )}
              <span className={styles.finalPrice}>
                $
                {typeof selectedProduct.precioFinal === "number"
                  ? selectedProduct.precioFinal.toFixed(2)
                  : typeof selectedProduct.precioOriginal === "number"
                  ? selectedProduct.precioOriginal.toFixed(2)
                  : "0.00"}
              </span>
            </p>

            {/* Opciones de selección de color y talle */}
            <div className={styles.productOptions}>
              <div>
                <label htmlFor="color-select">Seleccionar color:</label>
                <select
                  id="color-select"
                  value={selectedColorId === null ? "" : selectedColorId}
                  onChange={handleColorChange}
                  disabled={availableColorsForSelectedTalle.length === 0} // Deshabilita si no hay colores disponibles
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
                  disabled={availableTallesForSelectedColor.length === 0} // Deshabilita si no hay talles disponibles
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

            {/* Mensajes de stock y estado de carga del detalle */}
            {selectedColorId !== null &&
            selectedTalleId !== null &&
            !loadingDetail && // Solo muestra si no se está cargando el detalle
            selectedProductDetail && // Si se encontró un detalle
            selectedProductDetail.stockActual > 0 ? (
              <p className={styles.stockInfo}>
                Stock disponible: {selectedProductDetail.stockActual}
              </p>
            ) : (
              selectedColorId !== null &&
              selectedTalleId !== null &&
              !loadingDetail &&
              !errorDetail && (
                <p className={`${styles.stockInfo} ${styles.noStock}`}>
                  No hay stock disponible para la combinación de color y talle
                  seleccionada.
                </p>
              )
            )}
            {/* Mensaje de "Verificando stock..." mientras se carga el detalle */}
            {loadingDetail &&
              selectedColorId !== null &&
              selectedTalleId !== null && (
                <p className={styles.stockInfo}>Verificando stock...</p>
              )}
            {/* Mensaje de error si falla la carga del detalle */}
            {errorDetail && <p className={styles.errorMessage}>{errorDetail}</p>}

            {/* Selector de cantidad */}
            <div className={styles.quantitySelector}>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} // Asegura que la cantidad no sea menor a 1
                className={styles.quantityInput}
                // Deshabilita el input si no hay detalle seleccionado, no hay stock o se está cargando el detalle.
                disabled={
                  !selectedProductDetail ||
                  selectedProductDetail.stockActual === 0 ||
                  loadingDetail
                }
              />
            </div>

            {/* Botón "Agregar al carrito" */}
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              // Deshabilita el botón si no hay detalle seleccionado, no hay suficiente stock,
              // la cantidad es 0 o se está cargando el detalle.
              disabled={
                !selectedProductDetail ||
                selectedProductDetail.stockActual < quantity ||
                quantity === 0 ||
                loadingDetail
              }
            >
              Agregar al carrito <span className={styles.arrow}>➔</span>
            </button>

            {/* Información adicional (pagos, envíos, devoluciones) */}
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
// src/components/screens/ProductDetailPage/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// ProductoDTO se declara pero no se usa directamente en este archivo, puedes eliminarla si no la necesitas para evitar el warning.
// import { ProductoDTO } from "../../dto/ProductoDTO";
import { ProductoDetalleDTO } from "../../dto/ProductoDetalleDTO";
import { ImagenDTO } from "../../dto/ImagenDTO";
import { Color } from "../../../types/IColor";
import { Talle } from "../../../types/ITalle";

import { useProductDetailStore } from "../../../store/productDetailStore";

import styles from "./ProductDetailPage.module.css";
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedTalle, setSelectedTalle] = useState<Talle | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);

  // *******************************************************************
  // MODIFICACIÓN CLAVE: Inicializa mainImageUrl, selectedColor y selectedTalle
  // cuando el producto se carga por primera vez.
  // También optimizado para evitar re-renderizados innecesarios
  // *******************************************************************
  useEffect(() => {
    if (selectedProduct) {
      // Inicializa la imagen principal SI AÚN NO ESTÁ SETEADA O SI EL PRODUCTO CAMBIÓ
      if (!mainImageUrl && selectedProduct.imagenes && selectedProduct.imagenes.length > 0) {
        setMainImageUrl(selectedProduct.imagenes[0].url);
      } else if (!selectedProduct.imagenes || selectedProduct.imagenes.length === 0) {
        setMainImageUrl(undefined); // Resetea si no hay imágenes
      }

      // Inicializa selectedColor y selectedTalle con los primeros disponibles
      // Solo si no están ya seleccionados
      if (!selectedColor && selectedProduct.productos_detalles && selectedProduct.productos_detalles.length > 0) {
        const initialAvailableColors = Array.from(new Set(selectedProduct.productos_detalles.map(pd => pd.color)));
        if (initialAvailableColors.length > 0) {
          setSelectedColor(initialAvailableColors[0]);
        }
      }

      if (!selectedTalle && selectedProduct.productos_detalles && selectedProduct.productos_detalles.length > 0) {
        const initialAvailableTalles = Array.from(new Set(selectedProduct.productos_detalles.map(pd => pd.talle)));
        if (initialAvailableTalles.length > 0) {
          setSelectedTalle(initialAvailableTalles[0]);
        }
      }
    }
  }, [selectedProduct, mainImageUrl, selectedColor, selectedTalle]); // Dependencias para reaccionar a cambios en el producto y estados

  // Función para cambiar la imagen principal al hacer clic en una miniatura
  const handleThumbnailClick = (imageUrl: string | undefined) => {
    setMainImageUrl(imageUrl);
  };
  // *******************************************************************

  useEffect(() => {
    if (id) {
      fetchProductById(Number(id));
    }
    return () => {
      clearSelectedProduct();
      clearSelectedProductDetail();
    };
  }, [id, fetchProductById, clearSelectedProduct, clearSelectedProductDetail]);

  // Este useEffect se mantiene igual, ya que depende de las selecciones de color y talle
  // que ahora se inicializan correctamente.
  useEffect(() => {
    if (selectedProduct && selectedColor && selectedTalle) {
      // console.log("Fetching product detail for:", selectedProduct.id, selectedTalle, selectedColor); // Debugging
      fetchProductDetailByProductTalleColor(
        selectedProduct.id,
        selectedTalle,
        selectedColor
      );
    } else if (!selectedColor || !selectedTalle) {
      clearSelectedProductDetail();
    }
  }, [
    selectedColor,
    selectedTalle,
    selectedProduct,
    fetchProductDetailByProductTalleColor,
    clearSelectedProductDetail,
  ]);

  // *******************************************************************
  // MOVIDOS LOS CONSOLE.LOGS FUERA DEL JSX A UN useEffect separado
  // para depurar los estados de stock sin errores de tipo.
  // *******************************************************************
  useEffect(() => {
    console.log("Estado de stock - selectedProductDetail:", selectedProductDetail);
    console.log("Estado de stock - loadingDetail:", loadingDetail);
    console.log("Estado de stock - errorDetail:", errorDetail);
  }, [selectedProductDetail, loadingDetail, errorDetail]);
  // *******************************************************************


  if (loadingProduct)
    return <div className={styles.loadingMessage}>Cargando producto...</div>;
  if (errorProduct)
    return <div className={styles.errorMessage}>{errorProduct}</div>;
  if (!selectedProduct)
    return <div className={styles.notFoundMessage}>Producto no encontrado.</div>;

  // Filtramos los talles y colores disponibles en base a los productos_detalles
  // que efectivamente tienen stock para el color o talle actualmente seleccionado.
  // Esto es crucial para que las opciones de selección sean relevantes.

  // Primero, obtenemos todos los colores y talles disponibles para el producto.
  const allAvailableColors: Color[] = Array.from(
    new Set(
      selectedProduct.productos_detalles?.map((pd: ProductoDetalleDTO) => pd.color) || []
    )
  );

  const allAvailableTalles: Talle[] = Array.from(
    new Set(
      selectedProduct.productos_detalles?.map((pd: ProductoDetalleDTO) => pd.talle) || []
    )
  );

  // Luego, filtramos las opciones de talle basado en el color seleccionado,
  // y las opciones de color basado en el talle seleccionado.
  const filteredAvailableTalles = selectedColor
    ? Array.from(new Set(
        selectedProduct.productos_detalles
          ?.filter(pd => pd.color === selectedColor && pd.stockActual > 0)
          .map(pd => pd.talle) || []
      ))
    : allAvailableTalles; // Si no hay color seleccionado, muestra todos los talles

  const filteredAvailableColors = selectedTalle
    ? Array.from(new Set(
        selectedProduct.productos_detalles
          ?.filter(pd => pd.talle === selectedTalle && pd.stockActual > 0)
          .map(pd => pd.color) || []
      ))
    : allAvailableColors; // Si no hay talle seleccionado, muestra todos los colores


  const handleAddToCart = () => {
    if (
      selectedProductDetail &&
      quantity > 0 &&
      selectedProductDetail.stockActual >= quantity
    ) {
      console.log(
        `Agregando ${quantity} del detalle de producto ID ${selectedProductDetail.id} al carrito`
      );
      alert(
        `Añadido al carrito: ${quantity} x ${selectedProduct.denominacion} (${selectedColor}, ${selectedTalle})`
      );
    } else {
      alert(
        "Por favor, selecciona color y talle, y asegúrate de que la cantidad sea válida y haya stock suficiente."
      );
    }
  };

  return (
    <>
    <Header/>
    <div className={styles.productDetailPage}>
      <div className={styles.breadcrumb}>
        Home / Calzado / {selectedProduct.denominacion}
      </div>

      <div className={styles.productContent}>
        <div className={styles.productImages}>
          <div className={styles.thumbnailGallery}>
            {selectedProduct.imagenes?.map((img: ImagenDTO, index: number) => (
              <img
                key={img.id || index}
                src={img.url}
                alt={`${selectedProduct.denominacion} thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${mainImageUrl === img.url ? styles.active : ''}`}
                onClick={() => handleThumbnailClick(img.url)}
              />
            ))}
          </div>
          <div className={styles.mainImage}>
            <img
              src={mainImageUrl || "https://placehold.co/600x400/E2E8F0/FFFFFF?text=Sin+Imagen"} // Fallback placeholder
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
                    value={selectedTalle || ""}
                    onChange={(e) => setSelectedTalle(e.target.value as Talle)}
                    // Usar filteredAvailableTalles para deshabilitar si no hay opciones
                    disabled={filteredAvailableTalles.length === 0}
                >
                    <option value="">Seleccionar talla</option>
                    {filteredAvailableTalles.map((talle: Talle) => (
                        <option key={talle} value={talle}>
                            {talle}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="color-select">Seleccionar color:</label>
                <select
                    id="color-select"
                    value={selectedColor || ""}
                    onChange={(e) => setSelectedColor(e.target.value as Color)}
                    // Usar filteredAvailableColors para deshabilitar si no hay opciones
                    disabled={filteredAvailableColors.length === 0}
                >
                    <option value="">Seleccionar color</option>
                    {filteredAvailableColors.map((color: Color) => (
                        <option key={color} value={color}>
                            {color}
                        </option>
                    ))}
                </select>
            </div>
          </div>

          {selectedColor &&
            selectedTalle &&
            !selectedProductDetail && // Solo muestra si no hay un detalle de producto encontrado
            !loadingDetail && // Y no estamos cargando
            !errorDetail && ( // Y no hay un error al buscar
              <p className={`${styles.stockInfo} ${styles.noStock}`}>
                No hay stock disponible para la combinación de color y talle
                seleccionada.
              </p>
            )}

          {selectedProductDetail && selectedProductDetail.stockActual > 0 ? ( // Solo muestra stock si es > 0
            <p className={styles.stockInfo}>
              Stock disponible: {selectedProductDetail.stockActual}
            </p>
          ) : selectedColor && selectedTalle && !loadingDetail && !errorDetail && ( // Si hay color/talle pero stock es 0
            <p className={`${styles.stockInfo} ${styles.noStock}`}>
              Stock agotado para la combinación seleccionada.
            </p>
          )}

          {errorDetail && <p className={styles.errorMessage}>{errorDetail}</p>}

          <div className={styles.quantitySelector}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className={styles.quantityInput}
              disabled={
                !selectedProductDetail || selectedProductDetail.stockActual === 0
              }
            />
          </div>

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={
              !selectedProductDetail ||
              selectedProductDetail.stockActual < quantity ||
              quantity === 0
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
    <Footer/>
    </>
  );
};

export default ProductDetailPage;
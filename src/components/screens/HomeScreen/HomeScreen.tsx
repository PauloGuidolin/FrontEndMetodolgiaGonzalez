import { FC, useEffect, useState } from "react";
import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import styles from "./HomeScreen.module.css";
import { useProductStore } from "../../../store/productStore";
import CardList from "../../ui/Cards/CardList/CardList";
import { useShallow } from "zustand/shallow";

/**
 * Componente HomeScreen
 * Muestra la página de inicio de la aplicación, incluyendo un banner,
 * productos destacados y listados de productos generales y promocionales.
 * Utiliza el store de Zustand para gestionar el estado de los productos.
 */
export const HomeScreen = () => {
  // Consumimos el estado y las acciones del store de productos utilizando `useShallow`
  // para optimizar las re-renderizaciones, solo re-renderiza si los valores seleccionados cambian superficialmente.
  const {
    // Lista general de productos (mapeado de state.originalProducts)
    products,
    // Estado de carga para los productos generales
    loading: loadingProducts,
    // Estado de error para los productos generales
    error: errorProducts,
    // Lista de productos promocionales
    promotionalProducts,
    // Estado de carga para los productos promocionales
    loadingPromotional,
    // Estado de error para los productos promocionales
    errorPromotional,
  } = useProductStore(
    useShallow((state) => ({
      products: state.originalProducts,
      loading: state.loading,
      error: state.error,
      promotionalProducts: state.promotionalProducts,
      loadingPromotional: state.loadingPromotional,
      errorPromotional: state.errorPromotional,
    }))
  );

  // Obtenemos las acciones directamente del hook del store.
  const fetchProductsAction = useProductStore((state) => state.fetchProducts);
  const fetchPromotionalProductsAction = useProductStore(
    (state) => state.fetchPromotionalProducts
  );

  // `useEffect` para llamar a las acciones de fetching cuando el componente se monta.
  // La lógica de carga se ejecuta solo si los datos aún no están presentes y no hay carga/error previo.
  useEffect(() => {
    // Lógica para obtener todos los productos generales si no han sido cargados.
    if (products?.length === 0 && !loadingProducts && !errorProducts) {
      fetchProductsAction();
    }
    // Lógica para obtener productos promocionales si no han sido cargados.
    if (
      promotionalProducts?.length === 0 &&
      !loadingPromotional &&
      !errorPromotional
    ) {
      fetchPromotionalProductsAction();
    }
    // Dependencias del efecto: Aseguran que el efecto se re-ejecute
    // si alguna de estas acciones o propiedades del estado cambian.
  }, [
    fetchProductsAction,
    products?.length,
    errorProducts,
    fetchPromotionalProductsAction,
    promotionalProducts?.length,
    errorPromotional,
  ]);

  return (
    <>
      <div>
        <Header />
        <div className={styles.containerHome}>
          {/* Sección del Banner principal */}
          <div className={styles.banner}>
            <img
              src="../../../../images/bannerAdidas.png"
              alt="Banner Adidas"
            />
          </div>

          {/* Sección de Producto Destacado (Camiseta Boca) - Contenido estático */}
          <div className={styles.shirt}>
            {/* Primer item del grid: Camiseta Boca principal con texto descriptivo */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/camisetaboca.jpeg"
                alt="Camiseta Boca Juniors"
              />
              <div className={styles.text}>
                <h3>120 AÑOS DE GLORIA</h3>
                <h4>Remera Boca Juniors: inspirada en los títulos</h4>
              </div>
            </div>

            {/* Segundo item del grid: Escudo de Boca */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/escudoboca.jpg"
                alt="Escudo Boca Juniors"
              />
            </div>

            {/* Tercer item del grid: Camiseta Boca de Entrenamiento */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/camisetabocaentrenamiento.avif"
                alt="Camiseta Boca Entrenamiento"
              />
            </div>
          </div>

          {/* Sección "Descubrí lo nuevo" - Muestra una lista de productos generales */}
          <div className={styles.sliderShoes}>
            <h2>Descubrí lo nuevo</h2>
            {/* Mensajes condicionales para estados de carga y error */}
            {loadingProducts && <p>Cargando productos nuevos...</p>}
            {errorProducts && (
              <p>Error al cargar productos nuevos: {errorProducts}</p>
            )}
            {/* Renderiza CardList solo si no hay carga, no hay error y hay productos */}
            {!loadingProducts &&
              !errorProducts &&
              Array.isArray(products) &&
              products.length > 0 && <CardList products={products} />}
            {/* Mensaje si no se encuentran productos nuevos */}
            {!loadingProducts &&
              !errorProducts &&
              Array.isArray(products) &&
              products.length === 0 && (
                <p>No se encontraron productos nuevos.</p>
              )}
          </div>

          {/* Sección "Tendencias de las tiendas" - Muestra una lista de productos promocionales */}
          <div className={styles.sliderClothes}>
            <h2>Tendencias de las tiendas</h2>
            {/* Mensajes condicionales para estados de carga y error de promocionales */}
            {loadingPromotional && <p>Cargando tendencias...</p>}
            {errorPromotional && (
              <p>Error al cargar tendencias: {errorPromotional}</p>
            )}
            {/* Renderiza CardList solo si no hay carga, no hay error y hay productos promocionales */}
            {!loadingPromotional &&
              !errorPromotional &&
              Array.isArray(promotionalProducts) &&
              promotionalProducts.length > 0 && (
                <CardList products={promotionalProducts} />
              )}
            {/* Mensaje si no se encuentran productos promocionales */}
            {!loadingPromotional &&
              !errorPromotional &&
              Array.isArray(promotionalProducts) &&
              promotionalProducts.length === 0 && (
                <p>No se encontraron productos promocionales.</p>
              )}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};
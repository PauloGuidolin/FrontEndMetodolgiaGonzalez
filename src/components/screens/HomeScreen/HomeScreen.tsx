// Archivo: src/screens/HomeScreen/HomeScreen.tsx

import React, { useEffect, useMemo } from "react"; // Importamos useEffect y useMemo
// import { useNavigate } from "react-router-dom"; // Eliminamos la importación de useNavigate si no se usa en otro lugar
import { Footer } from "../../ui/Footer/Footer"; // Importamos el componente Footer
import { Header } from "../../ui/Header/Header"; // Importamos el componente Header
import styles from "./HomeScreen.module.css"; // Importamos el módulo CSS de HomeScreen
import { ProductoDTO } from "../../dto/ProductoDTO"; // Importamos la interfaz ProductoDTO (verifica la ruta)
import { useProductStore } from "../../../store/productStore"; // Importamos el store de Zustand
import CardList from "../../ui/Cards/CardList/CardList"; // Importamos el componente CardList
import { useShallow } from 'zustand/shallow'; // Importamos useShallow

export const HomeScreen = () => {
  // const navigate = useNavigate(); // Eliminamos el hook si no se usa

  // Consumimos el estado y las acciones del store de productos
  // Usamos useShallow para realizar una comparación superficial del objeto seleccionado.
  const {
    products, // Lista general de productos (ProductoDTO[] ahora)
    loading: loadingProducts, // Estado de carga para la lista general
    error: errorProducts, // Error para la lista general
    fetchProducts, // Acción para obtener todos los productos (ahora obtiene DTOs)

    promotionalProducts, // Lista de productos promocionales (ProductoDTO[])
    loadingPromotional, // Estado de carga para promocionales
    errorPromotional, // Error para promocionales
    fetchPromotionalProducts, // Acción para obtener productos promocionales
  } = useProductStore(useShallow((state) => ({
    products: state.products,
    loading: state.loading, // loading general para fetchProducts
    error: state.error, // error general para fetchProducts
    fetchProducts: state.fetchProducts,

    promotionalProducts: state.promotionalProducts,
    loadingPromotional: state.loadingPromotional,
    errorPromotional: state.errorPromotional,
    fetchPromotionalProducts: state.fetchPromotionalProducts,
  })));

  // Usamos useEffect para llamar a las acciones de fetching cuando el componente se monta
  // y cuando las listas de productos están vacías.
  useEffect(() => {
    console.log("HomeScreen useEffect triggered."); // Log al inicio del efecto
    console.log("Current state:", {
        productsLength: products.length,
        loadingProducts,
        errorProducts,
        promotionalProductsLength: promotionalProducts.length,
        loadingPromotional,
        errorPromotional
    }); // Log del estado actual

    // Lógica para fetchear todos los productos DTOs
    // Solo fetchea si la lista está vacía, no está cargando y no ha habido un error previo
    if (products.length === 0 && !loadingProducts && !errorProducts) {
      console.log("HomeScreen: Condition met for fetching all products DTOs. Calling fetchProducts()."); // Log antes de llamar
      fetchProducts();
    } else {
       console.log("HomeScreen: Condition NOT met for fetching all products DTOs."); // Log si la condición no se cumple
    }

    // Lógica para fetchear productos promocionales DTOs
    // Solo fetchea si la lista está vacía, no está cargando y no ha habido un error previo
    if (promotionalProducts.length === 0 && !loadingPromotional && !errorPromotional) {
        console.log("HomeScreen: Condition met for fetching promotional products DTOs. Calling fetchPromotionalProducts()."); // Log antes de llamar
        fetchPromotionalProducts();
    } else {
        console.log("HomeScreen: Condition NOT met for fetching promotional products DTOs."); // Log si la condición no se cumple
    }

    // Dependencias corregidas:
    // - Incluimos las acciones fetchProducts y fetchPromotionalProducts (son estables desde Zustand).
    // - Incluimos la longitud de los arrays de datos (products.length, promotionalProducts.length)
    //   para que el efecto re-evalúe la condición después de que los datos se carguen.
    // - Incluimos los estados de error (errorProducts, errorPromotional) para que si un error se limpia
    //   externamente (ej. un botón de reintentar), el efecto pueda intentar fetchear de nuevo.
    // - EXCLUIMOS los estados de carga (loadingProducts, loadingPromotional) para evitar que el efecto
    //   se dispare *solo* porque el estado de carga cambió al iniciar el fetch.
  }, [fetchProducts, products.length, errorProducts, fetchPromotionalProducts, promotionalProducts.length, errorPromotional]);

  // Filtramos los productos promocionales por categoría en el frontend (si es necesario para mostrar por separado)
  // Usamos useMemo para optimizar
  const futbolProducts = useMemo(() => {
      if (!promotionalProducts) return [];
      return promotionalProducts.filter(
          (p) => p.categorias?.includes("Futbol") // Filtra por la categoría "Futbol"
      );
  }, [promotionalProducts]); // Dependencia: promotionalProducts

  const runningProducts = useMemo(() => {
        if (!promotionalProducts) return [];
      return promotionalProducts.filter(
          (p) => p.categorias?.includes("Running") // Filtra por la categoría "Running"
      );
  }, [promotionalProducts]);

  const calzadoProducts = useMemo(() => {
        if (!promotionalProducts) return [];
      return promotionalProducts.filter(
          (p) => p.categorias?.includes("Calzado") // Filtra por la categoría "Calzado"
      );
  }, [promotionalProducts]);


  return (
    <>
      <div>
        <Header />

        <div className={styles.containerHome}>
          {/* Sección del Banner */}
          <div className={styles.banner}>
            <img src="../../../../images/bannerAdidas.png" alt="Banner Adidas" />
          </div>

          {/* Sección de Producto Destacado (Camiseta Boca) - Mantenemos el código original por ahora */}
           <div className={styles.shirt}>
             <div className={styles.imgRelative}>
               <img src="../../../../images/camisetaboca.jpeg" alt="Camiseta Boca Juniors" />
               <div className={styles.text}>
                 <h3>120 AÑOS DE GLORIA</h3>
                 <h4>Boca Juniors third jersey: inspirada en los titulos</h4>
               </div>
               <img src="../../../../images/escudoboca.jpg" alt="Escudo Boca Juniors" />
               <img
                 src="../../../../images/camisetabocaentrenamiento.avif"
                 alt="Camiseta Boca Entrenamiento"
               />
             </div>
           </div>


          {/* Sección "Descubrí lo nuevo" - Usando CardList con todos los productos DTOs */}
          <div className={styles.sliderShoes}> {/* Puedes renombrar esta clase si ya no es un "slider" */}
            <h2>Descubrí lo nuevo</h2>
              {/* Mostramos estado de carga o error para esta sección */}
            {loadingProducts && <p>Cargando productos nuevos...</p>}
            {errorProducts && <p>Error al cargar productos nuevos: {errorProducts}</p>}
              {/* Renderizamos el CardList si no hay carga ni error y hay productos */}
            {!loadingProducts && !errorProducts && products.length > 0 && (
                <CardList products={products} />
            )}
              {/* Mensaje si no hay productos después de cargar */}
              {!loadingProducts && !errorProducts && products.length === 0 && (
                <p>No se encontraron productos nuevos.</p>
              )}
          </div>

          {/* Sección "Tendencias de las tiendas" - Usando CardList con productos promocionales DTOs */}
          {/* Aquí pasamos la lista completa de promocionales. Si quieres filtrar, pasa una de las listas filtradas (ej. futbolProducts). */}
          <div className={styles.sliderClothes}> {/* Puedes renombrar esta clase */}
            <h2>Tendencias de las tiendas</h2>
              {/* Mostramos estado de carga o error para esta sección */}
              {loadingPromotional && <p>Cargando tendencias...</p>}
              {errorPromotional && <p>Error al cargar tendencias: {errorPromotional}</p>}
              {/* Renderizamos el CardList si no hay carga ni error y hay productos promocionales */}
              {!loadingPromotional && !errorPromotional && promotionalProducts.length > 0 && (
                  <CardList products={promotionalProducts} />
              )}
               {/* Mensaje si no hay productos promocionales después de cargar */}
               {!loadingPromotional && !errorPromotional && promotionalProducts.length === 0 && (
                  <p>No se encontraron productos promocionales.</p>
               )}
          </div>

          {/* Botón y Footer */}
          {/* Eliminada la navegación del botón */}
          <button>IR AL LOG</button>
          <Footer />
        </div>
      </div>
    </>
  );
};

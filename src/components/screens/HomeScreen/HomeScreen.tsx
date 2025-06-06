import { useEffect } from "react";
// import { useNavigate } from "react-router-dom"; // Puedes eliminar esta línea si solo usas el useNavigate de 'react-router'
import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import styles from "./HomeScreen.module.css";
// import { ProductoDTO } from "../../dto/ProductoDTO"; // Ya no necesitas importar ProductoDTO aquí si solo lo usas en el Store/Card
import { useProductStore } from "../../../store/productStore"; // Verifica la ruta
import CardList from "../../ui/Cards/CardList/CardList";
import { useShallow } from "zustand/shallow";
import { useNavigate } from "react-router"; // Asegúrate de que esta sea la importación correcta para tu router

export const HomeScreen = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/UserProfile");
  };

  // Consumimos el estado y las acciones del store de productos
  const {
    // Accedemos a originalProducts del estado y lo renombramos a 'products'
    products, // Lista general de productos (originalProducts renombrado)
    loading: loadingProducts, // Estado de carga general (mapeado de state.loading)
    error: errorProducts, // Error general (mapeado de state.error)
    promotionalProducts, // Lista de productos promociales (del estado promotionalProducts)
    loadingPromotional, // Estado de carga para promocionales
    errorPromotional, // Error para promocionales
  } = useProductStore(
    useShallow((state) => ({
      // Usamos originalProducts del estado del store para la sección "Descubrí lo nuevo"
      products: state.originalProducts,
      loading: state.loading, // Estado de carga para la carga general/filtrada
      error: state.error, // Estado de error para la carga general/filtrada

      promotionalProducts: state.promotionalProducts, // Estado para productos promocionales
      loadingPromotional: state.loadingPromotional, // Estado de carga para promocionales
      errorPromotional: state.errorPromotional, // Error para promocionales
    }))
  );

  // Obtenemos las acciones directamente del hook (no con useShallow si no dependen del estado mismo para su definición)
  const fetchProductsAction = useProductStore((state) => state.fetchProducts);
  const fetchPromotionalProductsAction = useProductStore(
    (state) => state.fetchPromotionalProducts
  );

  // Usamos useEffect para llamar a las acciones de fetching cuando el componente se monta
  useEffect(() => {
    console.log("HomeScreen useEffect triggered.");
    console.log("Current state selected in HomeScreen:", {
      productsArray: products, // <-- LOG: Muestra el array de productos generales
      productsLength: products?.length, // <-- LOG: Muestra la longitud
      loadingProducts,
      errorProducts,
      promotionalProductsArray: promotionalProducts, // <-- LOG: Muestra el array de promocionales
      promotionalProductsLength: promotionalProducts?.length, // <-- LOG: Muestra la longitud de promocionales
      loadingPromotional,
      errorPromotional,
    });

    // Lógica para fetchear todos los productos DTOs (los "nuevos" o generales)
    // Usamos products?.length para seguridad si en algún estado inicial products fuera null/undefined
    if (products?.length === 0 && !loadingProducts && !errorProducts) {
      console.log(
        "HomeScreen: Condition met for fetching all products DTOs. Calling fetchProductsAction()."
      );
      fetchProductsAction();
    }
    // Lógica para fetchear productos promocionales DTOs ("tendencias")
    // Actualmente comentado, pero la estructura está lista si la necesitas.
    // if (promotionalProducts?.length === 0 && !loadingPromotional && !errorPromotional) {
    //     console.log("HomeScreen: Condition met for fetching promotional products DTOs. Calling fetchPromotionalProductsAction().");
    //     fetchPromotionalProductsAction();
    // }

    // Dependencias:
    // Incluimos acciones, longitudes de arrays y estados de error.
    // Excluimos estados de carga para evitar bucles infinitos si cambian durante la carga.
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
          {/* Sección del Banner */}
          <div className={styles.banner}>
            <img
              src="../../../../images/bannerAdidas.png"
              alt="Banner Adidas"
            />
          </div>

          {/* Sección de Producto Destacado (Camiseta Boca) - Contenido estático */}
          {/* IMPORTANTE: Cada item del grid ahora tiene su propio div.imgRelative */}
          <div className={styles.shirt}>
            {/* Primer item del grid: Camiseta Boca principal */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/camisetaboca.jpeg"
                alt="Camiseta Boca Juniors"
              />
              <div className={styles.text}>
                <h3>120 AÑOS DE GLORIA</h3>
                <h4>Remera Boca Juniors: inspirada en los titulos</h4>
              </div>
            </div>

            {/* Segundo item del grid: Escudo Boca */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/escudoboca.jpg"
                alt="Escudo Boca Juniors"
              />
            </div>

            {/* Tercer item del grid: Camiseta Boca Entrenamiento */}
            <div className={styles.imgRelative}>
              <img
                src="../../../../images/camisetabocaentrenamiento.avif"
                alt="Camiseta Boca Entrenamiento"
              />
            </div>
          </div>

          {/* Sección "Descubrí lo nuevo" - Usando CardList con todos los productos */}
          <div className={styles.sliderShoes}>
            <h2>Descubrí lo nuevo</h2>
            {loadingProducts && <p>Cargando productos nuevos...</p>}
            {errorProducts && (
              <p>Error al cargar productos nuevos: {errorProducts}</p>
            )}
            {/* Renderizado condicional para CardList de productos nuevos */}
            {/* PASAR products a CardList solo si NO está cargando, NO hay error y products es un array con elementos */}
            {!loadingProducts &&
              !errorProducts &&
              Array.isArray(products) &&
              products.length > 0 && (
                <CardList products={products} /> // <-- Aquí CardList es el componente que necesito asegurar que genera un .sliderTrack
              )}
            {/* Mostrar mensaje "No se encontraron" si terminó de cargar sin error y el array está vacío */}
            {!loadingProducts &&
              !errorProducts &&
              Array.isArray(products) &&
              products.length === 0 && (
                <p>No se encontraron productos nuevos.</p>
              )}
          </div>

          {/* Sección "Tendencias de las tiendas" - Usando CardList con productos promocionales */}
          <div className={styles.sliderClothes}>
            <h2>Tendencias de las tiendas</h2>
            {loadingPromotional && <p>Cargando tendencias...</p>}
            {errorPromotional && (
              <p>Error al cargar tendencias: {errorPromotional}</p>
            )}
            {/* Renderizado condicional para CardList de productos promocionales */}
            {/* PASAR promotionalProducts a CardList solo si NO está cargando, NO hay error y es un array con elementos */}
            {!loadingPromotional &&
              !errorPromotional &&
              Array.isArray(promotionalProducts) &&
              promotionalProducts.length > 0 && (
                <CardList products={promotionalProducts} />
              )}
            {/* Mostrar mensaje "No se encontraron" si terminó de cargar sin error y el array está vacío */}
            {!loadingPromotional &&
              !errorPromotional &&
              Array.isArray(promotionalProducts) &&
              promotionalProducts.length === 0 && (
                <p>No se encontraron productos promocionales.</p>
              )}
          </div>
          {/*Footer*/}
          <Footer />
        </div>
      </div>
    </>
  );
};

// Archivo: src/screens/HomeScreen/HomeScreen.tsx

import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import styles from "./HomeScreen.module.css";
// import { ProductoDTO } from "../../dto/ProductoDTO"; // Ya no necesitas importar ProductoDTO aquí si solo lo usas en el Store/Card
import { useProductStore } from "../../../store/productStore"; // Verifica la ruta
import CardList from "../../ui/Cards/CardList/CardList";
import { useShallow } from 'zustand/shallow';
import { useNavigate } from "react-router";


export const HomeScreen = () => {
     const navigate = useNavigate();

const handleNavigate = () => {
    navigate('/UserProfile')
}

    // Consumimos el estado y las acciones del store de productos
    const {
        // Accedemos a originalProducts del estado y lo renombramos a 'products'
        products, // Lista general de productos (originalProducts renombrado)
        loading: loadingProducts, // Estado de carga general (mapeado de state.loading)
        error: errorProducts, // Error general (mapeado de state.error)
        // No obtenemos acciones en el selector useShallow
        promotionalProducts, // Lista de productos promociales (del estado promotionalProducts)
        loadingPromotional, // Estado de carga para promocionales
        errorPromotional, // Error para promocionales
    } = useProductStore(useShallow((state) => ({
        // Usamos originalProducts del estado del store para la sección "Descubrí lo nuevo"
        products: state.originalProducts,
        loading: state.loading, // Estado de carga para la carga general/filtrada
        error: state.error, // Estado de error para la carga general/filtrada

        promotionalProducts: state.promotionalProducts, // Estado para productos promocionales
        loadingPromotional: state.loadingPromotional, // Estado de carga para promocionales
        errorPromotional: state.errorPromotional, // Error para promocionales
    })));

    // Obtenemos las acciones directamente del hook (no con useShallow si no dependen del estado mismo para su definición)
    const fetchProductsAction = useProductStore(state => state.fetchProducts);
    const fetchPromotionalProductsAction = useProductStore(state => state.fetchPromotionalProducts);


    // Usamos useEffect para llamar a las acciones de fetching cuando el componente se monta
    useEffect(() => {
        console.log("HomeScreen useEffect triggered.");
        console.log("Current state selected in HomeScreen:", {
            // Logs para ver el estado que llega a HomeScreen
            productsArray: products, // <-- LOG: Muestra el array de productos generales
            productsLength: products?.length, // <-- LOG: Muestra la longitud
            loadingProducts,
            errorProducts,
            promotionalProductsArray: promotionalProducts, // <-- LOG: Muestra el array de promocionales
            promotionalProductsLength: promotionalProducts?.length, // <-- LOG: Muestra la longitud de promocionales
            loadingPromotional,
            errorPromotional
        });


        // Lógica para fetchear todos los productos DTOs (los "nuevos" o generales)
        // Usamos products?.length para seguridad si en algún estado inicial products fuera null/undefined
        if (products?.length === 0 && !loadingProducts && !errorProducts) {
            console.log("HomeScreen: Condition met for fetching all products DTOs. Calling fetchProductsAction().");
            fetchProductsAction();
        }

        // Lógica para fetchear productos promocionales DTOs ("tendencias")
        // Usamos promotionalProducts?.length para seguridad
//         if (promotionalProducts?.length === 0 && !loadingPromotional && !errorPromotional) {
//             console.log("HomeScreen: Condition met for fetching promotional products DTOs. Calling fetchPromotionalProductsAction().");
//             fetchPromotionalProductsAction();
//         }


        // Dependencias:
        // Incluimos acciones, longitudes de arrays y estados de error.
        // Excluimos estados de carga para evitar bucles infinitos si cambian durante la carga.
    }, [fetchProductsAction, products?.length, errorProducts, fetchPromotionalProductsAction, promotionalProducts?.length, errorPromotional]);


    return (
        <>
            <div>
                <Header />

                <div className={styles.containerHome}>
                    {/* Sección del Banner */}
                    <div className={styles.banner}>
                        <img src="../../../../images/bannerAdidas.png" alt="Banner Adidas" />
                    </div>

                    {/* Sección de Producto Destacado (Camiseta Boca) - Contenido estático */}
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


                    {/* Sección "Descubrí lo nuevo" - Usando CardList con todos los productos */}
                    <div className={styles.sliderShoes}>
                        <h2>Descubrí lo nuevo</h2>
                        {loadingProducts && <p>Cargando productos nuevos...</p>}
                        {errorProducts && <p>Error al cargar productos nuevos: {errorProducts}</p>}
                        {/* Renderizado condicional para CardList de productos nuevos */}
                        {/* PASAR products a CardList solo si NO está cargando, NO hay error y products es un array con elementos */}
                        {!loadingProducts && !errorProducts && Array.isArray(products) && products.length > 0 && (
                            console.log("HomeScreen: Rendering CardList with products (Array):", products), // <-- LOG AQUI
                            <CardList products={products} />
                        )}
                         {/* Mostrar mensaje "No se encontraron" si terminó de cargar sin error y el array está vacío */}
                         {!loadingProducts && !errorProducts && Array.isArray(products) && products.length === 0 && (
                            <p>No se encontraron productos nuevos.</p>
                         )}
                    </div>

                    {/* Sección "Tendencias de las tiendas" - Usando CardList con productos promocionales */}
                    <div className={styles.sliderClothes}>
                        <h2>Tendencias de las tiendas</h2>
                        {loadingPromotional && <p>Cargando tendencias...</p>}
                        {errorPromotional && <p>Error al cargar tendencias: {errorPromotional}</p>}
                        {/* Renderizado condicional para CardList de productos promocionales */}
                        {/* PASAR promotionalProducts a CardList solo si NO está cargando, NO hay error y es un array con elementos */}
                        {!loadingPromotional && !errorPromotional && Array.isArray(promotionalProducts) && promotionalProducts.length > 0 && (
                            console.log("HomeScreen: Rendering CardList with promotionalProducts (Array):", promotionalProducts), // <-- LOG AQUI
                            <CardList products={promotionalProducts} />
                        )}

                         {/* Mostrar mensaje "No se encontraron" si terminó de cargar sin error y el array está vacío */}
                         {!loadingPromotional && !errorPromotional && Array.isArray(promotionalProducts) && promotionalProducts.length === 0 && (
                             <p>No se encontraron productos promocionales.</p>
                         )}
                    </div>

                    {/* Botón y Footer */}
                    <button onClick={handleNavigate}>IR AL LOG</button> {/* Este botón hay que borrarlo y utilizarlo cuando un usuario este logueado */}
                    <Footer />
                </div>
            </div>
        </>
    );
};

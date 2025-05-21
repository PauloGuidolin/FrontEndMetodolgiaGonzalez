// Archivo: src/screens/ProductScreen/ProductScreen.tsx

import React, { useEffect, useState } from "react";

import styles from "./ProductScreen.module.css"; // Importa los estilos CSS Module
import { ProductoDTO } from "../../dto/ProductoDTO";

// *** Importamos el store y la interfaz ProductFilters CORRECTA y UNIFICADA desde el store ***
import { useProductStore, ProductFilters } from "../../../store/productStore"; // AJUSTA LA RUTA si es necesario
import { useShallow } from "zustand/shallow"; // Para seleccionar estado eficientemente

// *** Importamos el servicio API para obtener opciones de filtro ***
import { productService } from "../../../https/productApi"; // Asegúrate de que la ruta sea correcta

import FilterPanel from "../../ui/FilterPanel/FilterPanel"; // Importa el componente FilterPanel
// Importa ProductCard (si lo renderizas directamente)
import ProductCard from "../../ui/Cards/ProductCard/ProductCard"; // Asegúrate de que la ruta sea correcta
import { Footer } from "../../ui/Footer/Footer"; // Asegúrate de que la ruta sea correcta
import { Header } from "../../ui/Header/Header"; // Asegúrate de que la ruta sea correcta

const ProductScreen: React.FC = () => {
  // *** Consumimos el estado y las acciones del store ***
  // Usamos useShallow para obtener solo las partes del estado que necesitamos y evitar rerenders innecesarios
  const {
    filteredProducts, // Lista de productos ya filtrados (la que mostraremos)
    loading, // Estado de carga del store (para la lista principal)
    error, // Error del store (para la lista principal)
    currentFilters, // Filtros actuales aplicados (desde el store)
  } = useProductStore(
    useShallow((state) => ({
      filteredProducts: state.filteredProducts,
      loading: state.loading,
      error: state.error,
      currentFilters: state.currentFilters, // Este es del tipo ProductFilters corregido
    }))
  );

  // Obtenemos las acciones del store directamente (zustand recomienda obtener acciones sin shallow)
  const {
    fetchProducts: fetchProductsAction, // Acción para cargar todos los productos iniciales
    setAndFetchFilteredProducts: setAndFetchFilteredProductsAction, // Acción para setear filtros y fetchear
    clearFilters: clearFiltersAction, // Acción para limpiar filtros
  } = useProductStore();
  // *** Fin Consumo del store ***

  // --- Estado local para controlar la visibilidad del panel de filtros ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // --- Estado local para las listas de opciones de filtro disponibles ---
  // Estas listas se pasarán al FilterPanel. Esperamos string[] del backend vía productService.
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  // *** Efecto para cargar los productos iniciales Y las opciones de filtro disponibles ***
  useEffect(() => {
    console.log("ProductScreen useEffect triggered.");

    // --- Cargar productos iniciales (si la lista está vacía) ---
    // Utilizamos filteredProducts.length para decidir si cargar.
    if (filteredProducts.length === 0 && !loading && !error) {
      console.log(
        "ProductScreen: Filtered products list is empty. Calling fetchProducts action."
      );
      // Llama a la acción del store para cargar *todos* los productos
      fetchProductsAction();
    }

    // --- Cargar opciones de filtro disponibles ---
    // Fetcheamos las listas de opciones disponibles (categorías, colores, talles)
    // Estas deberían venir como string[] del backend a través de productService.
    const fetchAvailableOptions = async () => {
      try {
        // Asegúrate de que estos métodos en productService llamen a los endpoints correctos
        // /productos/categorias, /productos/colores, /productos/talles y devuelvan string[]
        const categories = await productService.getAllAvailableCategories();
        setAvailableCategories(categories);

        const colors = await productService.getAllAvailableColors();
        setAvailableColors(colors);

        const sizes = await productService.getAllAvailableTalles();
        setAvailableSizes(sizes);

        console.log(
          "Fetched available filter options: Categories=",
          categories.length,
          "Colors=",
          colors.length,
          "Sizes=",
          sizes.length
        );
      } catch (err) {
        console.error("Error fetching available filter options:", err);
      }
    };

    // Ejecutar la carga de opciones disponibles al montar el componente
    fetchAvailableOptions();

    // Dependencias del useEffect:
    // Añadimos fetchProductsAction porque es una función externa.
    // Añadimos filteredProducts.length, loading, error para controlar la carga inicial.
    // No necesitamos fetchAvailableOptions ni los setters de estado en las dependencias.
  }, [fetchProductsAction, filteredProducts.length, loading, error]);

  // *** Función para manejar la aplicación de filtros desde el FilterPanel ***
  const handleApplyFilters = (filtersFromPanel: ProductFilters) => {
    console.log(
      "Filters applied from panel (ProductScreen):",
      filtersFromPanel
    ); // LOG AQUI
    // Llama a la acción del store para actualizar los filtros y fetchear los productos filtrados
    // filtersFromPanel ya es del tipo ProductFilters corregido.
    setAndFetchFilteredProductsAction(filtersFromPanel);
    setIsFilterPanelOpen(false); // Cierra el panel después de aplicar
  };

  // *** Función para manejar la limpieza de filtros desde el FilterPanel ***
  const handleClearFilters = () => {
    console.log("Clearing filters (ProductScreen):"); // LOG AQUI
    // Llama a la acción del store para limpiar los filtros y recargar todos los productos
    clearFiltersAction(); // Esta acción resetea currentFilters a {} y llama a fetchProductsAction()
    setIsFilterPanelOpen(false); // Cierra el panel después de limpiar
  };

  // Manejadores para abrir/cerrar el panel de filtros
  const openFilterPanel = () => setIsFilterPanelOpen(true);
  const closeFilterPanel = () => setIsFilterPanelOpen(false);

  // --- Renderizado condicional (Carga, Error, Resultados) ---

  // Mostrar "Cargando" si loading es true. Si ya hay productos mostrados, quizás mostrar un indicador diferente.
  if (loading && filteredProducts.length === 0) {
    return <div className={styles.loading}>Cargando productos...</div>;
  }

  // Mostrar mensaje de error si hay un error y no hay productos cargados para mostrar.
  // Si error es true pero filteredProducts.length > 0, un error al refiltrar podría ser menos crítico.
  if (error && filteredProducts.length === 0) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // Renderiza la pantalla de productos
  return (
    <div className={styles.container}>
      <Header />{" "}
      {/* Asegúrate de que Header no cause problemas de renderizado o estilos */}
      {/* Botón o elemento para abrir el panel de filtros */}
      {/* Puedes añadir un botón aquí en tu UI principal */}
      <button className={styles.openFilterButton} onClick={openFilterPanel}>
        Abrir Filtros
      </button>
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={closeFilterPanel}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        availableCategories={availableCategories} // Pasa las listas de opciones disponibles
        availableColors={availableColors}
        availableSizes={availableSizes}
        initialFilters={currentFilters} // Pasa los filtros actuales del store al panel
      />
      {/* Contenedor de la lista de productos */}
      <div className={styles.productList}>
        {/* Mapea sobre los productos FILTRADOS solo si filteredProducts es un array válido */}
        {Array.isArray(filteredProducts) && filteredProducts.length > 0
          ? filteredProducts.map((product) => (
              // La key es crucial para el rendimiento de las listas en React
              // Usamos product.id si existe, o un fallback seguro si no
              <ProductCard
                key={
                  product.id !== undefined && product.id !== null
                    ? product.id
                    : `product-${Math.random()}`
                }
                product={product}
              />
            ))
          : // Mostrar mensajes si no hay productos o no hay resultados
            // Solo si NO estamos cargando y filteredProducts está vacío
            !loading &&
            (currentFilters && Object.keys(currentFilters).length > 0 ? (
              // Si hay filtros aplicados pero no hay resultados
              <div className={styles.noResults}>
                No se encontraron productos que coincidan con los filtros
                seleccionados.
              </div>
            ) : (
              // Si no hay filtros aplicados y la lista está vacía (puede que no haya productos en total)
              !error && ( // Solo muestra este mensaje si no hay un error general
                <div className={styles.noProductsMessage}>
                  No hay productos disponibles.
                </div>
              )
            ))}

        {/* Indicador de refiltrado si es necesario */}
        {/* Esto es opcional y puede superponerse a la lista actual mientras se carga la nueva */}
        {/*
                 {loading && filteredProducts.length > 0 && (
                     <div className={styles.refilterLoadingOverlay}>Refiltrando...</div>
                 )}
                 */}
      </div>
      <Footer />{" "}
      {/* Asegúrate de que Footer no cause problemas de renderizado o estilos */}
    </div>
  );
};

export default ProductScreen;

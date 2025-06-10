// Archivo: src/screens/ProductScreen/ProductScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./ProductScreen.module.css";
import { ProductoDTO } from "../../dto/ProductoDTO"; // Asegúrate de que esta ruta sea correcta

import { useProductStore, ProductFilters } from "../../../store/productStore";
import { useShallow } from "zustand/shallow";

import { productService } from "../../../https/productApi"; // Asegúrate de que esta ruta sea correcta

import ProductCard from "../../ui/Cards/ProductCard/ProductCard";
import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import { FilterPanel } from "../../ui/FilterPanel/FilterPanel"; // Asegúrate de que esta ruta sea correcta

/**
 * Función auxiliar para parsear los filtros de la URL.
 * Toma la cadena de consulta de la URL y la convierte en un objeto `ProductFilters`.
 * @param search La cadena de consulta de la URL (e.g., "?categorias=Zapatillas&colores=Negro").
 * @returns Un objeto `ProductFilters` con los valores extraídos de la URL.
 */
const parseFiltersFromUrl = (search: string): ProductFilters => {
  const queryParams = new URLSearchParams(search);
  return {
    categorias: queryParams.getAll("categorias") || [],
    colores: queryParams.getAll("colores") || [],
    talles: queryParams.getAll("talles") || [],
    denominacion: queryParams.get("denominacion") || null,
    sexo: (queryParams.get("sexo") as "MASCULINO" | "FEMENINO" | "UNISEX") || null,
    minPrice: queryParams.get("minPrice") ? parseFloat(queryParams.get("minPrice")!) : null,
    maxPrice: queryParams.get("maxPrice") ? parseFloat(queryParams.get("maxPrice")!) : null,
    // Convierte el string "true" o "false" a booleano, si no, es null.
    tienePromocion:
      queryParams.get("tienePromocion") === "true"
        ? true
        : queryParams.get("tienePromocion") === "false"
        ? false
        : null,
    orderBy: (queryParams.get("orderBy") as "precioVenta" | "denominacion") || null,
    orderDirection: (queryParams.get("orderDirection") as "asc" | "desc") || null,
  };
};

/**
 * Función auxiliar para comparar si dos objetos de filtros son iguales.
 * Realiza una comparación profunda, especialmente útil para arrays dentro de los filtros.
 * @param f1 El primer objeto de filtros.
 * @param f2 El segundo objeto de filtros.
 * @returns `true` si los filtros son idénticos, `false` en caso contrario.
 */
const areFiltersEqual = (f1: ProductFilters, f2: ProductFilters): boolean => {
  // Función interna para normalizar los filtros: ordenar arrays y eliminar propiedades vacías.
  const normalize = (filters: ProductFilters) => {
    const sortedFilters: ProductFilters = { ...filters };
    if (sortedFilters.categorias) sortedFilters.categorias.sort();
    if (sortedFilters.colores) sortedFilters.colores.sort();
    if (sortedFilters.talles) sortedFilters.talles.sort();

    // Eliminar propiedades con valores "vacíos" para una comparación consistente
    for (const key in sortedFilters) {
      const value = sortedFilters[key as keyof ProductFilters];
      if (value === null || value === undefined) {
        delete sortedFilters[key as keyof ProductFilters];
      } else if (typeof value === "string" && value.trim() === "") {
        delete sortedFilters[key as keyof ProductFilters];
      } else if (Array.isArray(value) && value.length === 0) {
        delete sortedFilters[key as keyof ProductFilters];
      }
    }
    return sortedFilters;
  };
  // Compara los objetos normalizados como cadenas JSON.
  return JSON.stringify(normalize(f1)) === JSON.stringify(normalize(f2));
};

/**
 * Componente `ProductScreen`
 * Muestra una lista de productos y permite filtrarlos y ordenarlos
 * a través de un panel de filtros. Sincroniza los filtros con los
 * parámetros de la URL.
 */
const ProductScreen: React.FC = () => {
  // Hooks de React Router para acceder a la URL y la navegación.
  const location = useLocation();
  const navigate = useNavigate();

  // Selecciona el estado relevante del store de productos usando `useShallow` para optimización.
  const { filteredProducts, loading, error, currentFilters } = useProductStore(
    useShallow((state) => ({
      filteredProducts: state.filteredProducts,
      loading: state.loading,
      error: state.error,
      currentFilters: state.currentFilters,
    }))
  );

  // Selecciona las acciones necesarias del store de productos.
  const {
    fetchProducts: fetchProductsAction,
    setAndFetchFilteredProducts: setAndFetchFilteredProductsAction,
    clearFilters: clearFiltersAction,
  } = useProductStore();

  // Estados locales para el control del UI y las opciones de filtro.
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // Controla la visibilidad del panel de filtros.
  const [availableCategories, setAvailableCategories] = useState<string[]>([]); // Categorías disponibles para filtrar.
  const [availableColors, setAvailableColors] = useState<string[]>([]); // Colores disponibles para filtrar.
  const [availableSizes, setAvailableSizes] = useState<string[]>([]); // Talles disponibles para filtrar.

  // **EFECTO PRINCIPAL PARA CARGA INICIAL Y APLICACIÓN DE FILTROS DE URL**
  useEffect(() => {
    console.log("ProductScreen useEffect triggered by URL or store change.");

    // Parsea los filtros de la URL actual.
    const filtersFromUrl = parseFiltersFromUrl(location.search);

    // Limpia los filtros de la URL para una comparación precisa (remueve nulls, arrays vacíos, strings vacíos).
    const cleanFiltersFromUrl: ProductFilters = Object.fromEntries(
      Object.entries(filtersFromUrl).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim() !== "";
        return value !== null && value !== undefined;
      })
    ) as ProductFilters;

    console.log("ProductScreen - cleanFiltersFromUrl:", cleanFiltersFromUrl);
    console.log("ProductScreen - currentFilters (from Zustand store):", currentFilters);

    // Compara los filtros de la URL con los filtros actuales en el store de Zustand.
    // Solo actualiza y re-busca si hay una diferencia significativa.
    if (!areFiltersEqual(cleanFiltersFromUrl, currentFilters)) {
      console.log("ProductScreen: URL filters differ from store. Applying filters from URL.");
      setAndFetchFilteredProductsAction(cleanFiltersFromUrl); // Aplica y busca con los filtros de la URL.
    } else if (
      // Si no hay filtros en la URL y el store está vacío (sin productos, sin carga, sin error),
      // significa una carga inicial sin filtros, por lo que se solicitan todos los productos.
      Object.keys(cleanFiltersFromUrl).length === 0 &&
      filteredProducts.length === 0 &&
      !loading &&
      !error
    ) {
      console.log("ProductScreen: No URL filters, store filters empty, and product list empty. Fetching all products.");
      fetchProductsAction(); // Busca todos los productos.
    } else {
      console.log("ProductScreen: URL filters are already in sync with store or no fetch needed.");
    }
  }, [
    location.search, // Dependencia clave para reaccionar a cambios en la URL.
    fetchProductsAction,
    setAndFetchFilteredProductsAction,
    currentFilters,
    filteredProducts.length,
    loading,
    error,
  ]);

  // **EFECTO PARA CARGAR LAS OPCIONES DE FILTRO DISPONIBLES (categorías, colores, talles)**
  useEffect(() => {
    // Función asíncrona para obtener las opciones de filtro desde el servicio.
    const fetchAvailableOptions = async () => {
      try {
        const categories = await productService.getAllAvailableCategories();
        setAvailableCategories(categories);

        const colors = await productService.getAllAvailableColors();
        setAvailableColors(colors);

        const sizes = await productService.getAllAvailableTalles();
        setAvailableSizes(sizes);

        console.log("Fetched available filter options: Categories=", categories.length, "Colors=", colors.length, "Sizes=", sizes.length);
      } catch (err) {
        console.error("Error fetching available filter options:", err);
      }
    };

    // Carga las opciones disponibles solo si aún no se han cargado (para evitar llamadas redundantes).
    if (availableCategories.length === 0 && availableColors.length === 0 && availableSizes.length === 0) {
      fetchAvailableOptions();
    }
  }, [availableCategories.length, availableColors.length, availableSizes.length]); // Dependencias para re-ejecutar si las listas están vacías.

  // **Funciones de manejo del FilterPanel**

  /**
   * Maneja la aplicación de filtros desde el `FilterPanel`.
   * Construye y actualiza los parámetros de la URL según los filtros aplicados.
   * @param filtersFromPanel Los filtros seleccionados en el panel.
   */
  const handleApplyFilters = useCallback(
    (filtersFromPanel: ProductFilters) => {
      console.log("Filters applied from panel (ProductScreen):", filtersFromPanel);

      const params = new URLSearchParams();
      // Itera sobre los filtros y los añade a los parámetros de la URL.
      Object.entries(filtersFromPanel).forEach(([key, value]) => {
        // Omite valores nulos, indefinidos o cadenas/arrays vacíos.
        if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
          return;
        }
        if (Array.isArray(value)) {
          // Si es un array, añade cada elemento individualmente.
          value.forEach((item) => {
            if (item !== null && item !== undefined && typeof item === "string" && item.trim() !== "") {
              params.append(key, String(item));
            }
          });
        } else {
          // Para otros tipos de valores, simplemente establece el parámetro.
          params.set(key, String(value));
        }
      });

      const newSearch = params.toString();
      // Actualiza la URL sin recargar la página.
      navigate(`?${newSearch}`, { replace: true });
      setIsFilterPanelOpen(false); // Cierra el panel de filtros después de aplicar.
    },
    [navigate]
  ); // `Maps` es una dependencia de `useCallback`.

  /**
   * Maneja la acción de limpiar todos los filtros.
   * Limpia los filtros en el store de Zustand y la URL.
   */
  const handleClearFilters = useCallback(() => {
    console.log("Clearing filters (ProductScreen):");
    clearFiltersAction(); // Limpia los filtros en el store.
    navigate("", { replace: true }); // Limpia los parámetros de la URL.
    setIsFilterPanelOpen(false); // Cierra el panel.
  }, [clearFiltersAction, navigate]); // Dependencias de `useCallback`.

  // Callbacks para abrir y cerrar el panel de filtros.
  const openFilterPanel = useCallback(() => setIsFilterPanelOpen(true), []);
  const closeFilterPanel = useCallback(() => setIsFilterPanelOpen(false), []);

  // **Lógica de renderizado condicional del contenido principal**
  let content;
  if (loading && filteredProducts.length === 0) {
    // Muestra un mensaje de carga si no hay productos aún.
    content = <div className={styles.loadingMessage}>Cargando productos...</div>;
  } else if (error && filteredProducts.length === 0) {
    // Muestra un mensaje de error si la carga falló y no hay productos.
    content = <div className={styles.errorMessage}>Error al cargar productos: {error}</div>;
  } else if (Array.isArray(filteredProducts) && filteredProducts.length > 0) {
    // Si hay productos filtrados, los muestra en `ProductCard`s.
    content = (
      <div className={styles.productList}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id ?? `product-${Math.random()}`} // Asegura un key único para cada tarjeta.
            product={product}
          />
        ))}
      </div>
    );
  } else if (currentFilters && Object.keys(currentFilters).length > 0) {
    // Si hay filtros aplicados, pero no se encontraron resultados.
    content = (
      <div className={styles.noResults}>
        No se encontraron productos que coincidan con los filtros seleccionados.
      </div>
    );
  } else {
    // Si no hay productos, ni filtros aplicados, ni error, ni carga (estado inicial o sin datos).
    content = (
      <div className={styles.noProductsMessage}>No hay productos disponibles.</div>
    );
  }

  return (
    <div className={styles.mainWrapper}>
      <Header />
      <main className={styles.container}>
        {/* Botón para abrir el panel de filtros */}
        <button className={styles.openFilterButton} onClick={openFilterPanel} aria-label="Abrir filtros">
          <span className={styles.filterButtonIcon}></span> {/* Icono (estilizado con CSS) */}
          Filtrar
        </button>

        {/* Componente del panel de filtros */}
        <FilterPanel
          isOpen={isFilterPanelOpen} // Controla si el panel está abierto.
          onClose={closeFilterPanel} // Callback para cerrar el panel.
          onApplyFilters={handleApplyFilters} // Callback cuando se aplican los filtros.
          onClearFilters={handleClearFilters} // Callback cuando se limpian los filtros.
          availableCategories={availableCategories} // Opciones de categorías disponibles.
          availableColors={availableColors} // Opciones de colores disponibles.
          availableSizes={availableSizes} // Opciones de talles disponibles.
          initialFilters={currentFilters} // Filtros iniciales del store para poblar el panel.
        />

        {/* Contenido principal (lista de productos o mensajes de estado) */}
        {content}
      </main>
      <Footer />
    </div>
  );
};

export default ProductScreen;
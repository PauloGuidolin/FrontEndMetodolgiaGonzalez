// Archivo: src/screens/ProductScreen/ProductScreen.tsx

import React, { useEffect, useState } from "react";
// IMPORTANTE: Importa useNavigate para cambiar la URL
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./ProductScreen.module.css";
import { ProductoDTO } from "../../dto/ProductoDTO";

import { useProductStore, ProductFilters } from "../../../store/productStore";
import { useShallow } from "zustand/shallow";

import { productService } from "../../../https/productApi";


import ProductCard from "../../ui/Cards/ProductCard/ProductCard";
import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import { FilterPanel } from "../../ui/FilterPanel/FilterPanel";

const ProductScreen: React.FC = () => {
  const location = useLocation(); // Hook para acceder al objeto de localización de React Router
  const navigate = useNavigate(); // <-- AÑADIDO: Hook para cambiar la URL

  const { filteredProducts, loading, error, currentFilters } = useProductStore(
    useShallow((state) => ({
      filteredProducts: state.filteredProducts,
      loading: state.loading,
      error: state.error,
      currentFilters: state.currentFilters,
    }))
  );

  const {
    fetchProducts: fetchProductsAction,
    setAndFetchFilteredProducts: setAndFetchFilteredProductsAction,
    clearFilters: clearFiltersAction,
  } = useProductStore();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]); // Función auxiliar para parsear los filtros de la URL

  const parseFiltersFromUrl = (search: string): ProductFilters => {
    const queryParams = new URLSearchParams(search);
    return {
      // CAMBIO CRUCIAL: Usar .getAll() para parámetros repetidos (arrays)
      categorias: queryParams.getAll("categorias") || [], // ¡IMPORTANTE!
      colores: queryParams.getAll("colores") || [], // ¡IMPORTANTE!
      talles: queryParams.getAll("talles") || [], // ¡IMPORTANTE!
      denominacion: queryParams.get("denominacion") || null,
      sexo:
        (queryParams.get("sexo") as "MASCULINO" | "FEMENINO" | "UNISEX") ||
        null,
      minPrice: queryParams.get("minPrice")
        ? parseFloat(queryParams.get("minPrice")!)
        : null,
      maxPrice: queryParams.get("maxPrice")
        ? parseFloat(queryParams.get("maxPrice")!)
        : null,
      tienePromocion:
        queryParams.get("tienePromocion") === "true"
          ? true
          : queryParams.get("tienePromocion") === "false"
          ? false
          : null,
      orderBy:
        (queryParams.get("orderBy") as "precioVenta" | "denominacion") || null,
      orderDirection:
        (queryParams.get("orderDirection") as "asc" | "desc") || null, // Añade aquí cualquier otro filtro que puedas tener en la URL
    };
  }; // Función auxiliar para comparar si dos objetos de filtros son iguales (deep comparison para arrays)

  const areFiltersEqual = (f1: ProductFilters, f2: ProductFilters): boolean => {
    // Normaliza los arrays para comparación, ignorando el orden
    const normalize = (filters: ProductFilters) => {
      const sortedFilters: ProductFilters = { ...filters };
      if (sortedFilters.categorias) sortedFilters.categorias.sort();
      if (sortedFilters.colores) sortedFilters.colores.sort();
      if (sortedFilters.talles) sortedFilters.talles.sort(); // Asegura que las propiedades que pueden ser null sean tratadas consistentemente
      for (const key in sortedFilters) {
        if (
          sortedFilters[key as keyof ProductFilters] === null ||
          sortedFilters[key as keyof ProductFilters] === undefined
        ) {
          delete sortedFilters[key as keyof ProductFilters]; // Eliminar para que JSON.stringify no incluya `null` explícitamente
        } else if (
          typeof sortedFilters[key as keyof ProductFilters] === "string" &&
          (sortedFilters[key as keyof ProductFilters] as string).trim() === ""
        ) {
          delete sortedFilters[key as keyof ProductFilters];
        } else if (
          Array.isArray(sortedFilters[key as keyof ProductFilters]) &&
          (sortedFilters[key as keyof ProductFilters] as any[]).length === 0
        ) {
          delete sortedFilters[key as keyof ProductFilters];
        }
      }
      return sortedFilters;
    };
    return JSON.stringify(normalize(f1)) === JSON.stringify(normalize(f2));
  }; // --- EFECTO PRINCIPAL PARA CARGA INICIAL Y APLICACIÓN DE FILTROS DE URL ---

  useEffect(() => {
    console.log("ProductScreen useEffect triggered by URL or store change.");

    const filtersFromUrl = parseFiltersFromUrl(location.search); // Debugging logs added here:

    console.log("ProductScreen - filtersFromUrl (raw parsed):", filtersFromUrl); // Filtra para eliminar propiedades con valores "vacíos" (null, [], '')
    const cleanFiltersFromUrl: ProductFilters = Object.fromEntries(
      Object.entries(filtersFromUrl).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim() !== "";
        return value !== null && value !== undefined;
      })
    ) as ProductFilters;

    console.log(
      "ProductScreen - cleanFiltersFromUrl (cleaned):",
      cleanFiltersFromUrl
    );
    console.log(
      "ProductScreen - currentFilters (from Zustand store):",
      currentFilters
    ); // Compara los filtros de la URL con los filtros actuales del store. // Solo actualiza y re-busca si hay una diferencia significativa.

    if (!areFiltersEqual(cleanFiltersFromUrl, currentFilters)) {
      console.log(
        "ProductScreen: URL filters differ from store. Applying filters from URL:",
        cleanFiltersFromUrl
      );
      setAndFetchFilteredProductsAction(cleanFiltersFromUrl);
    } else if (
      Object.keys(cleanFiltersFromUrl).length === 0 &&
      filteredProducts.length === 0 &&
      !loading &&
      !error
    ) {
      // Si no hay filtros en la URL y el store está vacío, y no estamos cargando/con error,
      // esto es una carga inicial sin filtros, entonces pedimos todos los productos.
      console.log(
        "ProductScreen: No URL filters, store filters empty, and product list empty. Fetching all products."
      );
      fetchProductsAction();
    } else {
      console.log(
        "ProductScreen: URL filters are already in sync with store or no fetch needed."
      );
    }
  }, [
    location.search, // Dependencia clave: re-ejecuta este efecto cuando la URL cambia
    fetchProductsAction,
    setAndFetchFilteredProductsAction,
    currentFilters, // Importante para evitar re-fetches si los filtros de URL ya están en el store
    filteredProducts.length, // Para la carga inicial
    loading, // Para la carga inicial
    error, // Para la carga inicial
  ]); // --- EFECTO PARA CARGAR LAS OPCIONES DE FILTRO DISPONIBLES (categorías, colores, talles) ---

  useEffect(() => {
    const fetchAvailableOptions = async () => {
      try {
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
    }; // Cargar las opciones disponibles solo si aún no se han cargado

    if (
      availableCategories.length === 0 &&
      availableColors.length === 0 &&
      availableSizes.length === 0
    ) {
      fetchAvailableOptions();
    }
  }, [
    availableCategories.length,
    availableColors.length,
    availableSizes.length,
  ]); // Dependencias: solo si las listas de opciones están vacías // --- Funciones de manejo del FilterPanel ---

  const handleApplyFilters = (filtersFromPanel: ProductFilters) => {
    console.log(
      "Filters applied from panel (ProductScreen):",
      filtersFromPanel
    ); // --- Lógica para construir y actualizar la URL ---

    const params = new URLSearchParams();
    Object.entries(filtersFromPanel).forEach(([key, value]) => {
      // Ignorar valores nulos, indefinidos o cadenas vacías
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return;
      }
      if (Array.isArray(value)) {
        // Para arrays (categorias, colores, talles), añadir cada elemento individualmente
        value.forEach((item) => {
          if (
            item !== null &&
            item !== undefined &&
            typeof item === "string" &&
            item.trim() !== ""
          ) {
            params.append(key, String(item));
          }
        });
      } else {
        // Para otros tipos de valores, establecer el parámetro
        params.set(key, String(value));
      }
    });

    const newSearch = params.toString();
    console.log(
      "ProductScreen - Navigating to new URL search:",
      `?${newSearch}`
    ); // Debug log
    navigate(`?${newSearch}`, { replace: true }); // <-- AÑADIDO: Actualiza la URL // --- FIN Lógica para construir y actualizar la URL --- // La acción de `setAndFetchFilteredProductsAction` se disparará automáticamente // debido al `useEffect` que escucha `location.search`. // Por lo tanto, no es necesario llamarla aquí directamente. // setAndFetchFilteredProductsAction(filtersFromPanel); // Esto ya no es necesario aquí.
    setIsFilterPanelOpen(false); // Cierra el panel de filtros
  };

  const handleClearFilters = () => {
    console.log("Clearing filters (ProductScreen):");
    clearFiltersAction(); // Limpia los filtros en el store
    navigate("", { replace: true }); // <-- AÑADIDO: Limpia los parámetros de la URL
    setIsFilterPanelOpen(false); // Cierra el panel
  };

  const openFilterPanel = () => setIsFilterPanelOpen(true);
  const closeFilterPanel = () => setIsFilterPanelOpen(false); // --- Renderizado condicional ---

  if (loading && filteredProducts.length === 0) {
    return <div className={styles.loading}>Cargando productos...</div>;
  }

  if (error && filteredProducts.length === 0) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <>
            <Header />     {" "}
      <div className={styles.container}>
               {" "}
        <button className={styles.openFilterButton} onClick={openFilterPanel}>
                    Abrir Filtros        {" "}
        </button>
               {" "}
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={closeFilterPanel}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          availableCategories={availableCategories}
          availableColors={availableColors}
          availableSizes={availableSizes}
          initialFilters={currentFilters} // Asegúrate de que currentFilters siempre refleje los filtros actuales
        />
               {" "}
        <div className={styles.productList}>
                   {" "}
          {Array.isArray(filteredProducts) && filteredProducts.length > 0
            ? filteredProducts.map((product) => (
                <ProductCard
                  key={
                    product.id !== undefined && product.id !== null
                      ? product.id
                      : `product-${Math.random()}`
                  }
                  product={product}
                />
              ))
            : !loading &&
              (currentFilters && Object.keys(currentFilters).length > 0 ? (
                <div className={styles.noResults}>
                                    No se encontraron productos que coincidan
                  con los filtros                   seleccionados.              
                   {" "}
                </div>
              ) : (
                !error && (
                  <div className={styles.noProductsMessage}>
                                        No hay productos disponibles.          
                           {" "}
                  </div>
                )
              ))}
                 {" "}
        </div>
             {" "}
      </div>
            <Footer />   {" "}
    </>
  );
};

export default ProductScreen;

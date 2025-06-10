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

// Función auxiliar para parsear los filtros de la URL
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
        tienePromocion: queryParams.get("tienePromocion") === "true" ? true : queryParams.get("tienePromocion") === "false" ? false : null,
        orderBy: (queryParams.get("orderBy") as "precioVenta" | "denominacion") || null,
        orderDirection: (queryParams.get("orderDirection") as "asc" | "desc") || null,
    };
};

// Función auxiliar para comparar si dos objetos de filtros son iguales (deep comparison para arrays)
const areFiltersEqual = (f1: ProductFilters, f2: ProductFilters): boolean => {
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
    return JSON.stringify(normalize(f1)) === JSON.stringify(normalize(f2));
};

const ProductScreen: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);

    // EFECTO PRINCIPAL PARA CARGA INICIAL Y APLICACIÓN DE FILTROS DE URL
    useEffect(() => {
        console.log("ProductScreen useEffect triggered by URL or store change.");

        const filtersFromUrl = parseFiltersFromUrl(location.search);

        // Filtra para eliminar propiedades con valores "vacíos" (null, [], '') para una comparación precisa
        const cleanFiltersFromUrl: ProductFilters = Object.fromEntries(
            Object.entries(filtersFromUrl).filter(([, value]) => {
                if (Array.isArray(value)) return value.length > 0;
                if (typeof value === "string") return value.trim() !== "";
                return value !== null && value !== undefined;
            })
        ) as ProductFilters;

        console.log("ProductScreen - cleanFiltersFromUrl:", cleanFiltersFromUrl);
        console.log("ProductScreen - currentFilters (from Zustand store):", currentFilters);

        // Compara los filtros de la URL con los filtros actuales del store.
        // Solo actualiza y re-busca si hay una diferencia significativa.
        if (!areFiltersEqual(cleanFiltersFromUrl, currentFilters)) {
            console.log("ProductScreen: URL filters differ from store. Applying filters from URL.");
            setAndFetchFilteredProductsAction(cleanFiltersFromUrl);
        } else if (
            Object.keys(cleanFiltersFromUrl).length === 0 &&
            filteredProducts.length === 0 &&
            !loading &&
            !error
        ) {
            // Si no hay filtros en la URL y el store está vacío, y no estamos cargando/con error,
            // esto es una carga inicial sin filtros, entonces pedimos todos los productos.
            console.log("ProductScreen: No URL filters, store filters empty, and product list empty. Fetching all products.");
            fetchProductsAction();
        } else {
            console.log("ProductScreen: URL filters are already in sync with store or no fetch needed.");
        }
    }, [
        location.search,
        fetchProductsAction,
        setAndFetchFilteredProductsAction,
        currentFilters,
        filteredProducts.length,
        loading,
        error,
    ]);

    // EFECTO PARA CARGAR LAS OPCIONES DE FILTRO DISPONIBLES (categorías, colores, talles)
    useEffect(() => {
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

        // Cargar las opciones disponibles solo si aún no se han cargado
        if (availableCategories.length === 0 && availableColors.length === 0 && availableSizes.length === 0) {
            fetchAvailableOptions();
        }
    }, [availableCategories.length, availableColors.length, availableSizes.length]);

    // Funciones de manejo del FilterPanel
    const handleApplyFilters = useCallback((filtersFromPanel: ProductFilters) => {
        console.log("Filters applied from panel (ProductScreen):", filtersFromPanel);

        // Lógica para construir y actualizar la URL
        const params = new URLSearchParams();
        Object.entries(filtersFromPanel).forEach(([key, value]) => {
            if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item !== null && item !== undefined && typeof item === "string" && item.trim() !== "") {
                        params.append(key, String(item));
                    }
                });
            } else {
                params.set(key, String(value));
            }
        });

        const newSearch = params.toString();
        navigate(`?${newSearch}`, { replace: true }); // Actualiza la URL
        setIsFilterPanelOpen(false); // Cierra el panel de filtros
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        console.log("Clearing filters (ProductScreen):");
        clearFiltersAction(); // Limpia los filtros en el store
        navigate("", { replace: true }); // Limpia los parámetros de la URL
        setIsFilterPanelOpen(false); // Cierra el panel
    }, [clearFiltersAction, navigate]);

    const openFilterPanel = useCallback(() => setIsFilterPanelOpen(true), []);
    const closeFilterPanel = useCallback(() => setIsFilterPanelOpen(false), []);

    // Renderizado condicional
    let content;
    if (loading && filteredProducts.length === 0) {
        content = <div className={styles.loadingMessage}>Cargando productos...</div>;
    } else if (error && filteredProducts.length === 0) {
        content = <div className={styles.errorMessage}>Error al cargar productos: {error}</div>;
    } else if (Array.isArray(filteredProducts) && filteredProducts.length > 0) {
        content = (
            <div className={styles.productList}>
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id ?? `product-${Math.random()}`} // Asegura un key único
                        product={product}
                    />
                ))}
            </div>
        );
    } else if (currentFilters && Object.keys(currentFilters).length > 0) {
        // Hay filtros aplicados, pero no hay resultados
        content = (
            <div className={styles.noResults}>
                No se encontraron productos que coincidan con los filtros seleccionados.
            </div>
        );
    } else {
        // No hay productos ni filtros aplicados, y no hay error/carga
        content = (
            <div className={styles.noProductsMessage}>
                No hay productos disponibles.
            </div>
        );
    }

    return (
        <div className={styles.mainWrapper}> {/* Nuevo contenedor principal para centrar */}
            <Header />
            <main className={styles.container}> {/* Usamos <main> para el contenido principal */}
                <button className={styles.openFilterButton} onClick={openFilterPanel} aria-label="Abrir filtros">
                    <span className={styles.filterButtonIcon}></span> {/* Icono en CSS */}
                    Filtrar
                </button>

                <FilterPanel
                    isOpen={isFilterPanelOpen}
                    onClose={closeFilterPanel}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    availableCategories={availableCategories}
                    availableColors={availableColors}
                    availableSizes={availableSizes}
                    initialFilters={currentFilters}
                />

                {content}
            </main>
            <Footer />
        </div>
    );
};

export default ProductScreen;
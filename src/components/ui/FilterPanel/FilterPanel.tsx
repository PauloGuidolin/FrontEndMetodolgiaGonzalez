// Archivo: src/ui/FilterPanel/FilterPanel.tsx

import React, { useState, useEffect } from "react";
import styles from "./FilterPanel.module.css";
// Importamos la interfaz ProductFilters (asegúrate de la ruta correcta)
// Si la interfaz ProductFilters está definida en el store.ts, impórtala desde allí:
import { ProductFilters } from "../../../store/productStore";
// O impórtala desde donde la hayas definido (ej: '../types/ProductFilters')
// import { ProductFilters } from '../types/ProductFilters';

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  onClearFilters: () => void;
  // available... ahora deberían ser string[] si tu backend los devuelve así
  // Y tu productService los mapea a string[]
  availableCategories: string[]; // <-- Esperamos array de strings
  availableColors: string[]; // <-- Esperamos array de strings
  availableSizes: string[]; // <-- Esperamos array de strings
  initialFilters?: ProductFilters;
  // ... otras props
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  availableCategories,
  availableColors,
  availableSizes,
  initialFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<ProductFilters>(() => {
    // Definir filtros por defecto con los nombres corregidos
    const defaultFilters: ProductFilters = {
      categorias: [], // <-- Usar 'categorias'
      sexo: null, // Usar null para indicar "no seleccionado"
      colores: [], // <-- Usar 'colores'
      talles: [], // <-- Usar 'talles'
      minPrice: null,
      maxPrice: null,
      discount: null, // O tienePromocion: null;
      tienePromocion: null, // Si usas este filtro
      orderBy: null,
      orderDirection: null,
      denominacion: null,
    };
    // Combinar con filtros iniciales, asegurando que los arrays sean arrays
    const combinedFilters: ProductFilters = {
      ...defaultFilters,
      ...initialFilters,
      // Asegurar que los campos de array existan y sean arrays
      categorias: Array.isArray(initialFilters?.categorias)
        ? initialFilters.categorias
        : [], // <-- Usar 'categorias'
      colores: Array.isArray(initialFilters?.colores)
        ? initialFilters.colores
        : [], // <-- Usar 'colores'
      talles: Array.isArray(initialFilters?.talles)
        ? initialFilters.talles
        : [], // <-- Usar 'talles'
      // Asegurar que los números sean números válidos o null
      minPrice:
        typeof initialFilters?.minPrice === "number" &&
        isFinite(initialFilters.minPrice)
          ? initialFilters.minPrice
          : null,
      maxPrice:
        typeof initialFilters?.maxPrice === "number" &&
        isFinite(initialFilters.maxPrice)
          ? initialFilters.maxPrice
          : null,
      // Asegurar que los otros campos sean null o su valor si no es null/undefined/''
      sexo: initialFilters?.sexo ?? null,
      discount: initialFilters?.discount ?? null,
      tienePromocion: initialFilters?.tienePromocion ?? null, // Si usas este
      orderBy: initialFilters?.orderBy ?? null,
      orderDirection: initialFilters?.orderDirection ?? null,
      denominacion: initialFilters?.denominacion ?? null,
    };
    console.log("FilterPanel initial state (useState):", combinedFilters);
    return combinedFilters;
  });

  // Sincronizar estado local con initialFilters del store cuando el panel se abre o los filtros iniciales cambian
  useEffect(() => {
    // Sincronizar solo si initialFilters ha cambiado significativamente O si el panel se abre (para resetear la vista)
    // Una forma simple es siempre sincronizar con initialFilters cuando el panel se abre o initialFilters cambia
    // Esto asegura que el estado del panel refleje los filtros actuales del store.
    const syncedFilters: ProductFilters = {
      denominacion: initialFilters?.denominacion ?? null,
      sexo: initialFilters?.sexo ?? null,
      discount: initialFilters?.discount ?? null, // O tienePromocion
      tienePromocion: initialFilters?.tienePromocion ?? null, // Si usas este
      minPrice:
        typeof initialFilters?.minPrice === "number" &&
        isFinite(initialFilters.minPrice)
          ? initialFilters.minPrice
          : null,
      maxPrice:
        typeof initialFilters?.maxPrice === "number" &&
        isFinite(initialFilters.maxPrice)
          ? initialFilters.maxPrice
          : null,
      orderBy: initialFilters?.orderBy ?? null,
      orderDirection: initialFilters?.orderDirection ?? null,
      // Asegurar que los arrays se sincronicen correctamente
      categorias: Array.isArray(initialFilters?.categorias)
        ? initialFilters.categorias
        : [], // <-- Usar 'categorias'
      colores: Array.isArray(initialFilters?.colores)
        ? initialFilters.colores
        : [], // <-- Usar 'colores'
      talles: Array.isArray(initialFilters?.talles)
        ? initialFilters.talles
        : [], // <-- Usar 'talles'
    };
    console.log("FilterPanel useEffect sync:", syncedFilters);
    setSelectedFilters(syncedFilters);
  }, [initialFilters]); // Depende solo de initialFilters

  // Manejar cambios en inputs de texto o select (precio, sexo, ordenamiento, denominacion)
  const handleFilterChange = (filterName: keyof ProductFilters, value: any) => {
    setSelectedFilters((prevFilters) => {
      // Convertir string vacío a null para campos no array
      const newValue =
        typeof value === "string" && value.trim() === "" ? null : value;
      console.log(`Filter change: ${String(filterName)} = ${newValue}`);
      return { ...prevFilters, [filterName]: newValue };
    });
  };

  // Manejar cambios en checkboxes (categorias, colores, talles)
  // Nota: Los nombres de los parámetros deben ser 'categorias', 'colores', 'talles'
  const handleCheckboxChange = (
    filterName: "categorias" | "colores" | "talles",
    value: string,
    isChecked: boolean
  ) => {
    setSelectedFilters((prevFilters) => {
      // Asegurarse de que el array existe antes de modificarlo
      const currentValues = Array.isArray(prevFilters[filterName])
        ? (prevFilters[filterName] as string[])
        : [];
      const newValues = isChecked
        ? [...currentValues, value] // Añadir el valor si está marcado
        : currentValues.filter((item) => item !== value); // Quitar el valor si no está marcado

      console.log(
        `Checkbox change: ${filterName}, value: ${value}, checked: ${isChecked}, newValues:`,
        newValues
      );
      return { ...prevFilters, [filterName]: newValues };
    });
  };

  // Manejar cambio en checkbox de promoción (si usas ese filtro)
  const handlePromotionChange = (isChecked: boolean) => {
    setSelectedFilters((prevFilters) => {
      // Establecer tienePromocion a true/false o null si desmarcas "Mostrar solo promoción"
      const newValue = isChecked ? true : null; // Podrías usar false si quieres filtrar por NO promoción también
      console.log("Promotion checkbox change, newValue:", newValue);
      return { ...prevFilters, tienePromocion: newValue };
    });
  };

  // Al aplicar filtros, llamar a la prop onApplyFilters con el estado local de filtros seleccionados
  const handleApplyClick = () => {
    console.log("Applying filters:", selectedFilters); // LOG AQUI
    onApplyFilters(selectedFilters); // Pasar los filtros seleccionados al componente padre (ProductScreen)
    // onClose(); // Opcional: Cerrar el panel al aplicar
  };

  // Al limpiar filtros, resetear el estado local a los valores por defecto y llamar a la prop onClearFilters
  const handleClearClick = () => {
    console.log("Clearing filters."); // LOG AQUI
    const defaultFilters: ProductFilters = {
      denominacion: null,
      categorias: [], // <-- Usar 'categorias' y array vacío
      sexo: null,
      colores: [], // <-- Usar 'colores' y array vacío
      talles: [], // <-- Usar 'talles' y array vacío
      minPrice: null,
      maxPrice: null,
      discount: null, // O tienePromocion: null;
      tienePromocion: null, // Si usas este filtro
      orderBy: null,
      orderDirection: null,
    };
    setSelectedFilters(defaultFilters); // Resetear estado local
    onClearFilters(); // Llamar a la acción de limpiar del store
    // onClose(); // Opcional: Cerrar el panel al limpiar
  };

  // No renderiza nada si el panel no está abierto
  if (!isOpen) return null;

  return (
    <div
      className={`${styles.filterPanelOverlay} ${isOpen ? styles.isOpen : ""}`}
      onClick={onClose}
    >
      {/* El panel interior, evita que el clic dentro cierre el overlay */}
      <div
        className={`${styles.filterPanel} ${isOpen ? styles.isOpen : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.filterPanelHeader}>
          <h2>Filtrar y ordenar</h2>
          <button className={styles.closeFilterButton} onClick={onClose}>
            X
          </button>
        </div>
        <div className={styles.filterPanelContent}>

          {/* Sección de Ordenar Por */}
          <div className={styles.filterSection}>
            <h3>ORDENAR POR</h3>
            <select
              className={styles.filterSelect}
              value={selectedFilters.orderBy ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "orderBy",
                  e.target.value === "" ? null : e.target.value
                )
              }
            >
              <option value="">Por defecto</option>
              <option value="precioVenta">Precio</option>{" "}
              {/* Asegúrate que 'precioVenta' o 'precioOriginal' sea el campo por el que ordenas en backend */}
              <option value="denominacion">Nombre</option>
              {/* Añade otras opciones de ordenamiento si tu backend las soporta */}
              {/* <option value="stockActual">Stock</option> */}
            </select>
            <select
              className={styles.filterSelect}
              value={selectedFilters.orderDirection ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "orderDirection",
                  e.target.value === ""
                    ? null
                    : (e.target.value as "asc" | "desc")
                )
              }
            >
              <option value="">Por defecto</option>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          {/* Sección de Precio */}
          <div className={styles.filterSection}>
            <h3>PRECIO</h3>
            <div className={styles.priceInputs}>
              <input
                type="number"
                className={styles.filterInputNumber}
                value={selectedFilters.minPrice ?? ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", parseFloat(e.target.value))
                }
                placeholder="Min"
                step="0.01" // Para permitir decimales
              />
              <span>-</span>
              <input
                type="number"
                className={styles.filterInputNumber}
                value={selectedFilters.maxPrice ?? ""}
                onChange={(e) =>
                  handleFilterChange("maxPrice", parseFloat(e.target.value))
                }
                placeholder="Max"
                step="0.01"
              />
            </div>
          </div>

          {/* Sección de Sexo */}
          <div className={styles.filterSection}>
            <h3>SEXO</h3>
            <select
              className={styles.filterSelect}
              value={selectedFilters.sexo ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "sexo",
                  e.target.value === "" ? null : e.target.value
                )
              }
            >
              <option value="">Todos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="UNISEX">Unisex</option>
              {/* Asegúrate que estos valores coincidan exactamente con tus Enums de backend */}
            </select>
          </div>

          {/* Sección de Promoción (opcional) */}
          <div className={styles.filterSection}>
            <h3>PROMOCIÓN</h3>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                id="filter-promotion"
                // Checked es true si selectedFilters.tienePromocion es EXACTAMENTE true
                checked={selectedFilters.tienePromocion === true}
                onChange={(e) => handlePromotionChange(e.target.checked)}
              />
              <label htmlFor="filter-promotion">
                Solo productos en promoción
              </label>
            </div>
          </div>

          {/* Sección de Categoría (Checkboxes) */}
          <div className={styles.filterSection}>
            <h3>CATEGORÍA</h3>
            {/*availableCategories es string[]*/}
            {Array.isArray(availableCategories) &&
              availableCategories.length === 0 && (
                <p>No hay categorías disponibles.</p>
              )}
            {Array.isArray(availableCategories) &&
              availableCategories.map((categoryName, index) => {
                if (!categoryName || typeof categoryName !== "string") {
                  console.warn(
                    "Skipping rendering for invalid category item:",
                    categoryName
                  );
                  return null; // No renderiza si el nombre no es un string válido
                }

                // Usamos el nombre de la categoría como key (debería ser único si la lista proviene de uniqueCategories)
                const key = categoryName; // O considera usar un hash si los nombres son muy largos

                return (
                  <div key={key} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`category-${key}`}
                      value={categoryName} // El valor siempre debe ser el nombre string
                      // checked es true si el nombre de la categoría está en el array selectedFilters.categorias
                      checked={
                        (Array.isArray(selectedFilters.categorias) &&
                          selectedFilters.categorias.includes(categoryName)) ||
                        false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "categorias",
                          categoryName,
                          e.target.checked
                        )
                      } // <-- Usar 'categorias'
                    />
                    <label htmlFor={`category-${key}`}>{categoryName}</label>
                  </div>
                );
              })}
          </div>

          {/* Sección de Color (Checkboxes) */}
          <div className={styles.filterSection}>
            <h3>COLOR</h3>
            {/*availableColors es string[]*/}
            {Array.isArray(availableColors) && availableColors.length === 0 && (
              <p>No hay colores disponibles.</p>
            )}
            {Array.isArray(availableColors) &&
              availableColors.map((colorName, index) => {
                if (!colorName || typeof colorName !== "string") {
                  console.warn(
                    "Skipping rendering for invalid color item:",
                    colorName
                  );
                  return null;
                }

                const key = colorName; // O considera usar un hash

                return (
                  <div key={key} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`color-${key}`}
                      value={colorName}
                      // checked es true si el nombre del color está en el array selectedFilters.colores
                      checked={
                        (Array.isArray(selectedFilters.colores) &&
                          selectedFilters.colores.includes(colorName)) ||
                        false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "colores",
                          colorName,
                          e.target.checked
                        )
                      } // <-- Usar 'colores'
                    />
                    <label htmlFor={`color-${key}`}>{colorName}</label>
                  </div>
                );
              })}
          </div>

          {/* Sección de Talla (Checkboxes) */}
          <div className={styles.filterSection}>
            <h3>TALLA</h3>
            {/*availableSizes es string[]*/}
            {Array.isArray(availableSizes) && availableSizes.length === 0 && (
              <p>No hay tallas disponibles.</p>
            )}
            {Array.isArray(availableSizes) &&
              availableSizes.map((sizeName, index) => {
                if (!sizeName || typeof sizeName !== "string") {
                  console.warn(
                    "Skipping rendering for invalid size item:",
                    sizeName
                  );
                  return null;
                }

                const key = sizeName; // O considera usar un hash

                return (
                  <div key={key} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`size-${key}`}
                      value={sizeName}
                      // checked es true si el nombre de la talla está en el array selectedFilters.talles
                      checked={
                        (Array.isArray(selectedFilters.talles) &&
                          selectedFilters.talles.includes(sizeName)) ||
                        false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          "talles",
                          sizeName,
                          e.target.checked
                        )
                      } // <-- Usar 'talles'
                    />
                    <label htmlFor={`size-${key}`}>{sizeName}</label>
                  </div>
                );
              })}
          </div>

          {/* ... otras secciones de filtro si las tienes ... */}
        </div>

        <div className={styles.filterPanelFooter}>
          <button
            className={styles.clearFilterButton}
            onClick={handleClearClick}
          >
            Limpiar Filtros
          </button>
          <button
            className={styles.applyFilterButton}
            onClick={handleApplyClick}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

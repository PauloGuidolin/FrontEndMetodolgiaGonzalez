import React, { useState, useEffect, useCallback } from 'react';
import styles from './FilterPanel.module.css';
import { ProductFilters } from '../../../store/productStore'; // Define la estructura de los filtros de productos.
import { Sexo } from '../../../types/ISexo'; // Enumeración para el tipo de sexo.

// Importación de íconos de 'react-icons' para mejorar la UI.
import { FaPercent, FaTshirt, FaPaintBrush, FaRulerCombined, FaDollarSign, FaSortAlphaDown, FaSearch } from 'react-icons/fa';

/**
 * Define las propiedades del componente FilterPanel.
 */
export interface FilterPanelProps {
    isOpen: boolean; // Controla la visibilidad del panel.
    onClose: () => void; // Callback para cerrar el panel.
    onApplyFilters: (filters: ProductFilters) => void; // Callback para aplicar los filtros seleccionados.
    onClearFilters: () => void; // Callback para limpiar todos los filtros.
    availableCategories: string[]; // Lista de categorías disponibles para filtrar.
    availableColors: string[]; // Lista de colores disponibles para filtrar.
    availableSizes: string[]; // Lista de tallas disponibles para filtrar.
    initialFilters?: ProductFilters; // Filtros iniciales para pre-llenar el panel.
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
    // Estado local para almacenar los filtros seleccionados por el usuario.
    const [selectedFilters, setSelectedFilters] = useState<ProductFilters>(() => {
        // Define los filtros por defecto.
        const defaultFilters: ProductFilters = {
            categorias: [],
            sexo: null,
            colores: [],
            talles: [],
            minPrice: null,
            maxPrice: null,
            tienePromocion: null,
            orderBy: null,
            orderDirection: null,
            denominacion: null,
        };
        // Combina los filtros por defecto con los filtros iniciales proporcionados.
        const combinedFilters: ProductFilters = {
            ...defaultFilters,
            ...initialFilters,
            categorias: Array.isArray(initialFilters?.categorias) ? initialFilters.categorias : [],
            colores: Array.isArray(initialFilters?.colores) ? initialFilters.colores : [],
            talles: Array.isArray(initialFilters?.talles) ? initialFilters.talles : [],
            // Asegura que los precios sean números finitos o null.
            minPrice: typeof initialFilters?.minPrice === 'number' && isFinite(initialFilters.minPrice) ? initialFilters.minPrice : null,
            maxPrice: typeof initialFilters?.maxPrice === 'number' && isFinite(initialFilters.maxPrice) ? initialFilters.maxPrice : null,
            sexo: initialFilters?.sexo ?? null,
            tienePromocion: initialFilters?.tienePromocion ?? null,
            orderBy: initialFilters?.orderBy ?? null,
            orderDirection: initialFilters?.orderDirection ?? null,
            denominacion: initialFilters?.denominacion ?? null,
        };
        console.log("FilterPanel initial state (useState):", combinedFilters);
        return combinedFilters;
    });

    // Sincroniza el estado local de los filtros cuando `initialFilters` cambian.
    useEffect(() => {
        const syncedFilters: ProductFilters = {
            denominacion: initialFilters?.denominacion ?? null,
            sexo: initialFilters?.sexo ?? null,
            tienePromocion: initialFilters?.tienePromocion ?? null,
            minPrice: typeof initialFilters?.minPrice === 'number' && isFinite(initialFilters.minPrice) ? initialFilters.minPrice : null,
            maxPrice: typeof initialFilters?.maxPrice === 'number' && isFinite(initialFilters.maxPrice) ? initialFilters.maxPrice : null,
            orderBy: initialFilters?.orderBy ?? null,
            orderDirection: initialFilters?.orderDirection ?? null,
            categorias: Array.isArray(initialFilters?.categorias) ? initialFilters.categorias : [],
            colores: Array.isArray(initialFilters?.colores) ? initialFilters.colores : [],
            talles: Array.isArray(initialFilters?.talles) ? initialFilters.talles : [],
        };
        console.log("FilterPanel useEffect sync:", syncedFilters);
        setSelectedFilters(syncedFilters);
    }, [initialFilters]);

    /**
     * Maneja los cambios en los inputs de texto y selectores.
     * @param filterName El nombre del filtro a actualizar.
     * @param value El nuevo valor para el filtro.
     */
    const handleFilterChange = useCallback((filterName: keyof ProductFilters, value: any) => {
        setSelectedFilters(prevFilters => {
            const newValue = (typeof value === 'string' && value.trim() === '') ? null : value;
            console.log(`Filter change: ${String(filterName)} = ${newValue}`);
            return { ...prevFilters, [filterName]: newValue };
        });
    }, []);

    /**
     * Maneja los cambios en los checkboxes de categorías, colores y tallas.
     * @param filterName El nombre del filtro de array ('categorias', 'colores', 'talles').
     * @param value El valor del checkbox (nombre de la categoría/color/talla).
     * @param isChecked Si el checkbox está marcado o desmarcado.
     */
    const handleCheckboxChange = useCallback((filterName: 'categorias' | 'colores' | 'talles', value: string, isChecked: boolean) => {
        setSelectedFilters(prevFilters => {
            const currentValues = Array.isArray(prevFilters[filterName]) ? (prevFilters[filterName] as string[]) : [];
            const newValues = isChecked
                ? [...currentValues, value]
                : currentValues.filter(item => item !== value);
            console.log(`Checkbox change: ${filterName}, value: ${value}, checked: ${isChecked}, newValues:`, newValues);
            return { ...prevFilters, [filterName]: newValues };
        });
    }, []);

    /**
     * Maneja el cambio en el checkbox de "Solo productos en promoción".
     * @param isChecked Si el checkbox de promoción está marcado o desmarcado.
     */
    const handlePromotionChange = useCallback((isChecked: boolean) => {
        setSelectedFilters(prevFilters => {
            const newValue = isChecked ? true : null; // Si está marcado, true; si no, null.
            console.log("Promotion checkbox change, newValue:", newValue);
            return { ...prevFilters, tienePromocion: newValue };
        });
    }, []);

    /**
     * Aplica los filtros actuales y cierra el panel.
     */
    const handleApplyClick = useCallback(() => {
        console.log("Applying filters:", selectedFilters);
        onApplyFilters(selectedFilters);
        // onClose(); // Puedes descomentar esto si quieres que el panel se cierre automáticamente al aplicar.
    }, [onApplyFilters, selectedFilters]);

    /**
     * Limpia todos los filtros y restablece el estado del panel a los valores por defecto.
     */
    const handleClearClick = useCallback(() => {
        console.log("Clearing filters.");
        const defaultFilters: ProductFilters = {
            denominacion: null,
            categorias: [],
            sexo: null,
            colores: [],
            talles: [],
            minPrice: null,
            maxPrice: null,
            tienePromocion: null,
            orderBy: null,
            orderDirection: null,
        };
        setSelectedFilters(defaultFilters);
        onClearFilters(); // Notifica al componente padre que los filtros se han limpiado.
        // onClose(); // Puedes descomentar esto si quieres que el panel se cierre automáticamente al limpiar.
    }, [onClearFilters]);

    // Si el panel no está abierto, no renderiza nada.
    if (!isOpen) return null;

    return (
        <div className={`${styles.filterPanelOverlay} ${isOpen ? styles.isOpen : ''}`} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="filter-panel-title">
            <div className={`${styles.filterPanel} ${isOpen ? styles.isOpen : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.filterPanelHeader}>
                    <h2 id="filter-panel-title">Filtrar y ordenar</h2>
                    <button className={styles.closeFilterButton} onClick={onClose} aria-label="Cerrar panel de filtros">X</button>
                </div>
                <div className={styles.filterPanelContent}>

                    {/* Sección de Búsqueda por Nombre */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaSearch className={styles.sectionIcon} aria-hidden="true" />
                            BUSCAR POR NOMBRE
                        </h3>
                        <input
                            type="text"
                            className={styles.filterInputText}
                            value={selectedFilters.denominacion ?? ''}
                            onChange={(e) => handleFilterChange('denominacion', e.target.value)}
                            placeholder="Nombre del producto..."
                            aria-label="Buscar por nombre de producto"
                        />
                    </div>

                    {/* Sección de Ordenar Por */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaSortAlphaDown className={styles.sectionIcon} aria-hidden="true" />
                            ORDENAR POR
                        </h3>
                        <select
                            className={styles.filterSelect}
                            value={selectedFilters.orderBy ?? ''}
                            onChange={(e) => handleFilterChange('orderBy', e.target.value === '' ? null : e.target.value)}
                            aria-label="Ordenar por"
                        >
                            <option value="">Por defecto</option>
                            <option value="precioVenta">Precio</option>
                            <option value="denominacion">Nombre</option>
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={selectedFilters.orderDirection ?? ''}
                            onChange={(e) => handleFilterChange('orderDirection', e.target.value === '' ? null : e.target.value as 'asc' | 'desc')}
                            aria-label="Dirección de ordenamiento"
                        >
                            <option value="">Por defecto</option>
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </div>

                    {/* Sección de Precio */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaDollarSign className={styles.sectionIcon} aria-hidden="true" />
                            PRECIO
                        </h3>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                className={styles.filterInputNumber}
                                value={selectedFilters.minPrice ?? ''}
                                onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value))}
                                placeholder="Min"
                                step="0.01"
                                aria-label="Precio mínimo"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                className={styles.filterInputNumber}
                                value={selectedFilters.maxPrice ?? ''}
                                onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                                placeholder="Max"
                                step="0.01"
                                aria-label="Precio máximo"
                            />
                        </div>
                    </div>

                    {/* Sección de Sexo */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaTshirt className={styles.sectionIcon} aria-hidden="true" />
                            SEXO
                        </h3>
                        <select
                            className={styles.filterSelect}
                            value={selectedFilters.sexo ?? ''}
                            onChange={(e) => handleFilterChange('sexo', e.target.value === '' ? null : e.target.value)}
                            aria-label="Filtrar por sexo"
                        >
                            <option value="">Todos</option>
                            <option value={Sexo.MASCULINO}>Masculino</option>
                            <option value={Sexo.FEMENINO}>Femenino</option>
                            <option value={Sexo.UNISEX}>Unisex</option>
                        </select>
                    </div>

                    {/* Sección de Promoción */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaPercent className={styles.sectionIcon} aria-hidden="true" />
                            PROMOCIÓN
                        </h3>
                        <div className={styles.checkboxItem}>
                            <input
                                type="checkbox"
                                id="filter-promotion"
                                checked={selectedFilters.tienePromocion === true}
                                onChange={(e) => handlePromotionChange(e.target.checked)}
                                aria-checked={selectedFilters.tienePromocion === true}
                            />
                            <label htmlFor="filter-promotion">Solo productos en promoción</label>
                        </div>
                    </div>

                    {/* Sección de Categoría (Checkboxes) */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaTshirt className={styles.sectionIcon} aria-hidden="true" />
                            CATEGORÍA
                        </h3>
                        {Array.isArray(availableCategories) && availableCategories.length === 0 && <p className={styles.noFiltersMessage}>No hay categorías disponibles.</p>}
                        {Array.isArray(availableCategories) && availableCategories.map((categoryName) => {
                            if (!categoryName || typeof categoryName !== 'string') {
                                return null;
                            }
                            const key = categoryName;
                            return (
                                <div key={key} className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        id={`category-${key}`}
                                        value={categoryName}
                                        checked={Array.isArray(selectedFilters.categorias) && selectedFilters.categorias.includes(categoryName) || false}
                                        onChange={(e) => handleCheckboxChange('categorias', categoryName, e.target.checked)}
                                        aria-checked={Array.isArray(selectedFilters.categorias) && selectedFilters.categorias.includes(categoryName) || false}
                                        aria-label={`Filtrar por categoría: ${categoryName}`}
                                    />
                                    <label htmlFor={`category-${key}`}>{categoryName}</label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sección de Color (Checkboxes) */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaPaintBrush className={styles.sectionIcon} aria-hidden="true" />
                            COLOR
                        </h3>
                        {Array.isArray(availableColors) && availableColors.length === 0 && <p className={styles.noFiltersMessage}>No hay colores disponibles.</p>}
                        {Array.isArray(availableColors) && availableColors.map((colorName) => {
                            if (!colorName || typeof colorName !== 'string') {
                                return null;
                            }
                            const key = colorName;
                            return (
                                <div key={key} className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        id={`color-${key}`}
                                        value={colorName}
                                        checked={Array.isArray(selectedFilters.colores) && selectedFilters.colores.includes(colorName) || false}
                                        onChange={(e) => handleCheckboxChange('colores', colorName, e.target.checked)}
                                        aria-checked={Array.isArray(selectedFilters.colores) && selectedFilters.colores.includes(colorName) || false}
                                        aria-label={`Filtrar por color: ${colorName}`}
                                    />
                                    <label htmlFor={`color-${key}`}>{colorName}</label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sección de Talla (Checkboxes) */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.sectionTitleWithIcon}>
                            <FaRulerCombined className={styles.sectionIcon} aria-hidden="true" />
                            TALLA
                        </h3>
                        {Array.isArray(availableSizes) && availableSizes.length === 0 && <p className={styles.noFiltersMessage}>No hay tallas disponibles.</p>}
                        {Array.isArray(availableSizes) && availableSizes.map((sizeName) => {
                            if (!sizeName || typeof sizeName !== 'string') {
                                return null;
                            }
                            const key = sizeName;
                            return (
                                <div key={key} className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        id={`size-${key}`}
                                        value={sizeName}
                                        checked={Array.isArray(selectedFilters.talles) && selectedFilters.talles.includes(sizeName) || false}
                                        onChange={(e) => handleCheckboxChange('talles', sizeName, e.target.checked)}
                                        aria-checked={Array.isArray(selectedFilters.talles) && selectedFilters.talles.includes(sizeName) || false}
                                        aria-label={`Filtrar por talla: ${sizeName}`}
                                    />
                                    <label htmlFor={`size-${key}`}>{sizeName}</label>
                                </div>
                            );
                        })}
                    </div>

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
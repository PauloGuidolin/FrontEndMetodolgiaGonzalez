import React, { useState } from 'react';
import styles from './CategoryTable.module.css';
import { useCategoryStore } from '../../../store/categoryStore';
import { CategoriaDTO } from '../../dto/CategoriaDTO';

// Componentes de flechas para indicar el estado expandido/contraído
const ChevronRight = () => <span className={styles.chevron}>▶</span>;
const ChevronDown = () => <span className={styles.chevron}>▼</span>;

/**
 * Define las propiedades esperadas por el componente CategoryTable.
 * `depth` se usa para renderizado recursivo de subcategorías.
 */
interface CategoryTableProps {
    categories: CategoriaDTO[];
    loading: boolean;
    error: string | null;
    onEditCategoria: (categoria: CategoriaDTO) => void;
    onToggleCategoriaActive: (id: number, currentStatus: boolean, denominacion: string) => void;
    onDeleteCategoria: (categoria: CategoriaDTO) => void; // Aunque no se usa en este código, se mantiene por la interfaz.
    onCreateSubcategoria: (parentCategory: CategoriaDTO) => void;
    depth?: number; // Profundidad actual de la categoría (0 para categorías raíz).
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
    categories,
    loading,
    error,
    onEditCategoria,
    onToggleCategoriaActive,
    onDeleteCategoria,
    onCreateSubcategoria,
    depth = 0
}) => {
    // Estado para controlar qué categorías están expandidas.
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    // Acciones y estados del store de Zustand para subcategorías.
    const fetchSubcategories = useCategoryStore(state => state.fetchSubcategories);
    const fetchedSubcategories = useCategoryStore(state => state.fetchedSubcategories);
    const loadingSubcategories = useCategoryStore(state => state.loadingSubcategories);
    const errorSubcategories = useCategoryStore(state => state.errorSubcategories);

    /**
     * Maneja la expansión/contracción de una categoría y la carga de sus subcategorías.
     */
    const handleToggleExpand = (categoryId: number, categoria: CategoriaDTO) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
            // Carga subcategorías si no han sido cargadas o si el array está vacío.
            if (categoria.id) {
                if (!fetchedSubcategories.has(categoryId) || fetchedSubcategories.get(categoryId)?.length === 0) {
                    fetchSubcategories(categoria.id);
                }
            }
        }
        setExpandedCategories(newExpanded);
    };

    // Mensajes de estado para las categorías principales.
    if (loading && depth === 0) {
        return <p>Cargando categorías principales...</p>;
    }

    if (error && depth === 0) {
        return <p className={styles.errorText}>Error al cargar categorías principales: {error}</p>;
    }

    // Mensaje cuando no hay categorías o subcategorías.
    if (!categories || categories.length === 0) {
        return (
            <tr>
                <td colSpan={5} style={{ paddingLeft: `${(depth + 1) * 20}px`, fontStyle: 'italic', color: '#555', textAlign: 'left' }}>
                    {depth === 0 ? 'No hay categorías principales para mostrar.' : 'No hay subcategorías para este nivel.'}
                </td>
            </tr>
        );
    }

    /**
     * Función recursiva para renderizar las filas de la tabla de categorías.
     */
    const renderCategoryRows = (categoryList: CategoriaDTO[], currentDepth: number) => {
        return categoryList.map((categoria) => {
            const isExpanded = expandedCategories.has(categoria.id!);
            const subcategoriesForThisParent = fetchedSubcategories.get(categoria.id!) || [];
            const isLoadingSub = loadingSubcategories.has(categoria.id!);
            const subError = errorSubcategories.get(categoria.id!);

            // Determina si una categoría puede tener hijos (y por lo tanto, el botón de expandir).
            const canHaveChildren = subcategoriesForThisParent.length > 0 || !fetchedSubcategories.has(categoria.id!);

            // El botón "Crear Subcategoría" solo es visible para categorías raíz (profundidad 0).
            const showCreateSubcategoryButton = currentDepth === 0;

            return (
                <React.Fragment key={categoria.id}>
                    <tr>
                        {/* Celda para el botón de expandir/contraer y sangría */}
                        <td className={styles.toggleCell} style={{ paddingLeft: `${currentDepth * 20 + 10}px` }}>
                            {canHaveChildren && (
                                <button
                                    onClick={() => handleToggleExpand(categoria.id!, categoria)}
                                    className={styles.toggleButton}
                                    title={isExpanded ? "Contraer subcategorías" : "Expandir subcategorías"}
                                    disabled={isLoadingSub}
                                >
                                    {isLoadingSub ? '...' : (isExpanded ? <ChevronDown /> : <ChevronRight />)}
                                </button>
                            )}
                        </td>
                        <td>{categoria.id}</td>
                        <td>{categoria.denominacion}</td>
                        <td>
                            <span className={`${styles.statusPill} ${categoria.activo ? styles.active : styles.inactive}`}>
                                {categoria.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td className={styles.actions}>
                            <button onClick={() => onEditCategoria(categoria)} className={styles.editButton}>
                                Editar
                            </button>
                            <button
                                onClick={() => onToggleCategoriaActive(categoria.id!, categoria.activo, categoria.denominacion)}
                                className={categoria.activo ? styles.deactivateButton : styles.activateButton}
                            >
                                {categoria.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            {showCreateSubcategoryButton && (
                                <button
                                    onClick={() => onCreateSubcategoria(categoria)}
                                    className={styles.createSubcategoryButton}
                                >
                                    Crear Subcategoría
                                </button>
                            )}
                        </td>
                    </tr>
                    {/* Fila para subcategorías o mensajes de estado de subcategorías */}
                    {isExpanded && (
                        <tr>
                            <td colSpan={5}>
                                {isLoadingSub && <p className={styles.loadingSubText} style={{ paddingLeft: `${(currentDepth + 1) * 20}px` }}>Cargando subcategorías...</p>}
                                {subError && <p className={styles.errorSubText} style={{ paddingLeft: `${(currentDepth + 1) * 20}px` }}>Error: {subError}</p>}
                                {!isLoadingSub && !subError && subcategoriesForThisParent.length > 0 && (
                                    <CategoryTable
                                        categories={subcategoriesForThisParent}
                                        loading={false}
                                        error={null}
                                        onEditCategoria={onEditCategoria}
                                        onToggleCategoriaActive={onToggleCategoriaActive}
                                        onDeleteCategoria={onDeleteCategoria}
                                        onCreateSubcategoria={onCreateSubcategoria}
                                        depth={currentDepth + 1}
                                    />
                                )}
                                {!isLoadingSub && !subError && subcategoriesForThisParent.length === 0 && (
                                    <p className={styles.noSubcategoriesText} style={{ paddingLeft: `${(currentDepth + 1) * 20}px` }}>No hay subcategorías.</p>
                                )}
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <React.Fragment>
            {depth === 0 ? (
                <div className={styles.tableContainer} style={{ width: '100%' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '30px' }}></th>
                                <th>ID</th>
                                <th>Denominación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderCategoryRows(categories, 0)}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Si no es la tabla principal, solo renderiza el cuerpo (para subtablas recursivas).
                <tbody>
                    {renderCategoryRows(categories, depth)}
                </tbody>
            )}
        </React.Fragment>
    );
};
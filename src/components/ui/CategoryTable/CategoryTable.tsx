

import React, { useState } from 'react';
import styles from './CategoryTable.module.css';
import { useCategoryStore } from '../../../store/categoryStore';
import { CategoriaDTO } from '../../dto/CategoriaDTO';

const ChevronRight = () => <span className={styles.chevron}>▶</span>;
const ChevronDown = () => <span className={styles.chevron}>▼</span>;

interface CategoryTableProps {
    categories: CategoriaDTO[];
    loading: boolean;
    error: string | null;
    onEditCategoria: (categoria: CategoriaDTO) => void;
    onToggleCategoriaActive: (id: number, currentStatus: boolean, denominacion: string) => void;
    onDeleteCategoria: (categoria: CategoriaDTO) => void; 
    onCreateSubcategoria: (parentCategory: CategoriaDTO) => void;
    depth?: number;
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
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const fetchSubcategories = useCategoryStore(state => state.fetchSubcategories);
    const fetchedSubcategories = useCategoryStore(state => state.fetchedSubcategories);
    const loadingSubcategories = useCategoryStore(state => state.loadingSubcategories);
    const errorSubcategories = useCategoryStore(state => state.errorSubcategories);

    const handleToggleExpand = (categoryId: number, categoria: CategoriaDTO) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
            if (categoria.id) {
                if (!fetchedSubcategories.has(categoryId) || fetchedSubcategories.get(categoryId)?.length === 0) {
                     fetchSubcategories(categoria.id);
                }
            }
        }
        setExpandedCategories(newExpanded);
    };

    if (loading && depth === 0) {
        return <p>Cargando categorías principales...</p>;
    }

    if (error && depth === 0) {
        return <p className={styles.errorText}>Error al cargar categorías principales: {error}</p>;
    }

    if (!categories || categories.length === 0) {
        return (
            <tr>
                <td colSpan={5} style={{ paddingLeft: `${(depth + 1) * 20}px`, fontStyle: 'italic', color: '#555', textAlign: 'left' }}>
                    {depth === 0 ? 'No hay categorías principales para mostrar.' : 'No hay subcategorías para este nivel.'}
                </td>
            </tr>
        );
    }

    const renderCategoryRows = (categoryList: CategoriaDTO[], currentDepth: number) => {
        return categoryList.map((categoria) => {
            const isExpanded = expandedCategories.has(categoria.id!);
            const subcategoriesForThisParent = fetchedSubcategories.get(categoria.id!) || [];
            const isLoadingSub = loadingSubcategories.has(categoria.id!);
            const subError = errorSubcategories.get(categoria.id!);

            const canHaveChildren = subcategoriesForThisParent.length > 0 || !fetchedSubcategories.has(categoria.id!);

            // Determinar si el botón "Crear Subcategoría" debe ser visible
            // Solo es visible si la profundidad es 0 (es decir, es una categoría raíz)
            const showCreateSubcategoryButton = currentDepth === 0;


            return (
                <React.Fragment key={categoria.id}>
                    <tr>
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
                        {/* <td>{categoria.categoriaPadre?.denominacion || 'N/A (Categoría Raíz)'}</td> <-- ELIMINADO */}
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
                    {isExpanded && (
                        <tr>
                            {/* Ajusta colSpan a 5 porque ahora hay 5 columnas (toggle, ID, Denominación, Estado, Acciones) */}
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
                                {/* <th>Categoría Padre</th> <-- ELIMINADO */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderCategoryRows(categories, 0)}
                        </tbody>
                    </table>
                </div>
            ) : (
                <tbody>
                    {renderCategoryRows(categories, depth)}
                </tbody>
            )}
        </React.Fragment>
    );
};
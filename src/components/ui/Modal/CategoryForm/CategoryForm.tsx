// src/components/ui/CategoryComp/CategoryForm/CategoryForm.tsx

import React from 'react';
import styles from './CategoryForm.module.css';
import { CategoriaDTO } from '../../../dto/CategoriaDTO';


interface CategoryFormProps {
    currentCategoria: Partial<CategoriaDTO>;
    // Modificamos el tipo para que pueda manejar selectores también, no solo input
    onCategoriaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmitCategoria: (e: React.FormEvent) => Promise<void>;
    onClearForm: () => void;
    // availableCategories ya no es necesaria si no hay selector de padre
    // availableCategories: CategoriaDTO[]; 
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
    currentCategoria,
    onCategoriaChange,
    onSubmitCategoria,
    onClearForm,
    // availableCategories ya no es necesaria
    // availableCategories 
}) => {
    // filteredAvailableCategories ya no es necesaria
    // const filteredAvailableCategories = availableCategories.filter(
    //     cat => cat.id !== currentCategoria.id
    // );

    return (
        <form onSubmit={onSubmitCategoria} className={styles.form}>
            <input type="hidden" name="id" value={currentCategoria.id || ''} />
            <div className={styles.formGroup}>
                <label htmlFor="categoriaDenominacion">Denominación:</label>
                <input
                    type="text"
                    id="categoriaDenominacion"
                    name="denominacion"
                    value={currentCategoria.denominacion || ''}
                    onChange={onCategoriaChange}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.primaryButton}>
                    {currentCategoria.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
                <button type="button" className={styles.secondaryButton} onClick={onClearForm}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};
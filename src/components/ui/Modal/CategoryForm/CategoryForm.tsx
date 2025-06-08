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
    availableCategories: CategoriaDTO[]; // Nueva prop: lista de categorías para el select padre
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
    currentCategoria,
    onCategoriaChange,
    onSubmitCategoria,
    onClearForm,
    availableCategories // Recibe las categorías disponibles
}) => {
    // Filtramos las categorías disponibles para que una categoría no pueda ser su propia padre,
    // ni una de sus subcategorías (aunque la recursividad puede ser compleja de manejar aquí)
    const filteredAvailableCategories = availableCategories.filter(
        cat => cat.id !== currentCategoria.id
    );

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

            <div className={styles.formGroup}>
                <label htmlFor="categoriaPadre">Categoría Padre:</label>
                <select
                    id="categoriaPadre"
                    name="categoriaPadre"
                    // Si currentCategoria.categoriaPadre existe, usa su id. Si no, usa una cadena vacía.
                    // Convertir a cadena para el valor del select
                    value={currentCategoria.categoriaPadre?.id?.toString() || ''}
                    onChange={onCategoriaChange}
                    className={styles.select} // Puedes crear este estilo en CategoryForm.module.css
                >
                    <option value="">-- Sin categoría padre --</option>
                    {filteredAvailableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.denominacion}
                        </option>
                    ))}
                </select>
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


import React from 'react';
import styles from './CategoryForm.module.css'; // Módulo CSS para estilos específicos.
import { CategoriaDTO } from '../../../dto/CategoriaDTO'; // DTO para la estructura de una categoría.

/**
 * Interfaz que define las propiedades (props) esperadas por el componente CategoryForm.
 */
interface CategoryFormProps {
    currentCategoria: Partial<CategoriaDTO>; // Objeto que representa la categoría actual a editar/crear.
                                            // `Partial` permite que no todos los campos estén presentes (ej., `id` para una nueva categoría).
    /**
     * Función callback que se ejecuta cuando hay un cambio en los campos del formulario.
     * Puede manejar eventos de cambio tanto de <input> como de <select>.
     * @param e Evento de cambio de input o select.
     */
    onCategoriaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    /**
     * Función callback que se ejecuta al enviar el formulario.
     * Es asíncrona, ya que típicamente implicaría una llamada a una API.
     * @param e Evento de envío del formulario.
     */
    onSubmitCategoria: (e: React.FormEvent) => Promise<void>;
    /**
     * Función callback para limpiar el formulario o cancelar la operación actual.
     */
    onClearForm: () => void;
    // La prop `availableCategories` ha sido eliminada ya que no se usa un selector de categoría padre.
    // availableCategories: CategoriaDTO[];
}

/**
 * `CategoryForm` es un componente funcional que renderiza un formulario para la gestión de categorías.
 * Permite al usuario introducir la denominación de una categoría y enviarla para crear o actualizar.
 *
 * @param {CategoryFormProps} props Las propiedades para configurar el formulario.
 * @returns {JSX.Element} Un elemento de formulario React.
 */
export const CategoryForm: React.FC<CategoryFormProps> = ({
    currentCategoria,
    onCategoriaChange,
    onSubmitCategoria,
    onClearForm,
    // `availableCategories` ya no se desestructura porque no se utiliza.
    // availableCategories 
}) => {
    // La lógica de `filteredAvailableCategories` también ha sido eliminada.
    // const filteredAvailableCategories = availableCategories.filter(
    //     cat => cat.id !== currentCategoria.id
    // );

    return (
        <form onSubmit={onSubmitCategoria} className={styles.form}>
            {/* Campo oculto para el ID de la categoría, crucial para distinguir entre creación y actualización */}
            <input type="hidden" name="id" value={currentCategoria.id || ''} />
            
            <div className={styles.formGroup}>
                <label htmlFor="categoriaDenominacion">Denominación:</label>
                <input
                    type="text"
                    id="categoriaDenominacion" // ID único para el input.
                    name="denominacion" // Atributo 'name' para el manejo del formulario.
                    value={currentCategoria.denominacion || ''} // Valor controlado por el estado del componente padre.
                    onChange={onCategoriaChange} // Manejador de cambios.
                    required // Hace que el campo sea obligatorio.
                    className={styles.input} // Clase CSS para estilizar el input.
                />
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.primaryButton}>
                    {/* El texto del botón cambia dependiendo de si se está creando o actualizando. */}
                    {currentCategoria.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                </button>
                <button type="button" className={styles.secondaryButton} onClick={onClearForm}>
                    Cancelar {/* Botón para cancelar la operación y limpiar el formulario. */}
                </button>
            </div>
        </form>
    );
};
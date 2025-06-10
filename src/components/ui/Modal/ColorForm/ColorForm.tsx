

import React from 'react';
import { ColorDTO } from '../../../dto/ColorDTO'; // Importa el Data Transfer Object (DTO) para la estructura de un color.
import styles from './ColorForm.module.css'; // Importa los estilos CSS específicos para este formulario.

/**
 * Define las propiedades (props) que el componente `ColorForm` espera recibir.
 */
interface ColorFormProps {
    currentColor: Partial<ColorDTO>; // Un objeto `ColorDTO` parcial que representa el color actual a editar/crear.
                                    // `Partial` permite que no todos los campos estén presentes (ej., `id` para un color nuevo).
    /**
     * Función callback que se activa cuando hay un cambio en los campos del formulario.
     * @param e El evento de cambio de un elemento HTML input.
     */
    onColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /**
     * Función callback que se activa cuando el formulario es enviado.
     * @param e El evento de envío del formulario.
     */
    onSubmitColor: (e: React.FormEvent) => void;
    /**
     * Función callback para limpiar o resetear el formulario.
     */
    onClearForm: () => void;
}

/**
 * `ColorForm` es un componente funcional de React que renderiza un formulario
 * para la creación o actualización de un color. Incluye campos para el nombre
 * del color y su estado activo.
 *
 * @param {ColorFormProps} props Las propiedades para configurar el formulario.
 * @returns {JSX.Element} Un elemento de formulario React.
 */
export const ColorForm: React.FC<ColorFormProps> = ({
    currentColor,
    onColorChange,
    onSubmitColor,
    onClearForm
}) => {
    return (
        <form onSubmit={onSubmitColor} className={styles.colorForm}>
            {/* Grupo de formulario para el nombre del color */}
            <div className={styles.formGroup}>
                <label htmlFor="nombreColor">Nombre del Color:</label>
                <input
                    type="text"
                    id="nombreColor" // ID único para el input.
                    name="nombreColor" // Atributo `name` para identificar el campo en el evento de cambio.
                    value={currentColor.nombreColor || ''} // Valor controlado por el estado del componente padre. Si es undefined, usa cadena vacía.
                    onChange={onColorChange} // Manejador de cambios.
                    required // Hace que el campo sea obligatorio.
                    className={styles.inputField} // Clase CSS para estilizar el input.
                />
            </div>

            {/* Grupo de formulario para el estado activo del color */}
            <div className={styles.formGroup}>
                <label htmlFor="activo">Activo:</label>
                <input
                    type="checkbox"
                    id="activo" // ID único para el checkbox.
                    name="activo" // Atributo `name` para identificar el campo.
                    checked={currentColor.activo ?? true} // Valor controlado. Si `activo` es `null` o `undefined`, se asume `true` por defecto.
                    onChange={onColorChange} // Manejador de cambios.
                    className={styles.checkboxField} // Clase CSS para estilizar el checkbox.
                />
            </div>

            {/* Sección de acciones del formulario (botones) */}
            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {/* El texto del botón cambia dinámicamente según si se está creando o actualizando un color. */}
                    {currentColor.id ? 'Actualizar Color' : 'Crear Color'}
                </button>
                <button type="button" onClick={onClearForm} className={styles.cancelButton}>
                    Cancelar {/* Botón para cancelar la operación y limpiar el formulario. */}
                </button>
            </div>
        </form>
    );
};
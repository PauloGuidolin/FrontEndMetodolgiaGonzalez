
import React from 'react';
import { TalleDTO } from '../../../dto/TalleDTO'; // Asegúrate de que esta ruta sea correcta para el DTO de Talle
import styles from './TalleForm.module.css'; // Importa los estilos CSS Modules específicos para el formulario de Talle

// Define las propiedades que el componente TalleForm espera recibir
interface TalleFormProps {
    currentTalle: Partial<TalleDTO>; // El objeto Talle actual que se está editando o creando (puede ser parcial)
    onTalleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Función para manejar los cambios en los campos del formulario
    onSubmitTalle: (e: React.FormEvent) => void; // Función para manejar el envío del formulario
    onClearForm: () => void; // Función para limpiar o resetear el formulario
}

// Componente funcional TalleForm
export const TalleForm: React.FC<TalleFormProps> = ({
    currentTalle,
    onTalleChange,
    onSubmitTalle,
    onClearForm
}) => {
    return (
        // Formulario que se envía con onSubmitTalle y aplica los estilos de talleForm
        <form onSubmit={onSubmitTalle} className={styles.talleForm}>
            {/* Grupo de formulario para el nombre del talle */}
            <div className={styles.formGroup}>
                <label htmlFor="nombreTalle">Nombre del Talle:</label>
                <input
                    type="text"
                    id="nombreTalle"
                    name="nombreTalle" // El atributo name debe coincidir con la propiedad en TalleDTO
                    value={currentTalle.nombreTalle || ''} // Muestra el valor actual o un string vacío si es undefined
                    onChange={onTalleChange} // Maneja los cambios en el input
                    required // Hace que el campo sea obligatorio
                    className={styles.inputField} // Aplica estilos para el campo de entrada
                />
            </div>

            {/* Grupo de formulario para el estado activo del talle (checkbox) */}
            <div className={styles.formGroup}>
                <label htmlFor="activo">Activo:</label>
                <input
                    type="checkbox"
                    id="activo"
                    name="activo" // El atributo name debe coincidir con la propiedad en TalleDTO
                    checked={currentTalle.activo ?? true} // Marcado si es true, o por defecto true si es undefined/null
                    onChange={onTalleChange} // Maneja los cambios en el checkbox
                    className={styles.checkboxField} // Aplica estilos para el checkbox
                />
            </div>

            {/* Contenedor para los botones de acción del formulario */}
            <div className={styles.formActions}>
                {/* Botón de envío: cambia el texto según si se está creando o actualizando un talle */}
                <button type="submit" className={styles.submitButton}>
                    {currentTalle.id ? 'Actualizar Talle' : 'Crear Talle'}
                </button>
                {/* Botón de cancelar: limpia el formulario al hacer click */}
                <button type="button" onClick={onClearForm} className={styles.cancelButton}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};
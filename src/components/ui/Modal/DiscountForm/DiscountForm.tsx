
import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import styles from './DiscountForm.module.css'; // Estilos CSS para el formulario.
import { DescuentoDTO } from '../../../dto/DescuentoDTO'; // Data Transfer Object (DTO) para la estructura de un descuento.

/**
 * Define las propiedades (props) que el componente `DiscountForm` espera recibir.
 */
interface DiscountFormProps {
    currentDiscount: Partial<DescuentoDTO>; // Objeto `DescuentoDTO` parcial que representa el descuento actual a editar/crear.
                                            // `Partial` permite que no todos los campos estén presentes (ej., `id` para un descuento nuevo).
    /**
     * Función callback que se activa cuando hay un cambio en cualquier campo del formulario.
     * @param e El evento de cambio de un elemento HTML (input, textarea, select).
     */
    onDiscountChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    /**
     * Función callback que se activa cuando el formulario es enviado. Es asíncrona.
     * @param e El evento de envío del formulario.
     */
    onSubmitDiscount: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    /**
     * Función callback para limpiar o resetear el formulario.
     */
    onClearForm: () => void;
}

/**
 * `DiscountForm` es un componente funcional de React que renderiza un formulario
 * para gestionar descuentos, incluyendo validación de fechas y horas.
 *
 * @param {DiscountFormProps} props Las propiedades para configurar el formulario.
 * @returns {JSX.Element} Un elemento de formulario React.
 */
export const DiscountForm: React.FC<DiscountFormProps> = ({
    currentDiscount,
    onDiscountChange,
    onSubmitDiscount,
    onClearForm,
}) => {
    // Estado para gestionar mensajes de error relacionados con la validación de fecha y hora.
    const [dateTimeError, setDateTimeError] = useState<string>('');
    // Estado para controlar si el formulario es válido y habilitar/deshabilitar el botón de envío.
    const [formIsValid, setFormIsValid] = useState<boolean>(true);

    /**
     * Función de validación combinada para fechas y horas, interpretándolas como `LocalDateTime`.
     * Valida que todos los campos de fecha y hora estén completos y que la fecha/hora de inicio
     * no sea posterior a la fecha/hora de fin.
     * @returns {boolean} `true` si el formulario es válido, `false` en caso contrario.
     */
    const validateForm = () => {
        const { fechaDesde, fechaHasta, horaDesde, horaHasta } = currentDiscount;

        // Comprobación inicial: si falta algún campo de fecha/hora, no se realiza la comparación.
        if (!fechaDesde || !fechaHasta || !horaDesde || !horaHasta) {
            setDateTimeError(''); // Limpiar cualquier error previo.
            setFormIsValid(false); // Deshabilita el botón hasta que se llenen todos los campos requeridos.
            return false;
        }

        try {
            // Combina fecha y hora para crear objetos `Date` completos.
            // Se usa 'T' para formato ISO 8601, lo que ayuda con la interpretación UTC por defecto.
            const dateTimeDesde = new Date(`${fechaDesde}T${horaDesde}`);
            const dateTimeHasta = new Date(`${fechaHasta}T${horaHasta}`);

            // Verifica si los objetos `Date` son válidos (es decir, si las cadenas eran correctas).
            if (isNaN(dateTimeDesde.getTime()) || isNaN(dateTimeHasta.getTime())) {
                setDateTimeError('Formato de fecha u hora inválido. Asegúrate de que estén completas y correctas.');
                setFormIsValid(false);
                return false;
            }

            // Realiza la comparación: la fecha y hora de inicio no pueden ser posteriores a la de fin.
            if (dateTimeDesde.getTime() > dateTimeHasta.getTime()) {
                setDateTimeError('La fecha y hora de inicio no pueden ser posteriores a la fecha y hora de fin.');
                setFormIsValid(false);
                return false;
            } else {
                setDateTimeError(''); // Limpia el error si la validación es exitosa.
                setFormIsValid(true);
                return true;
            }
        } catch (e) {
            console.error("Error al validar fechas/horas:", e);
            setDateTimeError('Error interno en la validación de fecha/hora. Verifica los formatos.');
            setFormIsValid(false);
            return false;
        }
    };

    // `useEffect` para re-validar el formulario cada vez que cambian las fechas u horas.
    useEffect(() => {
        validateForm();
    }, [
        currentDiscount.fechaDesde,
        currentDiscount.fechaHasta,
        currentDiscount.horaDesde,
        currentDiscount.horaHasta,
    ]);

    /**
     * Manejador de envío del formulario que incorpora la lógica de validación.
     * Previene el envío por defecto y llama a la función de envío del padre solo si el formulario es válido.
     * @param e El evento de envío del formulario.
     */
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita el comportamiento de envío por defecto del navegador.

        // Ejecuta la validación final antes de enviar.
        if (validateForm()) { // `validateForm` ya actualiza `formIsValid`.
            await onSubmitDiscount(e); // Llama a la función de envío proporcionada por el componente padre.
        } else {
            alert('Por favor, corrige los errores en el formulario antes de enviar.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3>{currentDiscount.id ? 'Editar Descuento' : 'Crear Nuevo Descuento'}</h3>
            <form onSubmit={handleFormSubmit} className={styles.form}>
                {/* Campo de Denominación */}
                <div className={styles.formGroup}>
                    <label htmlFor="denominacion">Denominación:</label>
                    <input
                        type="text"
                        id="denominacion"
                        name="denominacion"
                        value={currentDiscount.denominacion || ''}
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                {/* Campo de Descripción */}
                <div className={styles.formGroup}>
                    <label htmlFor="descripcionDescuento">Descripción:</label>
                    <textarea
                        id="descripcionDescuento"
                        name="descripcionDescuento"
                        value={currentDiscount.descripcionDescuento || ''}
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                {/* Campo de Precio Promocional */}
                <div className={styles.formGroup}>
                    <label htmlFor="precioPromocional">Precio Promocional:</label>
                    <input
                        type="number"
                        id="precioPromocional"
                        name="precioPromocional"
                        value={currentDiscount.precioPromocional || 0}
                        onChange={onDiscountChange}
                        min="0" // Valor mínimo permitido.
                        step="0.01" // Permite valores decimales.
                        required
                    />
                </div>

                {/* Campo de Fecha Desde */}
                <div className={styles.formGroup}>
                    <label htmlFor="fechaDesde">Fecha Desde:</label>
                    <input
                        type="date"
                        id="fechaDesde"
                        name="fechaDesde"
                        value={currentDiscount.fechaDesde || ''}
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                {/* Campo de Fecha Hasta */}
                <div className={styles.formGroup}>
                    <label htmlFor="fechaHasta">Fecha Hasta:</label>
                    <input
                        type="date"
                        id="fechaHasta"
                        name="fechaHasta"
                        value={currentDiscount.fechaHasta || ''}
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                {/* Campo de Hora Desde */}
                <div className={styles.formGroup}>
                    <label htmlFor="horaDesde">Hora Desde:</label>
                    <input
                        type="time"
                        id="horaDesde"
                        name="horaDesde"
                        value={currentDiscount.horaDesde?.substring(0, 5) || ''} // Muestra solo HH:MM
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                {/* Campo de Hora Hasta */}
                <div className={styles.formGroup}>
                    <label htmlFor="horaHasta">Hora Hasta:</label>
                    <input
                        type="time"
                        id="horaHasta"
                        name="horaHasta"
                        value={currentDiscount.horaHasta?.substring(0, 5) || ''} // Muestra solo HH:MM
                        onChange={onDiscountChange}
                        required
                    />
                    {/* Muestra el mensaje de error de fecha/hora si existe */}
                    {dateTimeError && <p className={styles.errorMessage}>{dateTimeError}</p>}
                </div>

                {/* Campo Activo (Checkbox) */}
                <div className={styles.formGroup}>
                    <label htmlFor="active">Activo:</label>
                    <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={currentDiscount.activo ?? true} // Por defecto, `true` si es `null` o `undefined`.
                        onChange={(e) => onDiscountChange({
                            // Adapta el evento para que el valor del checkbox sea un string ("true" o "false").
                            target: {
                                name: e.target.name,
                                value: String(e.target.checked),
                            } as HTMLInputElement
                        } as ChangeEvent<HTMLInputElement>)}
                    />
                </div>

                {/* Botones de Acción del Formulario */}
                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={!formIsValid}>
                        {/* El texto del botón cambia según si se está creando o actualizando. */}
                        {currentDiscount.id ? 'Actualizar' : 'Crear'} Descuento
                    </button>
                    <button type="button" onClick={onClearForm} className={styles.clearButton}>
                        Limpiar Formulario
                    </button>
                </div>
            </form>
        </div>
    );
};
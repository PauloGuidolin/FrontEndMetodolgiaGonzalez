// src/components/ui/DiscountForm/DiscountForm.tsx

import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import styles from './DiscountForm.module.css';
import { DescuentoDTO } from '../../../dto/DescuentoDTO'; // Asegúrate de que la ruta sea correcta

interface DiscountFormProps {
    currentDiscount: Partial<DescuentoDTO>;
    onDiscountChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmitDiscount: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    onClearForm: () => void;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({
    currentDiscount,
    onDiscountChange,
    onSubmitDiscount,
    onClearForm,
}) => {
    // Estado para los mensajes de error de validación
    const [dateTimeError, setDateTimeError] = useState<string>(''); // Unificamos el error para fecha y hora
    const [formIsValid, setFormIsValid] = useState<boolean>(true);

    // Función de validación combinada (fechas y horas como LocalDateTime)
    const validateForm = () => {
        const fechaDesde = currentDiscount.fechaDesde;
        const fechaHasta = currentDiscount.fechaHasta;
        const horaDesde = currentDiscount.horaDesde;
        const horaHasta = currentDiscount.horaHasta;

        // Comprobación inicial para asegurar que todos los campos requeridos tienen valor
        if (!fechaDesde || !fechaHasta || !horaDesde || !horaHasta) {
            // Si faltan datos, el formulario no es válido para la lógica de comparación
            // pero permitimos que el usuario siga rellenando sin un error de comparación
            setDateTimeError('');
            setFormIsValid(false); // Deshabilita el botón hasta que se llenen todos los requeridos
            return false;
        }

        try {
            // Combinar fecha y hora para crear objetos Date completos (representando LocalDateTime)
            // Usamos 'T' para asegurar que se interprete como ISO 8601 y se maneje bien la zona horaria (UTC por defecto)
            const dateTimeDesde = new Date(`${fechaDesde}T${horaDesde}`);
            const dateTimeHasta = new Date(`${fechaHasta}T${horaHasta}`);

            // Verificar si los objetos Date son válidos (ej. si las cadenas de fecha/hora eran malformadas)
            if (isNaN(dateTimeDesde.getTime()) || isNaN(dateTimeHasta.getTime())) {
                setDateTimeError('Formato de fecha u hora inválido. Asegúrate de que estén completas y correctas.');
                setFormIsValid(false);
                return false;
            }

            // Realizar la comparación: la fecha y hora de inicio no pueden ser posteriores a la de fin
            if (dateTimeDesde.getTime() > dateTimeHasta.getTime()) {
                setDateTimeError('La fecha y hora de inicio no pueden ser posteriores a la fecha y hora de fin.');
                setFormIsValid(false);
                return false;
            } else {
                setDateTimeError(''); // Limpiar el error si es válido
                setFormIsValid(true);
                return true;
            }
        } catch (e) {
            // Capturar errores que puedan surgir al parsear las fechas/horas
            console.error("Error al validar fechas/horas:", e);
            setDateTimeError('Error interno en la validación de fecha/hora. Verifica los formatos.');
            setFormIsValid(false);
            return false;
        }
    };

    // Usar useEffect para re-validar cuando currentDiscount cambie
    useEffect(() => {
        validateForm();
    }, [currentDiscount.fechaDesde, currentDiscount.fechaHasta, currentDiscount.horaDesde, currentDiscount.horaHasta]);


    // Sobrescribir onSubmitDiscount para añadir la validación previa
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Previene el envío por defecto del formulario HTML

        // Ejecuta la validación final antes de enviar
        if (validateForm()) { // La función validateForm ya actualiza formIsValid
            await onSubmitDiscount(e); // Llama a la función de envío del padre si es válido
        } else {
            // Si la validación falla, podrías mostrar un mensaje de alerta adicional
            // o simplemente confiar en los mensajes de error individuales que ya se muestran.
            alert('Por favor, corrige los errores en el formulario antes de enviar.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3>{currentDiscount.id ? 'Editar Descuento' : 'Crear Nuevo Descuento'}</h3>
            <form onSubmit={handleFormSubmit} className={styles.form}>
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

                <div className={styles.formGroup}>
                    <label htmlFor="precioPromocional">Precio Promocional:</label>
                    <input
                        type="number"
                        id="precioPromocional"
                        name="precioPromocional"
                        value={currentDiscount.precioPromocional || 0}
                        onChange={onDiscountChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

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

                <div className={styles.formGroup}>
                    <label htmlFor="horaDesde">Hora Desde:</label>
                    <input
                        type="time"
                        id="horaDesde"
                        name="horaDesde"
                        value={currentDiscount.horaDesde?.substring(0, 5) || ''}
                        onChange={onDiscountChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="horaHasta">Hora Hasta:</label>
                    <input
                        type="time"
                        id="horaHasta"
                        name="horaHasta"
                        value={currentDiscount.horaHasta?.substring(0, 5) || ''}
                        onChange={onDiscountChange}
                        required
                    />
                    {/* Mostrar el mensaje de error unificado para fecha/hora */}
                    {dateTimeError && <p className={styles.errorMessage}>{dateTimeError}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="active">Activo:</label>
                    <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={currentDiscount.activo ?? true} // Usa ?? true para que sea true por defecto si es undefined/null
                        onChange={(e) => onDiscountChange({
                            target: {
                                name: e.target.name,
                                value: String(e.target.checked), // Asegura que el valor enviado sea "true" o "false" como string
                            } as HTMLInputElement
                        } as ChangeEvent<HTMLInputElement>)}
                    />
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={!formIsValid}>
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
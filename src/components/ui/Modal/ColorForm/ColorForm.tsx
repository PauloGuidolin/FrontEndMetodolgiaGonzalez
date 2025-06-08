// src/components/ui/ColorComp/ColorForm/ColorForm.tsx

import React from 'react';
import { ColorDTO } from '../../../dto/ColorDTO'; // Asegúrate de la ruta correcta
import styles from './ColorForm.module.css'; // Crea este archivo CSS

interface ColorFormProps {
    currentColor: Partial<ColorDTO>;
    onColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmitColor: (e: React.FormEvent) => void;
    onClearForm: () => void;
}

export const ColorForm: React.FC<ColorFormProps> = ({
    currentColor,
    onColorChange,
    onSubmitColor,
    onClearForm
}) => {
    return (
        <form onSubmit={onSubmitColor} className={styles.colorForm}>
            <div className={styles.formGroup}>
                <label htmlFor="nombreColor">Nombre del Color:</label>
                <input
                    type="text"
                    id="nombreColor"
                    name="nombreColor"
                    value={currentColor.nombreColor || ''}
                    onChange={onColorChange}
                    required
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="activo">Activo:</label>
                <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={currentColor.activo ?? true} // Default a true si es undefined
                    onChange={onColorChange}
                    className={styles.checkboxField}
                />
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {currentColor.id ? 'Actualizar Color' : 'Crear Color'}
                </button>
                <button type="button" onClick={onClearForm} className={styles.cancelButton}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};
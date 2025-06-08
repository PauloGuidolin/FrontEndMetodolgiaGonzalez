// src/components/ui/TalleComp/TalleForm/TalleForm.tsx

import React from 'react';
import { TalleDTO } from '../../../dto/TalleDTO'; // Asegúrate de la ruta correcta
import styles from './TalleForm.module.css'; // Crea este archivo CSS

interface TalleFormProps {
    currentTalle: Partial<TalleDTO>;
    onTalleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmitTalle: (e: React.FormEvent) => void;
    onClearForm: () => void;
}

export const TalleForm: React.FC<TalleFormProps> = ({
    currentTalle,
    onTalleChange,
    onSubmitTalle,
    onClearForm
}) => {
    return (
        <form onSubmit={onSubmitTalle} className={styles.talleForm}>
            <div className={styles.formGroup}>
                <label htmlFor="nombreTalle">Nombre del Talle:</label>
                <input
                    type="text"
                    id="nombreTalle"
                    name="nombreTalle"
                    value={currentTalle.nombreTalle || ''}
                    onChange={onTalleChange}
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
                    checked={currentTalle.activo ?? true} // Default a true si es undefined
                    onChange={onTalleChange}
                    className={styles.checkboxField}
                />
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {currentTalle.id ? 'Actualizar Talle' : 'Crear Talle'}
                </button>
                <button type="button" onClick={onClearForm} className={styles.cancelButton}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};
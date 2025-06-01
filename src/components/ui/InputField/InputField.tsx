// src/components/ui/InputField/InputField.tsx

import React from 'react';
import styles from './InputField.module.css'; // Asegúrate de crear este archivo CSS module

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string | number; // ¡CAMBIO AQUÍ! Ahora acepta string o number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Permitir pasar clases adicionales
  name?: string; // ¡CAMBIO AQUÍ! Agregamos la prop 'name'
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  className,
  name, // ¡CAMBIO AQUÍ! Desestructuramos la prop 'name'
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name} // ¡CAMBIO AQUÍ! Pasamos la prop 'name' al input HTML
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.inputField} ${className || ''}`} // Combina las clases
        disabled={disabled}
      />
    </div>
  );
};

export default InputField;
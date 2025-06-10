// src/components/ui/InputField/InputField.tsx

import React from 'react';
import styles from './InputField.module.css'; // Asegúrate de crear este archivo CSS module

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string; 
  name?: string; 
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
        name={name}
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
// src/components/ui/InputField/InputField.tsx

import React from 'react';
import styles from './InputField.module.css'; // Asegúrate de crear este archivo CSS module

/**
 * Define las propiedades (props) que el componente InputField puede aceptar.
 */
interface InputFieldProps {
    id: string; // Identificador único para el input y su etiqueta.
    label: string; // Texto de la etiqueta asociada al input.
    type?: string; // Tipo del input (ej. 'text', 'password', 'number', 'email'). Por defecto es 'text'.
    value: string | number; // Valor actual del input. Puede ser string o number.
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Función que se ejecuta cuando el valor del input cambia.
    placeholder?: string; // Texto de sugerencia que se muestra en el input cuando está vacío.
    disabled?: boolean; // Booleano que indica si el input está deshabilitado.
    className?: string; // Clases CSS adicionales para aplicar al input.
    name?: string; // Atributo 'name' para el input, útil para formularios y manejo de estado.
}

/**
 * `InputField` es un componente funcional que renderiza un campo de entrada de texto
 * con una etiqueta asociada.
 *
 * @param {InputFieldProps} props Las propiedades para configurar el campo de entrada.
 * @returns {JSX.Element} Un elemento div que contiene una etiqueta y un input.
 */
const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    type = 'text', // Valor por defecto si 'type' no se proporciona.
    value,
    onChange,
    placeholder,
    disabled,
    className,
    name, // Se desestructura la prop 'name'.
}) => {
    return (
        <div className={styles.formGroup}> {/* Contenedor principal para la etiqueta y el input */}
            <label htmlFor={id}>{label}</label> {/* Etiqueta asociada al input por su 'id' */}
            <input
                type={type} // Tipo de input (text, password, etc.).
                id={id} // ID del input, importante para la accesibilidad con la etiqueta.
                name={name} // Atributo 'name' para el input.
                value={value} // Valor actual controlado por el estado del componente padre.
                onChange={onChange} // Manejador de eventos para actualizar el valor.
                placeholder={placeholder} // Texto de sugerencia.
                // Combina las clases CSS del módulo con cualquier clase adicional proporcionada.
                className={`${styles.inputField} ${className || ''}`}
                disabled={disabled} // Habilita o deshabilita el input.
            />
        </div>
    );
};

export default InputField; // Exporta el componente para su uso en otras partes de la aplicación.
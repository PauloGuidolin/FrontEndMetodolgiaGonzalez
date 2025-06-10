
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './RegisterModal.module.css'; // Estilos CSS Modules para el modal
import { useAuthStore } from '../../../../store/authStore'; // Store de autenticación de Zustand
import { toast } from 'react-toastify'; // Librería para notificaciones toast
import { RegisterRequestFrontend } from '../../../../types/auth'; // Tipos para la solicitud de registro
import { Sexo } from '../../../../types/ISexo'; // Enum para el tipo de sexo

// Interfaz que define las propiedades del componente RegisterModal
interface RegisterModalProps {
    isOpen: boolean; // Controla si el modal está abierto o cerrado
    onClose: () => void; // Función para cerrar el modal
    onLoginClick: () => void; // Función para cambiar al modal de inicio de sesión
    onRegisterSuccess?: () => void; // Función opcional para ejecutar después de un registro exitoso
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onLoginClick, onRegisterSuccess }) => {
    // console.log para depuración, se puede eliminar en producción
    console.log('RegisterModal isOpen prop:', isOpen);

    // Obtener funciones y estados del store de autenticación
    const register = useAuthStore((state) => state.register); // Función para registrar un usuario
    const loading = useAuthStore((state) => state.loadingRegister); // Estado de carga del registro
    const errorRegister = useAuthStore((state) => state.errorRegister); // Mensaje de error del registro

    // Esquema de validación para el formulario de registro utilizando Yup
    const validationSchema = Yup.object<RegisterRequestFrontend>().shape({
        firstname: Yup.string()
            .trim() // Elimina espacios en blanco al inicio y al final
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(50, 'El nombre no debe exceder los 50 caracteres')
            .required('El nombre es requerido'),
        lastname: Yup.string()
            .trim()
            .min(2, 'El apellido debe tener al menos 2 caracteres')
            .max(50, 'El apellido no debe exceder los 50 caracteres')
            .required('El apellido es requerido'),
        sexo: Yup.string()
            .oneOf(Object.values(Sexo), 'Seleccione un sexo válido') // Valida que el sexo sea uno de los valores del enum Sexo
            .required('El sexo es requerido') as Yup.StringSchema<Sexo>, // Asegura el tipo correcto
        email: Yup.string()
            .email('Formato de correo electrónico inválido')
            .required('El correo electrónico es requerido'),
        password: Yup.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
            .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
            .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
            .matches(/[^a-zA-Z0-9]/, 'La contraseña debe contener al menos un carácter especial')
            .required('La contraseña es requerida'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden') // Valida que coincida con el campo 'password'
            .required('Confirme su contraseña'),
        dni: Yup.number()
            .typeError('El DNI debe ser un número')
            .integer('El DNI debe ser un número entero')
            .min(1000000, 'El DNI debe tener al menos 7 dígitos')
            .max(99999999, 'El DNI no debe exceder los 8 dígitos')
            .required('El DNI es requerido'),
    });

    // Inicialización de Formik para manejar el estado del formulario, la validación y el envío
    const formik = useFormik<RegisterRequestFrontend & { confirmPassword: string }>({
        initialValues: {
            firstname: '',
            lastname: '',
            sexo: '' as Sexo, // Inicializa el sexo como un string vacío y luego aserción de tipo
            email: '',
            password: '',
            confirmPassword: '', // Campo adicional para confirmar la contraseña
            dni: 0,
        },
        validationSchema: validationSchema, // Aplica el esquema de validación definido
        onSubmit: async (values) => {
            try {
                // Prepara los datos para la solicitud de registro, excluyendo 'confirmPassword'
                const registerData: RegisterRequestFrontend = {
                    firstname: values.firstname,
                    lastname: values.lastname,
                    sexo: values.sexo,
                    email: values.email,
                    password: values.password,
                    dni: values.dni,
                };
                // Llama a la función de registro del store
                await register(registerData);
                // Muestra un mensaje de éxito
                toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
                onClose(); // Cierra el modal de registro
                // Ejecuta el callback onRegisterSuccess si existe, de lo contrario, vuelve al modal de login
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                } else {
                    onLoginClick();
                }
            } catch (error) {
                // Manejo de errores durante el registro
                const errorMessage = errorRegister || (error as any).response?.data?.message || 'Error al registrar. Inténtalo de nuevo.';
                toast.error(errorMessage); // Muestra un mensaje de error
                console.error("Registration failed:", error); // Log del error en consola
            }
        },
    });

    // El modal no se renderiza si isOpen es falso, optimizando el rendimiento
    if (!isOpen) return null;

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.logoContainer}>
                        {/* Logo de Adidas, se recomienda usar una imagen local o un CDN fiable */}
                        <img
                            src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
                            alt="Logo de Adidas"
                            className={styles.logo}
                        />
                        <h2>Regístrate</h2>
                    </div>
                    {/* Botón para cerrar el modal */}
                    <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={formik.handleSubmit}>
                        {/* Campo de nombre */}
                        <div className={styles.formGroup}>
                            <label htmlFor="firstname">Ingrese su nombre</label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.firstname}
                            />
                            {/* Muestra el mensaje de error si el campo ha sido tocado y hay un error */}
                            {formik.touched.firstname && formik.errors.firstname ? (
                                <div className={styles.errorText}>{formik.errors.firstname}</div>
                            ) : null}
                        </div>
                        {/* Campo de apellido */}
                        <div className={styles.formGroup}>
                            <label htmlFor="lastname">Ingrese su apellido</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.lastname}
                            />
                            {formik.touched.lastname && formik.errors.lastname ? (
                                <div className={styles.errorText}>{formik.errors.lastname}</div>
                            ) : null}
                        </div>
                        {/* Campo de DNI */}
                        <div className={styles.formGroup}>
                            <label htmlFor="dni">Ingrese su DNI</label>
                            <input
                                type="number"
                                id="dni"
                                name="dni"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                // Muestra un string vacío en lugar de '0' si el DNI es 0
                                value={formik.values.dni === 0 ? '' : formik.values.dni}
                            />
                            {formik.touched.dni && formik.errors.dni ? (
                                <div className={styles.errorText}>{formik.errors.dni}</div>
                            ) : null}
                        </div>
                        {/* Selección de sexo (Radio buttons) */}
                        <div className={styles.formGroup}>
                            <label>Seleccione su sexo</label>
                            <div className={styles.radioGroup}>
                                <input
                                    type="radio"
                                    id="registerGenderFemenino"
                                    name="sexo"
                                    value={Sexo.FEMENINO}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    checked={formik.values.sexo === Sexo.FEMENINO}
                                />
                                <label htmlFor="registerGenderFemenino">Femenino</label>
                                <input
                                    type="radio"
                                    id="registerGenderMasculino"
                                    name="sexo"
                                    value={Sexo.MASCULINO}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    checked={formik.values.sexo === Sexo.MASCULINO}
                                />
                                <label htmlFor="registerGenderMasculino">Masculino</label>
                                <input
                                    type="radio"
                                    id="registerGenderOtro"
                                    name="sexo"
                                    value={Sexo.OTRO}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    checked={formik.values.sexo === Sexo.OTRO}
                                />
                                <label htmlFor="registerGenderOtro">Otro</label>
                            </div>
                            {formik.touched.sexo && formik.errors.sexo ? (
                                <div className={styles.errorText}>{formik.errors.sexo}</div>
                            ) : null}
                        </div>
                        {/* Campo de correo electrónico */}
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Ingrese correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email ? (
                                <div className={styles.errorText}>{formik.errors.email}</div>
                            ) : null}
                        </div>
                        {/* Campo de contraseña */}
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Ingrese Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password ? (
                                <div className={styles.errorText}>{formik.errors.password}</div>
                            ) : null}
                        </div>
                        {/* Campo de confirmación de contraseña */}
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Ingrese nuevamente la contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                                <div className={styles.errorText}>{formik.errors.confirmPassword}</div>
                            ) : null}
                        </div>
                        {/* Botón de registro */}
                        <button type="submit" className={styles.registerButton} disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                        {/* Enlace para ir al modal de inicio de sesión */}
                        <button type="button" className={styles.loginLink} onClick={onLoginClick}>
                            Ya tengo una cuenta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
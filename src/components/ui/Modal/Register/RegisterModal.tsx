import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './RegisterModal.module.css'; // Asegúrate que la ruta sea correcta
import { useAuthStore } from '../../../../store/authStore'; // Asegúrate que la ruta sea correcta
import { toast } from 'react-toastify';
import { RegisterRequestFrontend } from '../../../../types/auth'; // Asegúrate que la ruta sea correcta
import { Sexo } from '../../../../types/ISexo'; // Asegúrate que la ruta sea correcta


interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancelClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onCancelClick }) => {
    // console.log para depuración: ahora mostrará el estado correcto para este modal
    console.log('RegisterModal isOpen prop:', isOpen); 

    const register = useAuthStore((state) => state.register);
    const loading = useAuthStore((state) => state.loadingRegister);
    const errorRegister = useAuthStore((state) => state.errorRegister);

    const validationSchema = Yup.object<RegisterRequestFrontend>().shape({
        firstname: Yup.string()
            .trim()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(50, 'El nombre no debe exceder los 50 caracteres')
            .required('El nombre es requerido'),
        lastname: Yup.string()
            .trim()
            .min(2, 'El apellido debe tener al menos 2 caracteres')
            .max(50, 'El apellido no debe exceder los 50 caracteres')
            .required('El apellido es requerido'),
        sexo: Yup.string()
            .oneOf(Object.values(Sexo), 'Seleccione un sexo válido')
            .required('El sexo es requerido') as Yup.StringSchema<Sexo>,
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
            .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
            .required('Confirme su contraseña'),
        dni: Yup.number()
            .typeError('El DNI debe ser un número')
            .integer('El DNI debe ser un número entero')
            .min(1000000, 'El DNI debe tener al menos 7 dígitos')
            .max(99999999, 'El DNI no debe exceder los 8 dígitos')
            .required('El DNI es requerido'),
    });

    const formik = useFormik<RegisterRequestFrontend & { confirmPassword: string }>({
        initialValues: {
            firstname: '',
            lastname: '',
            sexo: '' as Sexo, 
            email: '',
            password: '',
            confirmPassword: '',
            dni: 0,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const registerData: RegisterRequestFrontend = {
                    firstname: values.firstname,
                    lastname: values.lastname,
                    sexo: values.sexo,
                    email: values.email,
                    password: values.password,
                    dni: values.dni,
                };
                await register(registerData); 
                toast.success('¡Registro exitoso! Por favor, inicie sesión.');
                onClose(); 
            } catch (error) {
                toast.error(errorRegister || 'Error al registrar. Inténtalo de nuevo.');
                console.error("Registration failed:", error);
            }
        },
    });

    // IMPORTANTE: NO uses un "return null;" aquí. La visibilidad se controla con CSS.
    /*
    if (!isOpen) {
        return null;
    }
    */

    return (
        // *** CAMBIO CLAVE AQUÍ: AÑADE LA CLASE 'active' CONDICIONALMENTE ***
        <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.logoContainer}>
                        <img
                            src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
                            alt="Logo de Adidas"
                            className={styles.logo}
                        />
                        <h2>Regístrate</h2>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={formik.handleSubmit}>
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
                            {formik.touched.firstname && formik.errors.firstname ? (
                                <div className={styles.errorText}>{formik.errors.firstname}</div>
                            ) : null}
                        </div>
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
                        <div className={styles.formGroup}>
                            <label htmlFor="dni">Ingrese su DNI</label>
                            <input
                                type="number"
                                id="dni"
                                name="dni"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.dni === 0 ? '' : formik.values.dni}
                            />
                            {formik.touched.dni && formik.errors.dni ? (
                                <div className={styles.errorText}>{formik.errors.dni}</div>
                            ) : null}
                        </div>
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
                        <button type="submit" className={styles.registerButton} disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={onCancelClick}>
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './LoginModal.module.css'; // Asegúrate que la ruta sea correcta
import { useAuthStore } from '../../../../store/authStore'; // Asegúrate que la ruta sea correcta
import { toast } from 'react-toastify';
import { LoginRequestFrontend } from '../../../../types/auth'; // Asegúrate que la ruta sea correcta


interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onRegisterClick }) => {
    // console.log para depuración: ahora mostrará el estado correcto para este modal
    console.log('LoginModal isOpen prop:', isOpen); 

    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loadingLogin);

    const validationSchema = Yup.object<LoginRequestFrontend>().shape({
        email: Yup.string()
            .email('Formato de correo electrónico inválido')
            .required('El correo electrónico es requerido'),
        password: Yup.string()
            .required('La contraseña es requerida'),
    });

    const formik = useFormik<LoginRequestFrontend>({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                await login(values);
                toast.success('¡Inicio de sesión exitoso!');
                onClose(); // Cierra el modal al iniciar sesión
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
                toast.error(errorMessage);
                console.error("Login failed:", error);
            }
        },
    });

    // IMPORTANTE: NO uses un "return null;" aquí. La visibilidad se controla con CSS.
    // Aunque si el modal no se ve, la causa podría ser el CSS.
    // Si decides usar el return null para no renderizar el modal en el DOM:
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
                        <h2>Únete al adiClub</h2>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <form onSubmit={formik.handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Ingresa tu correo electrónico</label>
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
                            <label htmlFor="password">Ingresa tu contraseña</label>
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
                        <button type="submit" className={styles.loginButton} disabled={loading}>
                            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                        </button>
                        <button type="button" className={styles.registerLink} onClick={onRegisterClick}>
                            Registrarse
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
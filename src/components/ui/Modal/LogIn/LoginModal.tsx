import React from "react";
import { useFormik } from "formik"; // Hook para manejar formularios en React.
import * as Yup from "yup"; // Librería para la validación de esquemas.
import styles from "./LoginModal.module.css"; // Importa los estilos CSS para el modal.
import { useAuthStore } from "../../../../store/authStore"; // Importa el hook del store de autenticación (Zustand, etc.).
import { toast } from "react-toastify"; // Para mostrar notificaciones toast.
import { LoginRequestFrontend } from "../../../../types/auth"; // Define la estructura del payload de inicio de sesión.

/**
 * Define las propiedades (props) que el componente `LoginModal` espera recibir.
 */
interface LoginModalProps {
  isOpen: boolean; // Indica si el modal debe estar visible (true) u oculto (false).
  onClose: () => void; // Función callback para cerrar el modal.
  onRegisterClick: () => void; // Función callback para cuando el usuario hace clic en "Registrarse".
  onLoginSuccess?: () => void; // Función callback opcional que se ejecuta al iniciar sesión exitosamente.
}

/**
 * `LoginModal` es un componente funcional de React que presenta un formulario
 * de inicio de sesión dentro de un modal.
 *
 * @param {LoginModalProps} { isOpen, onClose, onRegisterClick, onLoginSuccess } Las propiedades del componente.
 * @returns {JSX.Element} Un elemento de modal de inicio de sesión.
 */
const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
  onLoginSuccess,
}) => {
  console.log("LoginModal isOpen prop:", isOpen); // Para depuración: registra el estado `isOpen`.

  // Obtiene la función `login` y el estado `loadingLogin` del store de autenticación.
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loadingLogin);

  /**
   * Esquema de validación `Yup` para los campos del formulario de inicio de sesión.
   * - `email`: Debe ser un correo electrónico válido y es requerido.
   * - `password`: Es requerido.
   */
  const validationSchema = Yup.object<LoginRequestFrontend>().shape({
    email: Yup.string()
      .email("Formato de correo electrónico inválido") // Mensaje de error si el formato no es válido.
      .required("El correo electrónico es requerido"), // Mensaje de error si está vacío.
    password: Yup.string().required("La contraseña es requerida"), // Mensaje de error si está vacío.
  });

  /**
   * Hook `useFormik` para manejar el estado del formulario, la validación y el envío.
   */
  const formik = useFormik<LoginRequestFrontend>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema, // Aplica el esquema de validación definido.
    /**
     * Función que se ejecuta al enviar el formulario (si la validación es exitosa).
     * Intenta iniciar sesión y maneja el éxito o el fracaso.
     * @param {LoginRequestFrontend} values Los valores del formulario (email y password).
     */
    onSubmit: async (values) => {
      try {
        await login(values); // Llama a la función de login del store.
        toast.success("¡Inicio de sesión exitoso!"); // Muestra una notificación de éxito.
        onClose(); // Cierra el modal de login.
        if (onLoginSuccess) {
          onLoginSuccess(); // Ejecuta el callback `onLoginSuccess` si está definido.
        }
      } catch (error: any) {
        // Manejo de errores: extrae el mensaje de error de la respuesta o usa uno genérico.
        const errorMessage =
          error.response?.data?.message ||
          "Error al iniciar sesión. Verifica tus credenciales.";
        toast.error(errorMessage); // Muestra una notificación de error.
        console.error("Login failed:", error); // Registra el error en la consola para depuración.
      }
    },
  });

  return (
    // El overlay del modal se activa/desactiva con la clase `styles.active` basada en `isOpen`.
    <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}>
      <div className={styles.modalContent}>
        {/* Cabecera del modal con logo y botón de cierre */}
        <div className={styles.modalHeader}>
          <div className={styles.logoContainer}>
            <img
              src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
              alt="Logo de Adidas"
              className={styles.logo}
            />
            <h2>Únete al adiClub</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose} // Cierra el modal al hacer clic.
          >
            &times; {/* Símbolo de "X" para cerrar */}
          </button>
        </div>
        {/* Cuerpo del modal con el formulario de inicio de sesión */}
        <div className={styles.modalBody}>
          <form onSubmit={formik.handleSubmit}> {/* Asocia el envío del formulario con `formik.handleSubmit` */}
            {/* Campo de correo electrónico */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Ingresa tu correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={formik.handleChange} // Actualiza el estado de Formik al cambiar el valor.
                onBlur={formik.handleBlur} // Activa la validación cuando el campo pierde el foco.
                value={formik.values.email} // Controla el valor del input con el estado de Formik.
              />
              {/* Muestra errores de validación para el email */}
              {formik.touched.email && formik.errors.email ? (
                <div className={styles.errorText}>{formik.errors.email}</div>
              ) : null}
            </div>
            {/* Campo de contraseña */}
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
              {/* Muestra errores de validación para la contraseña */}
              {formik.touched.password && formik.errors.password ? (
                <div className={styles.errorText}>{formik.errors.password}</div>
              ) : null}
            </div>
            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading} // Deshabilita el botón mientras se está cargando.
            >
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"} {/* Texto dinámico según el estado de carga. */}
            </button>
            {/* Enlace/botón para ir al registro */}
            <button
              type="button"
              className={styles.registerLink}
              onClick={onRegisterClick} // Llama al callback para ir a la pantalla de registro.
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
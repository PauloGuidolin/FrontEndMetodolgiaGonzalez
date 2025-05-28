import styles from "./Footer.module.css";
import {
  FaXTwitter,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa6";

export const Footer = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Contenedor para las columnas de contenido principal */}
        <div className={styles.columnsContainer}>
          {/* Columna: Categoría */}
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>Categoria</h3>
            <ul>
              <li>Categoria 1</li>
              <li>Categoria 2</li>
              <li>Categoria 1</li> {/* Manteniendo "Categoria 1" como en tu imagen */}
              <li>Categoria 4</li>
            </ul>
          </div>
          {/* Columna: Información de la empresa */}
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>Informacion de la empresa</h3>
            <ul>
              <li>Acerca de Adidas</li>
              <li>Información corporativa</li>
            </ul>
          </div>
          {/* Columna: Nuestro mundo */}
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>Nuestro mundo</h3>
            <ul>
              <li>Impacto</li>
              <li>Personas</li>
              <li>Planeta</li>
            </ul>
          </div>
        </div>

        {/* Contenedor para los iconos sociales */}
        <div className={styles.containerSocial}>
          <div className={styles.icon}>
            <a
              href="https://twitter.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.facebook.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.youtube.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.instagram.com/adidas/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
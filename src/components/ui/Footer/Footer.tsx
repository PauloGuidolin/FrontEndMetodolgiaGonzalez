import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";
import {
  FaXTwitter, // Icono de Twitter (ahora X)
  FaFacebookF, // Icono de Facebook
  FaYoutube, // Icono de YouTube
  FaInstagram, // Icono de Instagram
} from "react-icons/fa6"; // Librería de íconos para React.

/**
 * `Footer` es un componente funcional que representa el pie de página
 * de la aplicación, incluyendo navegación por categorías y enlaces a redes sociales.
 */
export const Footer = () => {
  // Hook de React Router para la navegación programática.
  const navigate = useNavigate();

  /**
   * Función para manejar la navegación a la página de productos con filtros aplicados.
   * Construye una cadena de consulta URL basada en los filtros proporcionados.
   * @param filters Objeto que contiene las categorías, colores y denominación para filtrar.
   */
  const handleFilterNavigation = (filters: {
    categorias?: string[];
    colores?: string[];
    denominacion?: string;
  }) => {
    const params = new URLSearchParams(); // Objeto para construir parámetros de consulta URL.

    let combinedCategories: string[] = [];

    // Agrega categorías si existen y no están ya presentes.
    if (filters.categorias && filters.categorias.length > 0) {
      filters.categorias.forEach((cat) => {
        if (!combinedCategories.includes(cat)) {
          combinedCategories.push(cat);
        }
      });
    }

    // Agrega cada categoría al objeto URLSearchParams.
    combinedCategories.forEach((cat) => {
      params.append("categorias", cat);
    });

    // Agrega colores si existen.
    if (filters.colores && filters.colores.length > 0) {
      filters.colores.forEach((color) => {
        params.append("colores", color);
      });
    }

    // Agrega la denominación si existe.
    if (filters.denominacion) {
      params.append("denominacion", filters.denominacion);
    }

    // Convierte los parámetros a una cadena de consulta.
    const queryString = params.toString();
    // Construye la ruta de destino, añadiendo la cadena de consulta si existe.
    const targetPath = `/productos${queryString ? `?${queryString}` : ""}`;

    console.log("Navegando a:", targetPath);
    // Navega a la ruta construida.
    navigate(targetPath);
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        {/* Contenedor para las columnas de contenido principal */}
        <div className={styles.columnsContainer}>
          {/* Columna: Categoría */}
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>Categoría</h3>
            <ul>
              {/* Enlaces de categorías que aplican filtros al navegar */}
              <li
                onClick={() =>
                  handleFilterNavigation({ categorias: ["Calzados"] })
                }
                className={styles.filterLink}
              >
                Calzados
              </li>
              <li
                onClick={() =>
                  handleFilterNavigation({ categorias: ["Indumentaria"] })
                }
                className={styles.filterLink}
              >
                Indumentaria
              </li>
              <li
                onClick={() =>
                  handleFilterNavigation({ categorias: ["Equipos"] })
                }
                className={styles.filterLink}
              >
                Equipos
              </li>
            </ul>
          </div>
          {/* Columna: Información de la empresa */}
          <div className={styles.column}>
            <h3 className={styles.columnHeader}>Información de la empresa</h3>
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
              rel="noopener noreferrer" // Mejora de seguridad para enlaces externos.
              aria-label="Visitar perfil de Adidas en X (anteriormente Twitter)" // Accesibilidad.
            >
              <FaXTwitter />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.facebook.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar perfil de Adidas en Facebook"
            >
              <FaFacebookF />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.youtube.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar canal de Adidas en YouTube"
            >
              <FaYoutube />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.instagram.com/adidas/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar perfil de Adidas en Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};



import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa el hook `useNavigate` para la navegación programática.
import styles from "./DropDownSport.module.css"; // Importa los estilos CSS específicos para este componente.

/**
 * `DropDownSport` es un componente funcional de React que presenta un menú desplegable
 * con opciones para filtrar productos por diferentes deportes.
 * Navega a la página de productos aplicando los filtros seleccionados en la URL.
 *
 * @returns {JSX.Element} Un elemento de menú desplegable con enlaces de filtro.
 */
export const DropDownSport = () => {
  const navigate = useNavigate(); // Inicializa el hook `useNavigate` para obtener la función de navegación.

  /**
   * Función genérica para manejar la navegación con filtros.
   * Construye una cadena de consulta URL basada en las categorías y denominaciones proporcionadas
   * y luego navega a la página `/productos` con esos parámetros.
   *
   * @param filters Un objeto que puede contener un array de `categorias` y/o una `denominacion` (string).
   */
  const handleFilterNavigation = (filters: { categorias?: string[], denominacion?: string }) => {
    const params = new URLSearchParams(); // Crea un nuevo objeto `URLSearchParams` para manejar los parámetros de la URL.

    // Aquí, `combinedCategories` se inicializa vacío porque las categorías principales
    // (Fútbol, Tenis, Running) se añadirán directamente desde `filters.categorias`.
    let combinedCategories: string[] = [];

    // Si se proporcionan categorías en los filtros, se añaden a la lista,
    // asegurándose de no incluir duplicados.
    if (filters.categorias && filters.categorias.length > 0) {
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) { // Evita agregar categorías repetidas.
          combinedCategories.push(cat);
        }
      });
    }

    // Añade cada categoría combinada como un parámetro 'categorias' en la URL.
    // Esto es fundamental si el backend espera múltiples parámetros con el mismo nombre.
    combinedCategories.forEach(cat => {
      params.append('categorias', cat);
    });

    // Si existe una `denominacion` en los filtros, se añade como parámetro a la URL.
    if (filters.denominacion) {
      params.append('denominacion', filters.denominacion);
    }

    // Construye la cadena de consulta final. Si hay parámetros, se precede con '?'.
    const queryString = params.toString();
    const targetPath = `/productos${queryString ? `?${queryString}` : ''}`;

    console.log("Navegando a:", targetPath); // Para depuración: muestra la URL a la que se navegará.
    navigate(targetPath); // Realiza la navegación a la URL construida.
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        <div></div> {/* Div vacío, posiblemente para espaciado o diseño */}
        <div className={styles.containerInfo}>
          <div className={styles.containerTable}>
            {/* Columna para filtros de Fútbol */}
            <div className={styles.containerColumn1}>
              <h2>Fútbol</h2>
              {/* Navega a productos con categorías "Fútbol" y "Botines" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol", "Botines"] })} className={styles.filterLink}>Botines</p>
              {/* Navega a productos con categoría "Fútbol" (para Selección Argentina) */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol"] })} className={styles.filterLink}>Selección Argentina</p>
              {/* Navega a productos con categorías "Fútbol" e "Indumentaria" (para Camisetas de Fútbol) */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol", "Indumentaria"] })} className={styles.filterLink}>Camisetas de Fútbol</p>
            </div>
            {/* Columna para filtros de Tenis */}
            <div className={styles.containerColumn2}>
              <h2>Tenis</h2>
              {/* Navega a productos con categorías "Tenis" y "Calzados" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              {/* Navega a productos con categorías "Tenis" e "Indumentaria" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
            </div>
            {/* Columna para filtros de Running */}
            <div className={styles.containerColumn3}>
              <h2>Running</h2>
              {/* Navega a productos con categorías "Running" y "Calzados" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              {/* Navega a productos con categorías "Running" e "Indumentaria" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
              {/* Navega a productos con categoría "Running" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Carreras</p>
            </div>
          </div>
          {/* Imagen decorativa dentro del dropdown */}
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="Imagen decorativa de deportes" />
        </div>
        <div></div> {/* Div vacío, posiblemente para espaciado o diseño */}
      </div>
    </>
  );
};


import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa el hook `useNavigate` para la navegación programática.
import styles from "./DropDownShoes.module.css"; // Importa los estilos CSS específicos para este componente.

/**
 * `DropDownShoes` es un componente funcional de React que renderiza un menú desplegable
 * para filtrar calzado deportivo. Permite a los usuarios seleccionar categorías y colores,
 * navegando a la página de productos con los filtros aplicados.
 *
 * @returns {JSX.Element} Un elemento de menú desplegable con enlaces de filtro.
 */
export const DropDownShoes = () => {
  const navigate = useNavigate(); // Inicializa el hook `useNavigate` para obtener la función de navegación.

  /**
   * Función genérica para manejar la navegación con filtros.
   * Construye una cadena de consulta URL basada en las categorías, colores y denominaciones proporcionadas
   * y luego navega a la página `/productos` con esos parámetros.
   *
   * @param filters Un objeto que puede contener un array de `categorias`, un array de `colores`,
   * y/o una `denominacion` (string).
   */
  const handleFilterNavigation = (filters: { categorias?: string[], colores?: string[], denominacion?: string }) => {
    const params = new URLSearchParams(); // Crea un nuevo objeto `URLSearchParams` para manejar los parámetros de la URL.

    // Asegura que "Calzados" siempre esté incluida como categoría base para este dropdown.
    let combinedCategories = ["Calzados"]; 

    // Si se proporcionan categorías adicionales en los filtros, se añaden a la lista,
    // evitando duplicados.
    if (filters.categorias && filters.categorias.length > 0) {
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) {
          combinedCategories.push(cat);
        }
      });
    }

    // Añade cada categoría combinada como un parámetro 'categorias' en la URL.
    // Esto es crucial si el backend espera múltiples parámetros con el mismo nombre.
    combinedCategories.forEach(cat => {
      params.append('categorias', cat);
    });

    // Manejo de **múltiples colores**:
    // Si se proporcionan colores, se añaden individualmente como parámetros 'colores' a la URL.
    // Esto es importante para permitir la selección de varios colores si el backend lo soporta.
    if (filters.colores && filters.colores.length > 0) {
      filters.colores.forEach(color => {
        params.append('colores', color); // Cada color se añade con `params.append('colores', valor)`.
      });
    }

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
            {/* Sección "Infaltable" */}
            <div className={styles.containerColumn1}>
              <h2>Infaltable</h2>
              {/* Navega a productos de Calzados con la subcategoría "Running" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Running</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol"] })} className={styles.filterLink}>Fútbol</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Urbano"] })} className={styles.filterLink}>Urbano</p>
            </div>
            {/* Sección "Tendencias" */}
            <div className={styles.containerColumn2}>
              <h2>Tendencias</h2>
              {/* Filtra por color "BLANCO" (la categoría "Calzados" se añade automáticamente) */}
              <p
                onClick={() => handleFilterNavigation({ colores: ["BLANCO"] })}
                className={styles.filterLink}
              >
                Zapatillas blancas
              </p>
              {/* Filtra por color "NEGRO" (la categoría "Calzados" se añade automáticamente) */}
              <p
                onClick={() => handleFilterNavigation({ colores: ["NEGRO"] })}
                className={styles.filterLink}
              >
                Zapatillas negras
              </p>
            </div>
            {/* Sección "Deportivo" */}
            <div className={styles.containerColumn3}>
              <h2>Deportivo</h2>
              {/* Navega a productos de Calzados con subcategorías específicas */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol"] })} className={styles.filterLink}>Fútbol</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis"] })} className={styles.filterLink}>Tenis</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["GYM"] })} className={styles.filterLink}>GYM</p>
            </div>
          </div>
          {/* Imagen decorativa dentro del dropdown */}
          <img style={{ height: "70px" }} src="../../../images/imageDrop.png" alt="Imagen decorativa de calzado deportivo" />
        </div>
        <div></div> {/* Div vacío, posiblemente para espaciado o diseño */}
      </div>
    </>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa el hook `useNavigate` para la navegación programática.
import styles from "./DropDownClothes.module.css"; // Importa los estilos CSS específicos para este componente.

/**
 * `DropDownClothes` es un componente funcional de React que presenta un menú desplegable
 * con opciones para filtrar indumentaria deportiva. Cuando el usuario selecciona una opción,
 * navega a la página de productos con los filtros correspondientes aplicados en la URL.
 *
 * @returns {JSX.Element} Un elemento de menú desplegable con enlaces de filtro.
 */
export const DropDownClothes = () => {
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

    // La categoría base para este dropdown es siempre "Indumentaria".
    let combinedCategories = ["Indumentaria"]; 

    // Si se proporcionan categorías adicionales en los filtros, se añaden a la lista,
    // evitando duplicados si "Indumentaria" ya estuviera presente o si se repite una categoría.
    if (filters.categorias && filters.categorias.length > 0) {
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) {
          combinedCategories.push(cat);
        }
      });
    }

    // Añade cada categoría combinada como un parámetro 'categorias' en la URL.
    // Esto resultará en algo como `?categorias=Indumentaria&categorias=Fútbol`.
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
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol", "Botines"] })} className={styles.filterLink}>Botines</p>
              {/* Navega a productos de Indumentaria > Fútbol > Selección Argentina */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol", "Seleccion Argentina"] })} className={styles.filterLink}>Selección Argentina</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol", "Remera"] })} className={styles.filterLink}>Camisetas de Fútbol</p>
            </div>
            {/* Columna para filtros de Tenis */}
            <div className={styles.containerColumn2}>
              <h2>Ténis</h2>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
            </div>
            {/* Columna para filtros de Running */}
            <div className={styles.containerColumn3}>
              <h2>Running</h2>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Running</p>
            </div>
          </div>
          {/* Imagen decorativa dentro del dropdown */}
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="Imagen decorativa de ropa deportiva" />
        </div>
        <div></div> {/* Div vacío, posiblemente para espaciado o diseño */}
      </div>
    </>
  );
};
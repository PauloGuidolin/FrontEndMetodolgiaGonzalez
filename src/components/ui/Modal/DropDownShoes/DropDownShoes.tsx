// Archivo: src/ui/DropDownShoes/DropDownShoes.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./DropDownShoes.module.css";


export const DropDownShoes = () => {
  const navigate = useNavigate();

  // Función genérica para manejar la navegación con filtros
  const handleFilterNavigation = (filters: { categorias?: string[], colores?: string[], denominacion?: string }) => {
    const params = new URLSearchParams();

    // Aseguramos que "Calzados" siempre esté incluida como categoría base.
    let combinedCategories = ["Calzados"]; 

    if (filters.categorias && filters.categorias.length > 0) {
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) {
          combinedCategories.push(cat);
        }
      });
    }

    // Añade las categorías combinadas. ¡Importante usar params.append() para cada categoría si el backend espera eso!
    // Asumiendo que el backend espera múltiples 'categorias=X' como lo hace ProductScreen
    combinedCategories.forEach(cat => {
      params.append('categorias', cat);
    });

    // *** CAMBIO CLAVE AQUÍ: Usa 'colores' en lugar de 'color' y .append() para cada elemento ***
    if (filters.colores && filters.colores.length > 0) {
      filters.colores.forEach(color => {
        params.append('colores', color); // <--- CAMBIO: 'colores' y append individual
      });
    }

    // Añade denominación si existe
    if (filters.denominacion) {
      params.append('denominacion', filters.denominacion);
    }

    // Construye la URL final
    const queryString = params.toString();
    const targetPath = `/productos${queryString ? `?${queryString}` : ''}`;

    console.log("Navegando a:", targetPath);
    navigate(targetPath);
  };

  return (
    <>
      <div className={styles.containerPrincipal}>
        <div></div>
        <div className={styles.containerInfo}>
          <div className={styles.containerTable}>
            {/* Infaltable */}
            <div className={styles.containerColumn1}>
              <h2>Infaltable</h2>
              {/* Ahora, solo pasamos el filtro adicional, "Zapatillas" se añade automáticamente */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Running</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol"] })} className={styles.filterLink}>Fútbol</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Urbano"] })} className={styles.filterLink}>Urbano</p>
            </div>
            {/* Tendencias */}
            <div className={styles.containerColumn2}>
              <h2>Tendencias</h2>
              {/* Aquí aplicamos filtro por Color: "Blanco" (Categoría "Zapatillas" se añade automáticamente) */}
              <p
                onClick={() => handleFilterNavigation({ colores: ["BLANCO"] })}
                className={styles.filterLink}
              >
                Zapatillas blancas
              </p>
              {/* Aquí aplicamos filtro por Color: "Negro" (Categoría "Zapatillas" se añade automáticamente) */}
              <p
                onClick={() => handleFilterNavigation({ colores: ["NEGRO"] })}
                className={styles.filterLink}
              >
                Zapatillas negras
              </p>
            </div>
            {/* Deportivo */}
            <div className={styles.containerColumn3}>
              <h2>Deportivo</h2>
              {/* Aquí aplicamos filtro adicional, "Zapatillas" se añade automáticamente */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol"] })} className={styles.filterLink}>Fútbol</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis"] })} className={styles.filterLink}>Tenis</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["GYM"] })} className={styles.filterLink}>GYM</p>
            </div>
          </div>
          <img style={{ height: "70px" }} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};
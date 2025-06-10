// Archivo: src/ui/DropDownClothes/DropDownClothes.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importar useNavigate
import styles from "./DropDownClothes.module.css";

export const DropDownClothes = () => {
  const navigate = useNavigate(); // <-- Inicializar useNavigate

  // Función genérica para manejar la navegación con filtros
  // Define los tipos de filtros que puede recibir
  const handleFilterNavigation = (filters: { categorias?: string[], denominacion?: string }) => {
    const params = new URLSearchParams();

    // La categoría base para este dropdown es "Indumentaria"
    let combinedCategories = ["Indumentaria"]; 

    if (filters.categorias && filters.categorias.length > 0) {
      // Agregamos las categorías específicas, evitando duplicados si "Indumentaria" ya se pasó
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) {
          combinedCategories.push(cat);
        }
      });
    }

    // Añade las categorías combinadas. Usa params.append() para cada categoría.
    combinedCategories.forEach(cat => {
      params.append('categorias', cat);
    });

    // Añade denominación si existe (para filtros como "Botines", "Camisetas de Fútbol")
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
            <div className={styles.containerColumn1}>
              <h2>Fútbol</h2>
              {/* En fútbol, la categoría principal es 'Indumentaria', y 'Fútbol' es una subcategoría */}
              {/* Para "Botines", podemos usar una denominación o si es una categoría, añadirla */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol", "Botines"] })} className={styles.filterLink}>Botines</p>
              {/* "Selección Argentina" puede ser una denominación o una categoría más específica */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol"] })} className={styles.filterLink}>Selección Argentina</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Fútbol", "Remera"] })} className={styles.filterLink}>Camisetas de Fútbol</p>
            </div>
            <div className={styles.containerColumn2}>
              <h2>Ténis</h2>
              {/* Aquí "Calzado" no se refiere a la categoría 'Calzados', sino a ropa de calzado específica de tenis */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
            </div>
            <div className={styles.containerColumn3}>
              <h2>Running</h2>
              {/* Similar a Tenis, "Calzado" y "Ropa" aquí son subcategorías de Running dentro de Indumentaria */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Running</p>
            </div>
          </div>
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};
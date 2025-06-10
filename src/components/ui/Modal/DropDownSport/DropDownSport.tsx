// Archivo: src/ui/DropDownSport/DropDownSport.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importar useNavigate
import styles from "./DropDownSport.module.css";

export const DropDownSport = () => {
  const navigate = useNavigate(); // <-- Inicializar useNavigate

  // Función genérica para manejar la navegación con filtros
  // Define los tipos de filtros que puede recibir
  const handleFilterNavigation = (filters: { categorias?: string[], denominacion?: string }) => {
    const params = new URLSearchParams();

    // Aquí NO establecemos una categoría base si "Fútbol", "Tenis", "Running"
    // son las categorías principales. Si hay una categoría general "Deporte", la pondríamos aquí:
    // let combinedCategories = ["Deporte"]; 
    let combinedCategories: string[] = []; // Inicia vacío, las categorías principales se añadirán desde filters.categorias

    if (filters.categorias && filters.categorias.length > 0) {
      // Agregamos las categorías específicas.
      filters.categorias.forEach(cat => {
        if (!combinedCategories.includes(cat)) { // Evitar duplicados
          combinedCategories.push(cat);
        }
      });
    }

    // Añade las categorías combinadas. Usa params.append() para cada categoría.
    combinedCategories.forEach(cat => {
      params.append('categorias', cat);
    });

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
            <div className={styles.containerColumn1}>
              <h2>Fútbol</h2>
              {/* Clics para Fútbol: La categoría principal será "Fútbol" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol", "Botines"] })} className={styles.filterLink}>Botines</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol"] })} className={styles.filterLink}>Selección Argentina</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Futbol", "Indumentaria"] })} className={styles.filterLink}>Camisetas de Fútbol</p>
            </div>
            <div className={styles.containerColumn2}>
              <h2>Tenis</h2>
              {/* Clics para Tenis: La categoría principal será "Tenis" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Tenis", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
            </div>
            <div className={styles.containerColumn3}>
              <h2>Running</h2>
              {/* Clics para Running: La categoría principal será "Running" */}
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Calzados"] })} className={styles.filterLink}>Calzado</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running", "Indumentaria"] })} className={styles.filterLink}>Ropa</p>
              <p onClick={() => handleFilterNavigation({ categorias: ["Running"] })} className={styles.filterLink}>Carreras</p>
            </div>
          </div>
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};
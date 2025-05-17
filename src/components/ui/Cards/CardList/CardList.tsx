// Archivo: src/components/CardList/CardList.tsx

import React from "react";
// Importamos tu componente ProductCard.
// Asegúrate de que esta ruta sea correcta en tu estructura de carpetas.
import ProductCard from "../ProductCard/ProductCard";
import styles from "./CardList.module.css"; // Importamos los estilos CSS Modules para CardList
import { ProductoDTO } from "../../../dto/ProductoDTO"; // Importamos la interfaz del DTO

// Definimos las props que el componente CardList espera recibir
interface CardListProps {
  products: ProductoDTO[]; // La lista de productos a mostrar (aunque a veces llegue otra cosa)
  // Puedes añadir otras props aquí si es necesario (ej. loading, error, title)
  // loading?: boolean;
  // error?: string | null;
  // title?: string;
}

// Componente funcional CardList
const CardList: React.FC<CardListProps> = ({
  products /*, loading, error, title*/,
}) => {

    // --- LOG DE DEPURACIÓN: Ver qué valor llega a la prop 'products' ---
    console.log("CardList received products prop:", products, "Type:", typeof products, "Is Array:", Array.isArray(products));
    // --- FIN LOG DE DEPURACIÓN ---


  // --- Manejo opcional de estados de carga y error a nivel de lista ---
  /*
  if (loading) {
      return <p className={styles.loadingMessage}>Cargando lista de productos...</p>;
  }

  if (error) {
      return <p className={styles.errorMessage}>Error al cargar la lista: {error}</p>;
  }
  */
  // --- Fin Manejo opcional ---

  // Si la lista de productos está vacía o no es un array o está vacía
  if (!Array.isArray(products) || products.length === 0) { // <-- Asegúrate de tener esta verificación
    return (
      <p className={styles.noProductsMessage}>
        No se encontraron productos para mostrar.
      </p>
    );
  }

  // Si hay productos (y es un array), renderizamos la lista
  return (
    <div className={styles.cardListContainer}>
      {" "}
      {/* Contenedor principal de la lista */}
      {/* --- Título opcional para la sección ---
      {title && <h2 className={styles.listTitle}>{title}</h2>}
      --- Fin Título opcional --- */}
      {/* Contenedor que define la cuadrícula o disposición de las tarjetas */}
      {/* Aquí es donde aplicarías tus estilos CSS Module para la cuadrícula */}
      <div className={styles.cardGrid}>
        {/* Mapeamos sobre el array de productos y renderizamos tu ProductCard para cada uno */}
        {products.map((product) => { // <-- Ahora products ya está garantizado de ser un array aquí
          // Opcional: puedes mantener este log si quieres depurar qué producto se renderiza
          // console.log("Datos del producto en mapeo:", product);

          // Retorna el componente ProductCard
          return (
            <ProductCard
              key={product.id || `product-${Math.random()}`}
              product={product}
              // Pasamos el objeto producto completo a ProductCard
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardList; // Exportamos el componente

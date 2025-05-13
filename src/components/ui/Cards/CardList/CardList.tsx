// Archivo: src/components/CardList/CardList.tsx

import React from 'react';
import ProductCard from '../ProductCard/ProductCard'; // Importamos el componente ProductCard
import styles from './CardList.module.css'
import { ProductoDTO } from '../../../dto/ProductoDTO';

// Definimos las props que el componente CardList espera recibir
interface CardListProps {
  products: ProductoDTO[]; // La lista de productos a mostrar
  // Puedes añadir otras props aquí en el futuro, como:
  // loading?: boolean; // Para mostrar un indicador de carga a nivel de lista
  // error?: string | null; // Para mostrar errores a nivel de lista
  // title?: string; // Un título para la sección de la lista
}

// Componente funcional CardList
const CardList: React.FC<CardListProps> = ({ products /*, loading, error, title*/ }) => {

  // Si necesitas mostrar estados de carga/error a nivel de lista
  /*
  if (loading) {
      return <p>Cargando lista de productos...</p>;
  }

  if (error) {
      return <p>Error al cargar la lista: {error}</p>;
  }
  */

  // Si la lista está vacía
  if (!products || products.length === 0) {
    return <p className={styles.noProductsMessage}>No se encontraron productos para mostrar.</p>;
  }

  return (
    <div className={styles.cardListContainer}> {/* Contenedor principal de la lista */}
      {/* Si usas un título para la sección
      {title && <h2 className={styles.listTitle}>{title}</h2>}
      */}
      <div className={styles.cardGrid}> {/* Contenedor que define la cuadrícula/disposición */}
        {/* Mapeamos sobre el array de productos y renderizamos un ProductCard para cada uno */}
        {products.map(product => (
          // Es crucial usar una 'key' única cuando se mapean listas en React
          // Usamos el ID del producto como key, asegurándonos de que exista.
          <ProductCard key={product.id || `product-${Math.random()}`} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CardList;

import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./CardList.module.css";
import { ProductoDTO } from "../../../dto/ProductoDTO";

interface CardListProps {
  products: ProductoDTO[];
}

const CardList: React.FC<CardListProps> = ({
  products,
}) => {
  // Depuración: Muestra el valor de la prop 'products' al recibirla.
  console.log(
    "CardList received products prop:",
    products,
    "Type:",
    typeof products,
    "Is Array:",
    Array.isArray(products)
  );

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <p className={styles.noProductsMessage}>
        No se encontraron productos para mostrar.
      </p>
    );
  }

  return (
    <div className={styles.cardListContainer}>
      <div className={styles.cardGrid}>
        {products.map((product) => {
          return (
            <ProductCard
              key={product.id || `product-${Math.random()}`}
              product={product}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardList;
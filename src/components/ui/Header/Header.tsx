import styles from "./Header.module.css";
import { useState } from "react";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";

export const Header = () => {
  const [drop, setDrop] = useState(false);

  return (
    <>
      <div className={styles.containerPrincipal}>
        <div className={styles.containerLogo}>
          <img
            src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
            alt="Logo de Adidas"
          />
        </div>
        <div className={styles.containerTitles}>
          <h3
          onMouseEnter={() => setDrop(true)}
          onMouseLeave={() => setDrop(false)}
          >Calzado
          {drop && <div
            className={styles.containerDropDown}><DropDownClothes /></div>}
          </h3>
          <h3>Ropa</h3>
          <h3>Deporte</h3>
        </div>
        <div className={styles.containerSearch}>
          <div className={styles.containerLogin}>
            <h4>Iniciar Sesion</h4>
            <p>|</p>
            <h4>Ayuda</h4>
          </div>
          <div className={styles.containerPurchase}>
            <h3>Busqueda</h3>
            <h3>Boton de carrito</h3>
          </div>
        </div>
      </div>
    </>
  );
};

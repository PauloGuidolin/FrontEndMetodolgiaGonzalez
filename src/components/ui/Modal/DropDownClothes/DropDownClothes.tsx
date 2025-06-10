import styles from "./DropDownClothes.module.css";

export const DropDownClothes = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
        <div></div>
        <div className={styles.containerInfo}>
          <div className={styles.containerTable}>
            <div className={styles.containerColumn1}>
              <h2>Mujer</h2>
              <p>Tops Deportivos</p>
              <p>Calzas</p>
              <p>Buzos</p>
            </div>
            <div className={styles.containerColumn2}>
              <h2>Hombre</h2>
              <p>Remeras</p>
              <p>Camperas</p>
              <p>Shorts</p>
            </div>
            <div className={styles.containerColumn3}>
              <h2>Niños</h2>
              <p>Camiseta Fútbol</p>
              <p>Buzos</p>
              <p>Pantalones</p>
            </div>
          </div>
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};

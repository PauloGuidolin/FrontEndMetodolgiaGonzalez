import styles from "./DropDownShoes.module.css";


export const DropDownShoes = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
        <div></div>
        <div className={styles.containerInfo}>
          <div className={styles.containerTable}>
            <div className={styles.containerColumn1}>
              <h2>Infaltable</h2>
              <p>Running</p>
              <p>Fútbol</p>
              <p>Urbano</p>
            </div>
            <div className={styles.containerColumn2}>
              <h2>Tendencias</h2>
              <p>Zapatillas blancas</p>
              <p>Zapatillas negras</p>
              <p>Zapatillas para caminar</p>
            </div>
            <div className={styles.containerColumn3}>
              <h2>Deportivo</h2>
              <p>Fútbol</p>
              <p>Tenis</p>
              <p>GYM</p>
            </div>
          </div>
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};

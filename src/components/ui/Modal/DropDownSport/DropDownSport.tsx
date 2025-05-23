import styles from "./DropDownSport.module.css";

export const DropDownSport = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
        <div></div>
        <div className={styles.containerInfo}>
          <div className={styles.containerTable}>
            <div className={styles.containerColumn1}>
              <h2>Fútbol</h2>
              <p>Botines</p>
              <p>Selección Argentina</p>
              <p>Camisetas de Fútbol</p>
            </div>
            <div className={styles.containerColumn2}>
              <h2>Ténis</h2>
              <p>Calzado</p>
              <p>Ropa</p>
              <p>Medias</p>
            </div>
            <div className={styles.containerColumn3}>
              <h2>Running</h2>
              <p>Calzado</p>
              <p>Ropa</p>
              <p>Carreras</p>
            </div>
          </div>
          <img style={{height: "70px"}} src="../../../images/imageDrop.png" alt="" />
        </div>
        <div></div>
      </div>
    </>
  );
};

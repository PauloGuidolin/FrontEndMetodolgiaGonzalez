import styles from "./DropDownSport.module.css";

export const DropDownSport = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
        <table className={styles.containerTable}>
          <thead>
            <tr>
              <th>Futbol</th>
              <th>Tennis</th>
              <th>Running</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Botines</td>
              <td>Calzado</td>
              <td>Calzado</td>
            </tr>
            <tr>
              <td>Selección Aegentina</td>
              <td>Ropa</td>
              <td>Ropa</td>
            </tr>
            <tr>
              <td>Camisetas de Fútbol</td>
              <td>Medias</td>
              <td>Maratón</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.containerImg}>
          <img src="../../../images/imageDrop.png" alt="" />
        </div>
      </div>
    </>
  );
};

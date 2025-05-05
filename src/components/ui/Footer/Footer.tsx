import styles from "./Footer.module.css";

export const Footer = () => {
  return (
    <>
      <div className={styles.containerTable}>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Informacion de la empresa</th>
            <th>Nuestro mundo</th>
            
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Categoria 1</td>
            <td>Acerca de Adidas</td>
            <td>Impacto</td>
          </tr>
          <tr>
            <td>Categoria 2</td>
            <td>Infromación corporativa</td>
            <td>Personas</td>
          </tr>
          <tr>
            <td>Categoria 1</td>
            <td></td>
            <td>Planeta</td>
          </tr>
          <tr>
            <td>Categoria 4</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div className={styles.containerSocial}>
          <h4>Logo X</h4>
          <h4>Logo Face</h4>
          <h4>Logo Youtube</h4>
          <h4>Logo IG</h4>
        </div>
      </div>
    </>
  );
};

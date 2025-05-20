import styles from "./Footer.module.css";
import {
  FaXTwitter,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa6";

export const Footer = () => {
  return (
    <>
      <div className={styles.containerPrincipal}>
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
          <div className={styles.icon}>
            <a
              href="https://twitter.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.facebook.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.youtube.com/adidas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
          <div className={styles.icon}>
            <a
              href="https://www.instagram.com/adidas/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import styles from "./HomeScreen.module.css";

export const HomeScreen = () => {
  return (
    <>
      <div>
        <Header />

        <div className={styles.containerHome}>
          <div className={styles.banner}>
            <img src="../../../../images/bannerAdidas.png" alt="" />
          </div>
          <div className={styles.shirt}>
            <div className={styles.imgRelative}>
              <img src="../../../../images/camisetaboca.jpeg" alt="" />
              <div className={styles.text}>
                <h3>120 AÑOS DE GLORIA</h3>
                <h4>Boca Juniors third jersey: inspirada en los titulos</h4>
                <h3>120 AÑOS DE GLORIA</h3>
                <h3>120 AÑOS DE GLORIA</h3>
              </div>
              <img src="../../../../images/escudoboca.jpg" alt="" />
              <img
                src="../../../../images/camisetabocaentrenamiento.avif"
                alt=""
              />
            </div>
          </div>
        </div>

        <div className={styles.sliderShoes}>
          <h2>Descubrí lo indescubierto</h2>
          <div className={styles.sliderTrack}>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
            <div className={styles.shoesRunning}>
              <img src="../../../images/zapaAdidas.avif" alt="" />
              Modelo de zapas
            </div>
          </div>
        </div>

        <div className={styles.sliderClothes}>
        <h2>Tendencias de las tiendas</h2>
          <div className={styles.sliderTrack}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.clothes}>
                <img
                  src="../../../images/camperonBoca.png"
                  alt={`zapatilla ${i}`}
                />
                Que lindo camperon PAPA
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

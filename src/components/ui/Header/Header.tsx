import styles from "./Header.module.css";
import { useState } from "react";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";
import { Link, Navigate, useNavigate } from "react-router-dom"; // ¡Importante usar react-router-dom para Link!
import LoginModal from "../Modal/LogIn/LoginModal";
import RegisterModal from "../Modal/Register/RegisterModal";

export const Header = () => {
  const [drop, setDrop] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  const openLoginModal = () => {
    console.log("Se hizo clic en Iniciar Sesion");
    setIsLoginModalOpen(true);
    console.log("isLoginModalOpen:", isLoginModalOpen);
    setIsRegisterModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleRegisterClick = () => {
    closeLoginModal();
    openRegisterModal();
  };

  const handleCancelRegister = () => {
    closeRegisterModal();
  };

  return (
    <>
      <div className={styles.containerTitleUp}>
        <h3>Desbloque el poder de tus puntos</h3>
      </div>
      <div className={styles.containerPrincipal}>
        <div className={styles.containerLogo}>
          <img
            className={styles.LogoBoton}
            onClick={() => navigate("/HomeScreen")}
            src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
            alt="Logo de Adidas"
          />
        </div>
        <div className={styles.containerTitles}>
          <h3
            onMouseEnter={() => setDrop(true)}
            onMouseLeave={() => setDrop(false)}
          >
            Calzado
            {drop && (
              <div className={styles.containerDropDown}>
                <DropDownClothes />
              </div>
            )}
          </h3>
          <h3
            onMouseEnter={() => setDrop(true)}
            onMouseLeave={() => setDrop(false)}
          >Ropa
            {drop && (
              <div className={styles.containerDropDown}>
                <DropDownClothes />
              </div>
            )}
          </h3>
          <h3
            onMouseEnter={() => setDrop(true)}
            onMouseLeave={() => setDrop(false)}
          >Deporte
            {drop && (
              <div className={styles.containerDropDown}>
                <DropDownClothes />
              </div>
            )}
          </h3>
        </div>
        <div className={styles.containerSearch}>
          <div className={styles.containerLogin}>
            <h4 onClick={openLoginModal} style={{ cursor: "pointer" }}>
              Iniciar Sesion
            </h4>
            <p>|</p>
            <Link to="/HelpScreen">
              <h4>Ayuda</h4>
            </Link>
          </div>
          <div className={styles.containerPurchase}>
            <h3>Busqueda</h3>
            <h3
              className={styles.botonCarrito}
              onClick={() => navigate("/CartScreen")}
            >
              Boton de carrito
            </h3>
          </div>
        </div>
      </div>

      {/* Modales */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onRegisterClick={handleRegisterClick}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onCancelClick={handleCancelRegister}
      />
    </>
  );
};

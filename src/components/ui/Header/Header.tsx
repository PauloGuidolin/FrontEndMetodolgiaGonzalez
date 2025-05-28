import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../Modal/LogIn/LoginModal";
import RegisterModal from "../Modal/Register/RegisterModal";
import { DropDownShoes } from "../Modal/DropDownShoes/DropDownShoes";
import { DropDownSport } from "../Modal/DropDownSport/DropDownSport";

import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useAuthStore } from "../../../store/authStore";
import { AiOutlineShopping } from "react-icons/ai";

export const Header = () => {
  // Estado para los drops del menú
  const [dropClothes, setDropClothes] = useState(false);
  const [dropShoes, setDropShoes] = useState(false);
  const [dropSport, setDropSport] = useState(false);

  // Estado para los modales de autenticación
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const navigate = useNavigate();

  // Lógica de autenticación del store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Efecto para chequear autenticación al cargar el componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Consola de depuración para la autenticación
  useEffect(() => {
    console.log("Header - Estado de autenticación:", isAuthenticated);
    if (isAuthenticated && user) {
      console.log("Header - Objeto 'user' completo:", user);
      console.log(
        "Header - URL de imagen de perfil (profileImage.url):",
        user.profileImage?.url
      );
    } else {
      console.log(
        "Header - Usuario no autenticado o el objeto 'user' es null/undefined."
      );
    }
  }, [isAuthenticated, user]);

  // Funciones para abrir/cerrar modales de Login/Register
  const openLoginModal = () => {
    console.log("Se hizo clic en Iniciar Sesion");
    setIsLoginModalOpen(true);
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

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Función para manejar el clic en el perfil/usuario
  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/UserProfile");
    } else {
      openLoginModal();
    }
  };

  // --- Lógica del menú desplegable (dropdown) ---

  // Función para cerrar todos los drops
  const closeAllDrops = () => {
    setDropShoes(false);
    setDropClothes(false);
    setDropSport(false);
  };

  // Función para abrir un drop específico y asegurar que solo uno esté abierto
  const handleMouseEnterH3 = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    closeAllDrops(); // Cierra los otros drops
    setter(true); // Abre el drop específico
  };

  return (
    <>
      <div className={styles.containerTitleUp}>
        <h3>Desbloque el poder de tus puntos</h3>
      </div>
      
      {/* Contenedor principal de la navegación */}
      <div className={styles.containerPrincipal}> 
        {/* Contenedor del logo */}
        <div className={styles.containerLogo}>
          <img
            className={styles.LogoBoton}
            onClick={() => navigate("/HomeScreen")}
            src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
            alt="Logo de Adidas"
          />
        </div>
        
        {/* NUEVO CONTENEDOR: Envuelve los h3 y el megaDropDownWrapper para el onMouseLeave */}
        <div 
          className={styles.megaMenuArea} 
          onMouseLeave={closeAllDrops} // Cierra todos los drops cuando el ratón sale de TODA esta área
        >
          {/* Contenedor de los títulos (Calzado, Ropa, Deporte) */}
          <div className={styles.containerTitles}>
            <h3 onMouseEnter={() => handleMouseEnterH3(setDropShoes)}>
              Calzado
            </h3>

            <h3 onMouseEnter={() => handleMouseEnterH3(setDropClothes)}>
              Ropa
            </h3>

            <h3 onMouseEnter={() => handleMouseEnterH3(setDropSport)}>
              Deporte
            </h3>
          </div>

          {/* Renderizado condicional del mega dropdown wrapper */}
          {(dropShoes || dropClothes || dropSport) && (
            <div 
              className={styles.megaDropDownWrapper}
              // onMouseEnter aquí es una medida de seguridad para evitar cierres prematuros
              // si el ratón se mueve rápidamente. No debería ser estrictamente necesario
              // si el onMouseLeave del padre funciona bien, pero no hace daño.
              onMouseEnter={() => {
                  if (dropShoes) setDropShoes(true);
                  if (dropClothes) setDropClothes(true);
                  if (dropSport) setDropSport(true);
              }}
            >
              {dropShoes && <DropDownShoes />}
              {dropClothes && <DropDownClothes />}
              {dropSport && <DropDownSport />}
            </div>
          )}
        </div> {/* Cierre de styles.megaMenuArea */}
        
        {/* Contenedor de la derecha con Login y Compra */}
        <div className={styles.containerRight}>
          <div className={styles.containerLogin}>
            {isAuthenticated ? (
              <>
                <div
                  className={styles.profileContainer}
                  onClick={handleProfileClick}
                  style={{ cursor: "pointer" }}
                >
                  {user?.profileImage?.url ? ( 
                    <img
                      src={user.profileImage.url} 
                      alt="Foto de perfil"
                      className={styles.profileImage}
                      onError={(e) => {
                        console.error(
                          "Error al cargar la imagen de perfil en el Header. URL:",
                          user.profileImage?.url
                        );
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <FaUserCircle className={styles.profileIcon} />
                  )}
                </div>

                <p>|</p>

                <h4 onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Cerrar Sesión
                </h4>
                <p>|</p>
                <Link to="/HelpScreen">
                  <h4>Ayuda</h4>
                </Link>

                {user?.role === "ADMIN" && (
                  <>
                    <p>|</p>
                    <Link to="/admin-panel">
                      <h4>Panel Admin</h4>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <h4 onClick={openLoginModal} style={{ cursor: "pointer" }}>
                  Iniciar Sesión
                </h4>
                <p>|</p>
                <Link to="/HelpScreen">
                  <h4>Ayuda</h4>
                </Link>
              </>
            )}
          </div>
          <div className={styles.containerPurchase}>
            <div className={styles.containerSearch}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Buscar" />
            </div>

            <div className={styles.iconBag}>
              <AiOutlineShopping
                className={styles.icon}
                onClick={() => navigate("/CartScreen")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modales de Login y Registro */}
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
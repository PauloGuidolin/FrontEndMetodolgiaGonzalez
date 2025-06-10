// src/components/ui/Header/Header.tsx
import styles from "./Header.module.css";
import React, { useState, useEffect, useCallback, FC } from "react"; // Importa useCallback
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../Modal/LogIn/LoginModal";

import { DropDownShoes } from "../Modal/DropDownShoes/DropDownShoes";
import { DropDownSport } from "../Modal/DropDownSport/DropDownSport";
import { FaSearch } from "react-icons/fa";
import { useAuthStore } from "../../../store/authStore";
import { AiOutlineShopping } from "react-icons/ai";
import RegisterModal from "../Modal/Register/RegisterModal";

import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useProductStore } from "../../../store/productStore";

export const Header: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const setAndFetchFilteredProducts = useProductStore(
    (state) => state.setAndFetchFilteredProducts
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/ProductScreen");
    // Llamamos al store con solo el filtro denominacion
    setAndFetchFilteredProducts({ denominacion: searchText });
  };

  const [dropClothes, setDropClothes] = useState(false);
  const [dropShoes, setDropShoes] = useState(false);
  const [dropSport, setDropSport] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [displayedProfileImageUrl, setDisplayedProfileImageUrl] =
    useState<string>("");

  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  // Obtenemos checkAuth del store de Zustand
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Este useEffect solo debe ejecutarse una vez al montar el componente.
  // La función 'checkAuth' de Zustand es estable y no necesita estar en el array de dependencias.
  useEffect(() => {
    checkAuth();
  }, []); // <--- ¡ARRAY DE DEPENDENCIAS VACÍO!

  useEffect(() => {
    if (isAuthenticated && user?.imagenUser?.url) {
      setDisplayedProfileImageUrl(user.imagenUser.url);
    } else {
      setDisplayedProfileImageUrl("");
    }
  }, [isAuthenticated, user]);

  // >>>>> CONSOLE.LOGS PARA DEPURACIÓN (déjalos para verificar que el bucle desaparece) <<<<<
  useEffect(() => {
    console.log("Header - Estado de autenticación:", isAuthenticated);
    if (isAuthenticated && user) {
      console.log("Header - Objeto 'user' completo:", user);
      console.log(
        "Header - URL de imagen de perfil (imagenUser.url):",
        user.imagenUser?.url
      );
    } else {
      console.log(
        "Header - Usuario no autenticado o el objeto 'user' es null/undefined."
      );
    }
    console.log(
      "Header - displayedProfileImageUrl (para Avatar de MUI):",
      displayedProfileImageUrl
    );
  }, [isAuthenticated, user, displayedProfileImageUrl]);

  // ********** INICIO DE LA CORRECCIÓN CRÍTICA: APLICAR useCallback **********

  const openLoginModal = useCallback(() => {
    console.log("Se hizo clic en Iniciar Sesion");
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false); // Asegúrate de cerrar el de registro si estaba abierto
  }, []); // Dependencias vacías: esta función nunca cambiará

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []); // Dependencias vacías: esta función nunca cambiará

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false); // Asegúrate de cerrar el de login si estaba abierto
  }, []); // Dependencias vacías: esta función nunca cambiará

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []); // Dependencias vacías: esta función nunca cambiará

  const handleRegisterClick = useCallback(() => {
    closeLoginModal(); // closeLoginModal ya está memoizada
    openRegisterModal(); // openRegisterModal ya está memoizada
  }, [closeLoginModal, openRegisterModal]); // Depende de las funciones memoizadas

  // Nueva función para manejar el éxito del registro: cierra el modal de registro y abre el de login
  const handleRegisterSuccess = useCallback(() => {
    closeRegisterModal(); // closeRegisterModal ya está memoizada
    openLoginModal(); // openLoginModal ya está memoizada
  }, [closeRegisterModal, openLoginModal]); // Depende de las funciones memoizadas

  // La función que se llama cuando se hace clic en "Ya tengo una cuenta" desde RegisterModal
  // o cuando se cierra el RegisterModal sin completar el registro y se quiere volver al Login.
  const handleBackToLogin = useCallback(() => {
    closeRegisterModal(); // closeRegisterModal ya está memoizada
    openLoginModal(); // openLoginModal ya está memoizada
  }, [closeRegisterModal, openLoginModal]); // Depende de las funciones memoizadas

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]); // Depende de logout (de Zustand) y navigate (de react-router-dom)

  const handleProfileClick = useCallback(() => {
    if (isAuthenticated) {
      navigate("/UserProfile");
    } else {
      openLoginModal();
    }
  }, [isAuthenticated, navigate, openLoginModal]); // Depende de isAuthenticated, navigate, y openLoginModal

  // --- Lógica del menú desplegable (dropdown) ---

  // Función para cerrar todos los drops
  const closeAllDrops = useCallback(() => {
    setDropShoes(false);
    setDropClothes(false);
    setDropSport(false);
  }, []); // Dependencias vacías: esta función nunca cambiará

  // Función para abrir un drop específico y asegurar que solo uno esté abierto
  const handleMouseEnterH3 = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      closeAllDrops(); // closeAllDrops ya está memoizada
      setter(true); // Abre el drop específico
    },
    [closeAllDrops]
  ); // Depende de closeAllDrops

  // ********** FIN DE LA CORRECCIÓN CRÍTICA **********

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
          )}{" "}
          {/* <-- ESTA ES LA ETIQUETA DE CIERRE QUE FALTABA */}
        </div>{" "}
        {/* Este div de cierre corresponde a styles.megaMenuArea */}
        <div className={styles.containerRight}>
          <div className={styles.containerLogin}>
            {isAuthenticated ? (
              <>
                <div
                  className={styles.profileContainer}
                  onClick={handleProfileClick}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    alt="Foto de perfil"
                    src={displayedProfileImageUrl}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "1.5rem",
                      bgcolor: "#CCCCCC",
                      color: "#555555",
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: "1.5rem" }} />
                  </Avatar>
                </div>
                <h4 onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Cerrar Sesión
                </h4>
                <Link to="/HelpScreen">
                  <h4>Ayuda</h4>
                </Link>
                {user?.role === "ADMIN" && ( // La condición envuelve todo el bloque JSX
                  <div onClick={() => navigate("/admin/productos")}>
                    {" "}
                    {/* Un elemento clickeable, como un div o un Button */}
                    <h4>Panel Admin</h4>
                  </div>
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
            <form
              className={styles.containerSearch}
              onSubmit={handleSearchSubmit}
            >
              <input
                type="search"
                placeholder="Buscar"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>
                <FaSearch className={styles.searchIcon} type="submit" />
              </button>
            </form>

            <div className={styles.iconBag}>
              <AiOutlineShopping
                className={styles.icon}
                onClick={() => navigate("/CartScreen")}
              />
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onRegisterClick={handleRegisterClick}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onLoginClick={handleBackToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
};

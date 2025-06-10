// src/components/ui/Header/Header.tsx
import styles from "./Header.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
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

export const Header = () => {
  const [dropClothes, setDropClothes] = useState(false);
  const [dropShoes, setDropShoes] = useState(false);
  const [dropSport, setDropSport] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [displayedProfileImageUrl, setDisplayedProfileImageUrl] =
    useState<string>("");

  // Nuevo estado para el valor del input de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const closeDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clothesMenuRef = useRef<HTMLHeadingElement>(null);
  const shoesMenuRef = useRef<HTMLHeadingElement>(null);
  const sportMenuRef = useRef<HTMLHeadingElement>(null);
  const megaDropDownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.imagenUser?.url) {
      setDisplayedProfileImageUrl(user.imagenUser.url);
    } else {
      setDisplayedProfileImageUrl("");
    }
  }, [isAuthenticated, user]);

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

  const openLoginModal = useCallback(() => {
    console.log("Se hizo clic en Iniciar Sesion");
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const handleRegisterClick = useCallback(() => {
    closeLoginModal();
    openRegisterModal();
  }, [closeLoginModal, openRegisterModal]);

  const handleRegisterSuccess = useCallback(() => {
    closeRegisterModal();
    openLoginModal();
  }, [closeRegisterModal, openLoginModal]);

  const handleBackToLogin = useCallback(() => {
    closeRegisterModal();
    openLoginModal();
  }, [closeRegisterModal, openLoginModal]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleProfileClick = useCallback(() => {
    if (isAuthenticated) {
      navigate("/UserProfile");
    } else {
      openLoginModal();
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  // --- Lógica del menú desplegable (dropdown) CON RETRASO ---
  const closeAllDrops = useCallback(() => {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setDropShoes(false);
      setDropClothes(false);
      setDropSport(false);
      closeDropdownTimeoutRef.current = null;
    }, 300);
  }, []);

  const handleMouseEnterH3 = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      if (closeDropdownTimeoutRef.current) {
        clearTimeout(closeDropdownTimeoutRef.current);
        closeDropdownTimeoutRef.current = null;
      }
      setDropShoes(false);
      setDropClothes(false);
      setDropSport(false);
      setter(true);
    },
    []
  );

  const handleMegaDropdownMouseEnter = useCallback(() => {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  }, []);

  // --- Lógica del buscador ---
  // Manejador de cambio para el input
  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  // Manejador para cuando se envía la búsqueda (presionar Enter o clic en icono)
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) { // Solo navega si hay algo escrito
      const params = new URLSearchParams();
      // Asumiendo que tu backend/página de productos usa 'denominacion' para buscar por nombre
      params.append('denominacion', searchQuery.trim());
      navigate(`/productos?${params.toString()}`);
      setSearchQuery(""); // Limpiar el input después de la búsqueda
    }
  }, [searchQuery, navigate]);

  // Manejador para el evento keydown (para detectar 'Enter')
  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);


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
        <div
          className={styles.megaMenuArea}
          onMouseLeave={closeAllDrops}
        >
          <div className={styles.containerTitles}>
            <h3
              onMouseEnter={() => handleMouseEnterH3(setDropShoes)}
              ref={shoesMenuRef}
            >
              Calzado
            </h3>

            <h3
              onMouseEnter={() => handleMouseEnterH3(setDropClothes)}
              ref={clothesMenuRef}
            >
              Ropa
            </h3>

            <h3
              onMouseEnter={() => handleMouseEnterH3(setDropSport)}
              ref={sportMenuRef}
            >
              Deporte
            </h3>
          </div>
          {(dropShoes || dropClothes || dropSport) && (
            <div
              className={styles.megaDropDownWrapper}
              onMouseEnter={handleMegaDropdownMouseEnter}
              ref={megaDropDownWrapperRef}
            >
              {dropShoes && <DropDownShoes />}
              {dropClothes && <DropDownClothes />}
              {dropSport && <DropDownSport />}
            </div>
          )}
        </div>
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
                <p>|</p>
                <Link to="/HelpScreen">
                  <h4>Ayuda</h4>
                </Link>
                {user?.role === "ADMIN" && (
                  <div onClick={() => navigate("/admin/productos")}>
                    {" "}
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
            <div className={styles.containerSearch}>
              {/* Input de búsqueda */}
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery} // Conecta el valor del input al estado
                onChange={handleSearchInputChange} // Actualiza el estado cuando el input cambia
                onKeyDown={handleSearchKeyDown} // Permite buscar al presionar Enter
              />
              {/* Icono de búsqueda - ahora con onClick para disparar la búsqueda */}
              <FaSearch
                className={styles.searchIcon}
                onClick={handleSearchSubmit} // Dispara la búsqueda al hacer clic
                style={{ cursor: 'pointer' }} // Indica que es clickeable
              />
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
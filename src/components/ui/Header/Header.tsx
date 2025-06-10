import styles from "./Header.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes"; // Componente para menú desplegable de ropa.
import { Link, useNavigate } from "react-router-dom"; // Hooks para navegación de React Router.
import LoginModal from "../Modal/LogIn/LoginModal"; // Modal para inicio de sesión.

import { DropDownShoes } from "../Modal/DropDownShoes/DropDownShoes"; // Componente para menú desplegable de calzado.
import { DropDownSport } from "../Modal/DropDownSport/DropDownSport"; // Componente para menú desplegable de deporte.
import { FaSearch } from "react-icons/fa"; // Icono de búsqueda de Font Awesome.
import { useAuthStore } from "../../../store/authStore"; // Hook del store de autenticación (Zustand).
import { AiOutlineShopping } from "react-icons/ai"; // Icono de carrito de compras.
import RegisterModal from "../Modal/Register/RegisterModal"; // Modal para registro.

import Avatar from "@mui/material/Avatar"; // Componente Avatar de Material-UI.
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Icono de círculo de cuenta de Material-UI.

/**
 * `Header` es el componente de la cabecera de la aplicación.
 * Gestiona la visibilidad de los menús desplegables, la autenticación de usuarios,
 * la búsqueda de productos y la navegación.
 */
export const Header = () => {
    // Estados para controlar la visibilidad de los menús desplegables.
    const [dropClothes, setDropClothes] = useState(false);
    const [dropShoes, setDropShoes] = useState(false);
    const [dropSport, setDropSport] = useState(false);

    // Estados para controlar la visibilidad de los modales de login y registro.
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // Estado para la URL de la imagen de perfil del usuario.
    const [displayedProfileImageUrl, setDisplayedProfileImageUrl] =
        useState<string>("");

    // Estado para el valor del input de búsqueda.
    const [searchQuery, setSearchQuery] = useState<string>("");

    const navigate = useNavigate(); // Hook para navegar programáticamente.

    // Acceso al estado y acciones del store de autenticación.
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    // Ref para manejar el timeout de cierre de los dropdowns.
    const closeDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Refs para los elementos H3 de los menús (útil para detectar eventos de mouse).
    const clothesMenuRef = useRef<HTMLHeadingElement>(null);
    const shoesMenuRef = useRef<HTMLHeadingElement>(null);
    const sportMenuRef = useRef<HTMLHeadingElement>(null);
    // Ref para el contenedor principal de los dropdowns (mega menú).
    const megaDropDownWrapperRef = useRef<HTMLDivElement>(null);

    // Efecto para verificar la autenticación al cargar el componente.
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Efecto para actualizar la URL de la imagen de perfil cuando cambian la autenticación o el usuario.
    useEffect(() => {
        if (isAuthenticated && user?.imagenUser?.url) {
            setDisplayedProfileImageUrl(user.imagenUser.url);
        } else {
            setDisplayedProfileImageUrl("");
        }
    }, [isAuthenticated, user]);

    // Efecto para loguear el estado de autenticación y la información del usuario (para depuración).
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

    /**
     * Abre el modal de inicio de sesión y cierra el de registro.
     */
    const openLoginModal = useCallback(() => {
        console.log("Se hizo clic en Iniciar Sesion");
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
    }, []);

    /**
     * Cierra el modal de inicio de sesión.
     */
    const closeLoginModal = useCallback(() => {
        setIsLoginModalOpen(false);
    }, []);

    /**
     * Abre el modal de registro y cierra el de inicio de sesión.
     */
    const openRegisterModal = useCallback(() => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
    }, []);

    /**
     * Cierra el modal de registro.
     */
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
    if (searchQuery.trim()) {
      // Solo navega si hay algo escrito
      const params = new URLSearchParams();
      // Asumiendo que tu backend/página de productos usa 'denominacion' para buscar por nombre
      params.append("denominacion", searchQuery.trim());
      navigate(`/productos?${params.toString()}`);
      setSearchQuery(""); // Limpiar el input después de la búsqueda
    }
  }, [searchQuery, navigate]);

  // Manejador para el evento keydown (para detectar 'Enter')
  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

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
          {(dropShoes || dropClothes || dropSport) && (
            <div
              className={styles.megaDropDownWrapper}
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
                type="search"
                placeholder="Buscar"
                value={searchQuery} // Conecta el valor del input al estado
                onChange={handleSearchInputChange} // Actualiza el estado cuando el input cambia
                onKeyDown={handleSearchKeyDown} // Permite buscar al presionar Enter
                className={styles.inputSearch}
              />
              {/* Icono de búsqueda - ahora con onClick para disparar la búsqueda */}
              <FaSearch
                className={styles.searchIcon}
                onClick={handleSearchSubmit} // Dispara la búsqueda al hacer clic
                style={{ cursor: "pointer" }} // Indica que es clickeable
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

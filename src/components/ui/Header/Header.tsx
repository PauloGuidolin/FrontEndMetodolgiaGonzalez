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

    /**
     * Maneja el clic en "Registrarse" desde el modal de login, cerrando login y abriendo registro.
     */
    const handleRegisterClick = useCallback(() => {
        closeLoginModal();
        openRegisterModal();
    }, [closeLoginModal, openRegisterModal]);

    /**
     * Maneja el éxito del registro, cerrando registro y abriendo login.
     */
    const handleRegisterSuccess = useCallback(() => {
        closeRegisterModal();
        openLoginModal();
    }, [closeRegisterModal, openLoginModal]);

    /**
     * Maneja el clic en "Volver a iniciar sesión" desde el modal de registro.
     */
    const handleBackToLogin = useCallback(() => {
        closeRegisterModal();
        openLoginModal();
    }, [closeRegisterModal, openLoginModal]);

    /**
     * Maneja el cierre de sesión del usuario.
     */
    const handleLogout = useCallback(() => {
        logout(); // Llama a la función de logout del store.
        navigate("/"); // Redirige a la pantalla de inicio.
    }, [logout, navigate]);

    /**
     * Maneja el clic en el ícono de perfil, navegando al perfil o abriendo el modal de login.
     */
    const handleProfileClick = useCallback(() => {
        if (isAuthenticated) {
            navigate("/UserProfile"); // Navega al perfil si está autenticado.
        } else {
            openLoginModal(); // Abre el modal de login si no está autenticado.
        }
    }, [isAuthenticated, navigate, openLoginModal]);

    // --- Lógica del menú desplegable (dropdown) CON RETRASO ---
    /**
     * Cierra todos los menús desplegables después de un pequeño retraso.
     * Utiliza un timeout para permitir el movimiento del mouse entre el menú y el contenido desplegado.
     */
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
        }, 300); // 300ms de retraso.
    }, []);

    /**
     * Maneja el evento mouseEnter en los títulos de categoría para abrir el dropdown correspondiente.
     * Cierra cualquier dropdown existente antes de abrir el nuevo.
     * @param setter Función de estado para el dropdown específico (e.g., setDropShoes).
     */
    const handleMouseEnterH3 = useCallback(
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
            // Limpia cualquier timeout de cierre pendiente.
            if (closeDropdownTimeoutRef.current) {
                clearTimeout(closeDropdownTimeoutRef.current);
                closeDropdownTimeoutRef.current = null;
            }
            // Cierra todos los dropdowns antes de abrir el actual para evitar múltiples abiertos.
            setDropShoes(false);
            setDropClothes(false);
            setDropSport(false);
            setter(true); // Abre el dropdown específico.
        },
        []
    );

    /**
     * Maneja el evento mouseEnter en el contenedor del mega-dropdown.
     * Esto evita que el dropdown se cierre si el mouse se mueve del título al contenido del dropdown.
     */
    const handleMegaDropdownMouseEnter = useCallback(() => {
        if (closeDropdownTimeoutRef.current) {
            clearTimeout(closeDropdownTimeoutRef.current);
            closeDropdownTimeoutRef.current = null;
        }
    }, []);

    // --- Lógica del buscador ---
    /**
     * Manejador de cambio para el input de búsqueda.
     * Actualiza el estado `searchQuery` con el valor actual del input.
     * @param event Evento de cambio del input.
     */
    const handleSearchInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(event.target.value);
        },
        []
    );

    /**
     * Manejador para cuando se envía la búsqueda (al presionar Enter o hacer clic en el icono).
     * Navega a la página de productos con el filtro de denominación.
     */
    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim()) { // Solo navega si hay algo escrito en el input.
            const params = new URLSearchParams();
            // Asume que la página de productos utiliza 'denominacion' para buscar por nombre.
            params.append('denominacion', searchQuery.trim());
            navigate(`/productos?${params.toString()}`); // Navega a la ruta de productos con el parámetro.
            setSearchQuery(""); // Limpia el input después de la búsqueda.
        }
    }, [searchQuery, navigate]);

    /**
     * Manejador para el evento keydown en el input de búsqueda.
     * Dispara `handleSearchSubmit` si la tecla presionada es 'Enter'.
     * @param event Evento de teclado.
     */
    const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    }, [handleSearchSubmit]);

    return (
        <>
            <div className={styles.containerTitleUp}>
                <h3>Desbloquea el poder de tus puntos</h3> {/* Título promocional superior. */}
            </div>
            <div className={styles.containerPrincipal}>
                <div className={styles.containerLogo}>
                    <img
                        className={styles.LogoBoton}
                        onClick={() => navigate("/HomeScreen")} // Navega a la pantalla de inicio al hacer clic en el logo.
                        src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
                        alt="Logo de Adidas"
                    />
                </div>
                <div
                    className={styles.megaMenuArea}
                    onMouseLeave={closeAllDrops} // Cierra todos los dropdowns cuando el mouse sale de esta área.
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
                    {/* Renderiza el mega-dropdown solo si alguno está activo */}
                    {(dropShoes || dropClothes || dropSport) && (
                        <div
                            className={styles.megaDropDownWrapper}
                            onMouseEnter={handleMegaDropdownMouseEnter} // Evita el cierre si el mouse entra al dropdown.
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
                                {/* Contenedor de perfil si el usuario está autenticado */}
                                <div
                                    className={styles.profileContainer}
                                    onClick={handleProfileClick}
                                    style={{ cursor: "pointer" }}
                                >
                                    {/* Avatar del usuario con imagen de perfil o icono por defecto */}
                                    <Avatar
                                        alt="Foto de perfil"
                                        src={displayedProfileImageUrl}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            fontSize: "1.5rem",
                                            bgcolor: "#CCCCCC", // Color de fondo si no hay imagen.
                                            color: "#555555", // Color del icono por defecto.
                                        }}
                                    >
                                        <AccountCircleIcon sx={{ fontSize: "1.5rem" }} /> {/* Icono por defecto. */}
                                    </Avatar>
                                </div>
                                <h4 onClick={handleLogout} style={{ cursor: "pointer" }}>
                                    Cerrar Sesión
                                </h4>
                                <p>|</p>
                                <Link to="/HelpScreen">
                                    <h4>Ayuda</h4>
                                </Link>
                                {/* Muestra el panel de administración solo para usuarios con rol 'ADMIN' */}
                                {user?.role === "ADMIN" && (
                                    <div onClick={() => navigate("/admin/productos")}>
                                        <h4>Panel Admin</h4>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Opciones si el usuario no está autenticado */}
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
                                value={searchQuery} // Conecta el valor del input al estado.
                                onChange={handleSearchInputChange} // Actualiza el estado cuando el input cambia.
                                onKeyDown={handleSearchKeyDown} // Permite buscar al presionar Enter.
                            />
                            {/* Icono de búsqueda - ahora con onClick para disparar la búsqueda */}
                            <FaSearch
                                className={styles.searchIcon}
                                onClick={handleSearchSubmit} // Dispara la búsqueda al hacer clic.
                                style={{ cursor: 'pointer' }} // Indica que es clickeable.
                            />
                        </div>

                        <div className={styles.iconBag}>
                            <AiOutlineShopping
                                className={styles.icon}
                                onClick={() => navigate("/CartScreen")} // Navega a la pantalla del carrito.
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
                onLoginClick={handleBackToLogin}
                onRegisterSuccess={handleRegisterSuccess}
            />
        </>
    );
};
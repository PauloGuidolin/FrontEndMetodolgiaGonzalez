import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../Modal/LogIn/LoginModal";
import RegisterModal from "../Modal/Register/RegisterModal";
import { DropDownShoes } from "../Modal/DropDownShoes/DropDownShoes";
import { DropDownSport } from "../Modal/DropDownSport/DropDownSport";

import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuthStore } from "../../../store/authStore";
import { AiOutlineShopping } from "react-icons/ai";

export const Header = () => {
    const [dropClothes, setDropClothes] = useState(false);
    const [dropShoes, setDropShoes] = useState(false);
    const [dropSport, setDropSport] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const navigate = useNavigate();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // >>>>> CONSOLE.LOGS PARA DEPURACIÓN <<<<<
    useEffect(() => {
        console.log("Header - Estado de autenticación:", isAuthenticated);
        if (isAuthenticated && user) {
            console.log("Header - Objeto 'user' completo:", user);
            // Ahora se accede a profileImage.url, que es donde el backend envía la URL
            console.log("Header - URL de imagen de perfil (profileImage.url):", user.profileImage?.url);
        } else {
            console.log("Header - Usuario no autenticado o el objeto 'user' es null/undefined.");
        }
    }, [isAuthenticated, user]);

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

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate("/UserProfile");
        } else {
            openLoginModal();
        }
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
                        onMouseEnter={() => setDropShoes(true)}
                        onMouseLeave={() => setDropShoes(false)}
                    >
                        Calzado
                        {dropShoes && (
                            <div className={styles.containerDropDown}>
                                <DropDownShoes />
                            </div>
                        )}
                    </h3>

                    <h3
                        onMouseEnter={() => setDropClothes(true)}
                        onMouseLeave={() => setDropClothes(false)}
                    >
                        Ropa
                        {dropClothes && (
                            <div className={styles.containerDropDown}>
                                <DropDownClothes />
                            </div>
                        )}
                    </h3>

                    <h3
                        onMouseEnter={() => setDropSport(true)}
                        onMouseLeave={() => setDropSport(false)}
                    >
                        Deporte
                        {dropSport && (
                            <div className={styles.containerDropDown}>
                                <DropDownSport />
                            </div>
                        )}
                    </h3>
                </div>
                <div className={styles.containerRight}>
                    <div className={styles.containerLogin}>
                        {isAuthenticated ? (
                            <>
                                <div className={styles.profileContainer} onClick={handleProfileClick} style={{ cursor: "pointer" }}>
                                    {/* >>>>> LÍNEAS CORREGIDAS AQUÍ <<<<< */}
                                    {user?.profileImage?.url ? ( // Accede a user.profileImage.url
                                        <img
                                            src={user.profileImage.url} // Usa user.profileImage.url como la fuente de la imagen
                                            alt="Foto de perfil"
                                            className={styles.profileImage}
                                            // Manejador de errores para depurar si la imagen no se carga
                                            onError={(e) => {
                                                console.error("Error al cargar la imagen de perfil en el Header. URL:", user.profileImage?.url);
                                                e.currentTarget.onerror = null;
                                                // Opcional: e.currentTarget.src = "/path/to/local/default-profile.png";
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
                            <AiOutlineShopping className={styles.icon} onClick={() => navigate("/CartScreen")} />
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
                onCancelClick={handleCancelRegister}
            />
        </>
    );
};
// src/components/ui/Header/Header.tsx
import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { DropDownClothes } from "../Modal/DropDownClothes/DropDownClothes";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../Modal/LogIn/LoginModal";
import RegisterModal from "../Modal/Register/RegisterModal";
import { DropDownShoes } from "../Modal/DropDownShoes/DropDownShoes";
import { DropDownSport } from "../Modal/DropDownSport/DropDownSport";

// Importa un ícono de React Icons para el perfil
import { FaUserCircle } from 'react-icons/fa';
import { useAuthStore } from "../../../store/authStore"; // Esta importación es correcta
// No es necesario importar los DTOs de auth aquí, ya que el store los maneja internamente.
// La única excepción sería si estuvieras tipando props directamente con ellos.

export const Header = () => {
    const [dropClothes, setDropClothes] = useState(false);
    const [dropShoes, setDropShoes] = useState(false);
    const [dropSport, setDropSport] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const navigate = useNavigate();

    // Extraemos el estado y las acciones del store
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user); // user ahora es de tipo UserDTO | null
    const logout = useAuthStore((state) => state.logout);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

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

    // Manejador para el clic en el perfil/imagen
    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate("/UserProfile"); // Redirige a la página de perfil si el usuario está autenticado
        } else {
            openLoginModal(); // Abre el modal de inicio de sesión si no está autenticado
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
                <div className={styles.containerSearch}>
                    <div className={styles.containerLogin}>
                        {isAuthenticated ? (
                            <>
                                {/* CAMBIO CLAVE: Envuelve la imagen/icono y el saludo en un div con onClick */}
                                <div className={styles.profileSection} onClick={handleProfileClick}>
                                    {/* MODIFICACIÓN: Acceder a user?.profileImage?.url */}
                                    {user?.profileImage?.url ? (
                                        <img
                                            src={user.profileImage.url} // <-- Usar .url
                                            alt="Foto de perfil"
                                            className={styles.profileImage}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // Evita bucles infinitos de error
                                                target.src = 'https://placehold.co/100x100/E2E8F0/FFFFFF?text=Error'; // Placeholder si la imagen falla
                                                console.error("Error loading profile image:", user?.profileImage?.url);
                                            }}
                                        />
                                    ) : (
                                        <FaUserCircle className={styles.profileIcon} />
                                    )}
                                    
                                   
                                    {/* Alternativamente, podrías mostrar el nombre y apellido si los prefieres: */}
                                    {/* {user?.firstname && user.lastname && <h4 className={styles.userName}>{`${user.firstname} ${user.lastname}`}</h4>} */}
                                </div>
                                <p>|</p>
                                <h4 onClick={handleLogout} style={{ cursor: "pointer" }}>
                                    Cerrar Sesión
                                </h4>
                                <p>|</p>
                                <Link to="/HelpScreen">
                                    <h4>Ayuda</h4>
                                </Link>
                                {/* MODIFICACIÓN: `role` en UserDTO es un string literal type ('ADMIN' | 'CLIENTE' | 'EMPLEADO') */}
                                {user?.role === 'ADMIN' && (
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
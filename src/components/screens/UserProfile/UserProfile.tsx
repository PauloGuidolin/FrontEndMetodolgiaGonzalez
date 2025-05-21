// src/components/screens/UserProfile/UserProfile.tsx
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import styles from './UserProfile.module.css';
import { useState, useEffect } from "react";
import { EditPersonalData } from "../../ui/Modal/EditPersonalData/EditPersonalData";
import EditAcccesData from "../../ui/Modal/EditAccesData/EditAcccesData";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const UserProfile = () => {
    const { user, loadingUser, errorUser, fetchUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const [openEditPersonalDataModal, setEditPersonalDataModal] = useState(false);
    const [openEditAccesDataModal, setEditAccesDataModal] = useState(false);

    useEffect(() => {
        if (!user && !loadingUser && !errorUser) {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                fetchUser();
            } else {
                navigate("/HomeScreen");
                toast.error("Debes iniciar sesión para acceder a tu perfil.");
            }
        }
    }, [user, loadingUser, errorUser, navigate, fetchUser]);

    const closeEditPersonalData = () => {
        setEditPersonalDataModal(false);
        fetchUser(); // Recargar datos del usuario para ver los cambios
    };

    const closeEditAccesData = () => {
        setEditAccesDataModal(false);
        fetchUser(); // Recargar datos del usuario para ver los cambios
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        toast.info("Sesión cerrada correctamente.");
    };

    if (loadingUser) {
        return (
            <>
                <Header />
                <div className={styles.loadingContainer}>
                    <p>Cargando datos del usuario...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (errorUser) {
        return (
            <>
                <Header />
                <div className={styles.errorContainer}>
                    <p>Error al cargar el perfil: {errorUser}</p>
                    <button onClick={handleLogout} className={styles.logoutOnErrorButton}>
                        Volver al inicio / Cerrar sesión
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <div className={styles.noUserContainer}>
                    <p>No se encontraron datos de usuario o no estás autenticado. Por favor, inicie sesión.</p>
                    <button onClick={() => navigate("/login")} className={styles.loginButton}>
                        Ir a Iniciar Sesión
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    // Acceder a la primera dirección si existe en el array 'addresses'
    const firstAddress = user.addresses?.[0]; // <--- ¡Esta es la corrección clave!

    return (
        <>
            <Header />
            <div className={styles.main}>
                <div className={styles.profileContainer}>
                    <img
                        src={user?.profileImage?.url || "../../../../images/zapaAdidas.avif"}
                        alt="Foto de perfil"
                        className={styles.profileImage}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://placehold.co/200x200/E2E8F0/FFFFFF?text=Error';
                            console.error("Error loading profile image in UserProfile:", user?.profileImage?.url);
                        }}
                    />
                    <p className={styles.nameUser}>{user.firstname} {user.lastname}</p>
                    <p className={styles.correo}>{user.email}</p>
                    <button onClick={handleLogout}>CERRAR SESIÓN</button>
                </div>
                <div className={styles.dataContainer}>
                    <div>
                        <h4>Mis Datos</h4>
                        <p>En este apartado vas a poder editar tus datos y visualizarlos</p>
                    </div>

                    <div>
                        <h4>Datos Personales</h4>
                        <p>Fecha Nacimiento: {user.fechaNacimiento || 'No especificado'}</p>
                        <p>Sexo: {user.sexo || 'No especificado'}</p>
                        {/* MODIFICACIÓN: Acceder a las propiedades de la primera DomicilioDTO dentro del array 'addresses' */}
                        <p>
                            Dirección:
                            {firstAddress
                                ? `${firstAddress.calle} ${firstAddress.numero || ''}${firstAddress.piso ? `, Piso ${firstAddress.piso}` : ''}${firstAddress.departamento ? `, Depto ${firstAddress.departamento}` : ''}${firstAddress.localidadNombre ? `, ${firstAddress.localidadNombre}` : ''}${firstAddress.provinciaNombre ? `, ${firstAddress.provinciaNombre}` : ''}${firstAddress.cp ? `, CP ${firstAddress.cp}` : ''}` // Agregado CP
                                : 'No especificado'}
                        </p>
                        <button className={styles.editButton} onClick={() => setEditPersonalDataModal(true)}>Editar</button>
                    </div>

                    <div>
                        <h5>Datos de acceso</h5>
                        <p>Correo Electrónico: {user.email}</p>
                        <p>Contraseña: ****</p>
                        <button className={styles.editButton} onClick={() => setEditAccesDataModal(true)}>Editar</button>
                    </div>

                    <div>
                        <button className={styles.deleteButton}>Eliminar Cuenta</button>
                    </div>
                </div>
                {openEditPersonalDataModal && <EditPersonalData closeEditPersonalData={closeEditPersonalData} user={user} />}
                {openEditAccesDataModal && <EditAcccesData closeEditAccesData={closeEditAccesData} user={user} />}
            </div>
            <Footer />
        </>
    );
};
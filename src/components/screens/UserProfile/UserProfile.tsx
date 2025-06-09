// src/components/views/UserProfile/UserProfile.tsx

import { useState, useEffect, useCallback } from "react";
import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import styles from "./UserProfile.module.css";
import { EditPersonalData } from "../../ui/Modal/EditPersonalData/EditPersonalData";
import EditAcccesData from "../../ui/Modal/EditAccesData/EditAcccesData";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Importa el componente Avatar y el ícono AccountCircleIcon de Material-UI
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // El ícono de círculo con silueta de persona

export const UserProfile = () => {
  const { user, loadingUser, errorUser, fetchUser, logout, deactivateAccount } =
    useAuthStore();
  const navigate = useNavigate();

  const [openEditPersonalDataModal, setEditPersonalDataModal] = useState(false);
  const [openEditAccesDataModal, setEditAccesDataModal] = useState(false);

  // Estado para la URL de la imagen que se intentará mostrar.
  // Si esta URL es inválida o vacía, el componente Avatar de MUI mostrará su children (el ícono).
  const [displayedProfileImageUrl, setDisplayedProfileImageUrl] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      await fetchUser();
    } catch (error: any) {
      console.error(
        "Error inicial al cargar el usuario en UserProfile:",
        error
      );
    }
  }, [fetchUser]);

  useEffect(() => {
    // Solo intenta cargar el usuario si no está ya cargado, no está cargando y no hay un error previo.
    // Y si el token existe en localStorage.
    if (!user && !loadingUser && !errorUser) {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        fetchUserData();
      } else {
        navigate("/HomeScreen"); // o "/login" si prefieres redirigir a la página de login
        toast.error("Debes iniciar sesión para acceder a tu perfil.");
      }
    }
  }, [user, loadingUser, errorUser, navigate, fetchUserData]);

  // Lógica para determinar qué URL de imagen se pasa al Avatar de MUI.
  // Si user.imagenUser.url no existe, se establece a una cadena vacía para activar el fallback del Avatar.
  useEffect(() => {
    if (user && user.imagenUser && user.imagenUser.url) {
      setDisplayedProfileImageUrl(user.imagenUser.url);
    } else {
      setDisplayedProfileImageUrl(""); // Si no hay URL, el Avatar mostrará el ícono por defecto
    }
  }, [user]);

  const closeEditPersonalData = () => {
    setEditPersonalDataModal(false);
    fetchUserData(); // Recargar datos del usuario después de editar
  };

  const closeEditAccesData = () => {
    setEditAccesDataModal(false);
    fetchUserData(); // Recargar datos del usuario para ver los cambios
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirigir al home o página de inicio de sesión
    toast.info("Sesión cerrada correctamente.");
  };

  const handleDeleteAccount = async () => {
    const confirmDeactivation = window.confirm(
      "¿Estás seguro de que quieres desactivar tu cuenta? Esta acción es irreversible."
    );

    if (confirmDeactivation) {
      try {
        await deactivateAccount();
        toast.success("Tu cuenta ha sido desactivada correctamente.");
        logout(); // Asegurarse de cerrar sesión después de desactivar
        navigate("/"); // Redirigir al home o página de inicio de sesión
      } catch (error) {
        console.error(
          "Error al intentar desactivar la cuenta desde la UI:",
          error
        );
        toast.error(
          "Error al desactivar la cuenta. Inténtalo de nuevo más tarde."
        );
      }
    }
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
          <p>Error al cargar el perfil: {errorUser || "Error desconocido"}</p>
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
          <p>
            No se encontraron datos de usuario o no estás autenticado. Por
            favor, inicie sesión.
          </p>
          <button
            onClick={() => navigate("/login")}
            className={styles.loginButton}
          >
            Ir a Iniciar Sesión
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const firstAddress = user.addresses?.[0];

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.profileContainer}>
          {/* Usamos el componente Avatar de MUI */}
          <Avatar
            alt="Foto de perfil"
            src={displayedProfileImageUrl} // Si esta URL es vacía o falla, el Avatar mostrará el ícono de AccountCircleIcon
            sx={{
              width: 150,
              height: 150,
              fontSize: "5rem", // Tamaño del ícono si se muestra
              bgcolor: "#CCCCCC", // Color de fondo gris claro, similar a la imagen
              color: "white", // Color del ícono en blanco para contraste
            }}
            className={styles.profileImage} // Tus estilos CSS existentes todavía pueden aplicarse aquí
          >
            {/* Este es el fallback: si 'src' está vacío o la imagen no carga, se renderizará este ícono */}
            <AccountCircleIcon sx={{ fontSize: "5rem" }} />
          </Avatar>

          <p className={styles.nameUser}>
            {user.firstname} {user.lastname}
          </p>
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
            <p>Fecha Nacimiento: {user.fechaNacimiento || "No especificado"}</p>
            <p>Sexo: {user.sexo || "No especificado"}</p>
            {/* AÑADIDO: Mostrar DNI */}
            <p>DNI: {user.dni || "No especificado"}</p>
            {/* AÑADIDO: Mostrar Teléfono */}
            <p>Teléfono: {user.telefono || "No especificado"}</p>
            <p>
              Dirección:
              {firstAddress
                ? `${firstAddress.calle} ${firstAddress.numero || ""}` +
                  `${firstAddress.piso ? `, Piso ${firstAddress.piso}` : ""}` +
                  `${
                    firstAddress.departamento
                      ? `, Depto ${firstAddress.departamento}`
                      : ""
                  }` +
                  `${
                    firstAddress.localidad?.nombre
                      ? `, ${firstAddress.localidad.nombre}`
                      : ""
                  }` +
                  `${
                    firstAddress.localidad?.provincia?.nombre
                      ? `, ${firstAddress.localidad.provincia.nombre}`
                      : ""
                  }` +
                  `${firstAddress.cp ? `, CP ${firstAddress.cp}` : ""}`
                : "No especificado"}
            </p>
            <button
              className={styles.editButton}
              onClick={() => setEditPersonalDataModal(true)}
            >
              Editar
            </button>
          </div>

          <div>
            <h5>Datos de acceso</h5>
            <p>Correo Electrónico: {user.email}</p>
            <p>Contraseña: ****</p> {/* La contraseña nunca debe mostrarse */}
            <button
              className={styles.editButton}
              onClick={() => setEditAccesDataModal(true)}
            >
              Editar
            </button>
          </div>

          <div>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteAccount}
            >
              Desactivar Cuenta
            </button>
          </div>
        </div>

        {openEditPersonalDataModal && (
          <EditPersonalData
            isOpen={openEditPersonalDataModal} // <-- ¡Añadir prop isOpen!
            onClose={closeEditPersonalData} // <-- ¡Cambiar nombre de prop!
            user={user}
          />
        )}

        {openEditAccesDataModal && (
          <EditAcccesData
            isOpen={openEditAccesDataModal} // <-- ¡Añadir prop isOpen!
            onClose={closeEditAccesData} // <-- ¡Cambiar nombre de prop!
            user={user}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

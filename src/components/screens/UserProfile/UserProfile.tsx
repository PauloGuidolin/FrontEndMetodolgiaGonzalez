import { Header } from "../../ui/Header/Header";
import { Footer } from "../../ui/Footer/Footer";
import styles from "./UserProfile.module.css";
import { useState, useEffect, useCallback } from "react";
import { EditPersonalData } from "../../ui/Modal/EditPersonalData/EditPersonalData";
import EditAcccesData from "../../ui/Modal/EditAccesData/EditAcccesData";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const UserProfile = () => {
  const { user, loadingUser, errorUser, fetchUser, logout, deactivateAccount } =
    useAuthStore(); // Asegúrate de importar deactivateAccount
  const navigate = useNavigate();

  const [openEditPersonalDataModal, setEditPersonalDataModal] = useState(false);
  const [openEditAccesDataModal, setEditAccesDataModal] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      await fetchUser();
    } catch (error: any) {
      console.error(
        "Error inicial al cargar el usuario en UserProfile:",
        error
      ); // El errorUser ya se setea en el store, la UI lo maneja.
    }
  }, [fetchUser]);

  useEffect(() => {
    if (!user && !loadingUser && !errorUser) {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        fetchUserData(); // Intenta cargar el usuario
      } else {
        navigate("/HomeScreen"); // O a /login
        toast.error("Debes iniciar sesión para acceder a tu perfil.");
      }
    }
  }, [user, loadingUser, errorUser, navigate, fetchUserData]);

  const closeEditPersonalData = () => {
    setEditPersonalDataModal(false);
    fetchUserData(); // Recargar datos del usuario para ver los cambios
  };

  const closeEditAccesData = () => {
    setEditAccesDataModal(false);
    fetchUserData(); // Recargar datos del usuario para ver los cambios
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.info("Sesión cerrada correctamente.");
  };

  // *** NUEVO MANEJADOR para desactivar cuenta ***
  const handleDeleteAccount = async () => {
    const confirmDeactivation = window.confirm(
      "¿Estás seguro de que quieres desactivar tu cuenta? Esta acción es irreversible."
    );

    if (confirmDeactivation) {
      try {
        await deactivateAccount();
        // La acción deactivateAccount ya debería llamar a logout y mostrar un toast
        // y manejar la navegación.
        // navigate("/"); // O a una página de confirmación de desactivación
      } catch (error) {
        // El error ya es manejado por el store y se muestra un toast.
        console.error(
          "Error al intentar desactivar la cuenta desde la UI:",
          error
        );
      }
    }
  };
  // *** FIN NUEVO MANEJADOR ***

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
  } // Acceder a la primera dirección si existe en el array 'addresses'

  const firstAddress = user.addresses?.[0];

  return (
    <>
                  <Header />         
      <div className={styles.main}>
                       
        <div className={styles.profileContainer}>
                             
          <img
            src={
              user?.profileImage?.url || "../../../../images/zapaAdidas.avif"
            }
            alt="Foto de perfil"
            className={styles.profileImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src =
                "https://placehold.co/200x200/FFFFFF/000000?text=Error"; // Fondo blanco, texto negro
              console.error(
                "Error loading profile image in UserProfile:",
                user?.profileImage?.url
              );
            }}
          />
                             
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
            <p>Contraseña: ****</p>                       
            <button
              className={styles.editButton}
              onClick={() => setEditAccesDataModal(true)}
            >
              Editar
            </button>
                             
          </div>
                           
          <div>
                                   
            {/* Añadir el manejador onClick al botón "Eliminar Cuenta" */}     
                             
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
            closeEditPersonalData={closeEditPersonalData}
            user={user}
          />
        )}
                       
        {openEditAccesDataModal && (
          <EditAcccesData closeEditAccesData={closeEditAccesData} user={user} />
        )}
                 
      </div>
                  <Footer />     
    </>
  );
};

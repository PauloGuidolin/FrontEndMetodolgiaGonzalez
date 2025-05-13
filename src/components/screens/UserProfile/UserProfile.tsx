import { Header } from "../../ui/Header/Header"
import { Footer } from "../../ui/Footer/Footer"
import styles from './UserProfile.module.css'
import { useState } from "react"
import { EditUserData } from "../../ui/Modal/EditUserData/EditUserData"

export const UserProfile = () => {

    const [ openEditModal , setopenEditModal] = useState(false)

    return (
        <>
            <Header/>

            <div className={styles.main}>
                <div className={styles.profileContainer}>
                    <img src="../../../../images/zapaAdidas.avif" alt="" />
                    <p className="nameUser">Messi2010</p>
                    <p className="correo">Messi@gmail.com</p>
                    <button>CERRAR SESIÓN</button>

                </div>
                <div className={styles.dataContainer}>

                    <div>
                        <h4>Mis Datos</h4>
                        <p>En este apartado vas a poder editar tus datos y vizualizarlos</p>
                    </div>

                    <div>
                        <h4>Datos Personales</h4>
                        <p>Fecha Nacimiento:</p>
                        <p>Sexo: </p>
                        <p>Direccion: </p>
                        <button className={styles.editButton} onClick={() => setopenEditModal(!openEditModal)}>Editar</button>
                    </div>

                    <div>
                        <h5>Datos de acceso</h5>
                        <p>Correo Electronico:</p>
                        <p>teampolenta@gmail.com</p>
                        <p>Contraseña: ****</p>
                        <button className={styles.editButton}>Editar</button>
                    </div>

                    <div>
                        <button className={styles.deleteButton}>Eliminar Cuenta</button>
                    </div>
                </div>
                {openEditModal && <EditUserData />}
            </div>
            <Footer/>
        </>
    )

}
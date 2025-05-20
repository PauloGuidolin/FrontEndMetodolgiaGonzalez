import { Header } from "../../ui/Header/Header"
import { Footer } from "../../ui/Footer/Footer"
import styles from './UserProfile.module.css'
import { useState } from "react"
import { EditPersonalData } from "../../ui/Modal/EditPersonalData/EditPersonalData"
import EditAcccesData from "../../ui/Modal/EditAccesData/EditAcccesData"

export const UserProfile = () => {

    const [ openEditPersonalDataModal , setEditPersonalDataModal] = useState(false)
    const [ openEditAccesDataModal , setEditAccesDataModal] = useState(false)

    const closeEditPersonalData = () => {
        setEditPersonalDataModal(false)
    }

    const closeEditAccesData = () => {
        setEditAccesDataModal(!openEditAccesDataModal)
    }

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
                        <button className={styles.editButton} onClick={() => setEditPersonalDataModal(!openEditPersonalDataModal)}>Editar</button>
                    </div>

                    <div>
                        <h5>Datos de acceso</h5>
                        <p>Correo Electronico:</p>
                        <p>teampolenta@gmail.com</p>
                        <p>Contraseña: ****</p>
                        <button className={styles.editButton} onClick={closeEditAccesData}>Editar</button>
                    </div>

                    <div>
                        <button className={styles.deleteButton}>Eliminar Cuenta</button>
                    </div>
                </div>
                {openEditPersonalDataModal && <EditPersonalData closeEditPersonalData={closeEditPersonalData} />}
                {openEditAccesDataModal && <EditAcccesData closeEditAccesData={closeEditAccesData}/>}
            </div>
            <Footer/>
        </>
    )

}
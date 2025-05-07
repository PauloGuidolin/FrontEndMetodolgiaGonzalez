import { useNavigate } from "react-router"
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

            <main className={styles.main}>
                <div className={styles.fotoperfil}>
                    <img src="../../../../images/zapaAdidas.avif" alt="" />
                    <p className="nameUser">Messi2010</p>
                    <p className="correo">Messi@gmail.com</p>
                    <button>CERRAR SESIÓN</button>

                </div>
                <div className={styles.datos}>
                    <div className="misdatos">
                        <h4>Mis Datos</h4>
                        <p>En este apartado vas a poder ver tus datos</p>
                    </div>
                    <div className="resumen">
                        <h4>Resumen</h4>
                        <p>Fecha Nacimiento:</p>
                        <p>Sexo</p>
                        <p>Direccion</p>
                        <button onClick={() => setopenEditModal(!openEditModal)}>Editar</button>
                    </div>
                    <div className="editar">
                        
                        <h5>Datos de acceso</h5>
                        <p>Correo Electronico:</p>
                        <p>teampolenta@gmail.com</p>
                        <p>Contraseña: ****</p>
                        <button>Editar</button>
                        
                    </div>

                    <div className={styles.eliminar}>
                        <button>ELIMINAR</button>
                    </div>
                </div>
                {openEditModal && <EditUserData />}
            </main>
            <Footer/>
        </>
    )

}
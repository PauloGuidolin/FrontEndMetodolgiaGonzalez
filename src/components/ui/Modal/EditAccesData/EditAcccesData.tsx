import { FC } from "react"
import styles from './EditAcccesData.module.css'

interface EditAcccesDataProps{
    closeEditAccesData: () => void
}

const EditAcccesData:FC<EditAcccesDataProps> = ({closeEditAccesData}) => {


  return (
    <>
        <div className={styles.background}></div>
        <div className={styles.containerPrincipal}>
            <h3>Editar Contraseñas y correo</h3>
            <div className={styles.containerData}>
                <label>Correo</label>
                <input type="text" />
                <label>Cambiar Contraseña</label>
                <input type="text" />
                <input type="text" />
            </div>
            <div className={styles.containerButtons}>
                <button onClick={closeEditAccesData}>Cancelar</button>
                <button>Aceptar</button>
            </div>
        </div>
    </>
  )
}

export default EditAcccesData

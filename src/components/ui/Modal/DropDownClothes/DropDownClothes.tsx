import styles from "./DropDownClothes.module.css";


export const DropDownClothes = () => {    

  return (
    <>
    <div className={styles.containerPrincipal}>
        <table className={styles.containerTable}>
            <thead>
                <tr>
                    <th>Infaltable</th>
                    <th>Tendencias</th>
                    <th>Deportivo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Running</td>
                    <td>Zapatillas blancas</td>
                    <td>Futbol</td>
                </tr>
                <tr>
                    <td>Futbol</td>
                    <td>Zapatillas negras</td>
                    <td>Tenis</td>
                </tr>
                <tr>
                    <td>Urbano</td>
                    <td>Zapatillas para caminar</td>
                    <td>GYM</td>
                </tr>
            </tbody>
        </table>
        <div className={styles.containerImg}>
            <img src="../../../images/imageDrop.png" alt="" />
        </div>
    </div>
    </>
    
)
}

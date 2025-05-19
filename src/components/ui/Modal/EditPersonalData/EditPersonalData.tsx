import { FC } from "react";
import styles from "./EditPersonalData.module.css";

interface EditPersonalDataProps {
  closeEditPersonalData: () => void;
}

export const EditPersonalData: FC<EditPersonalDataProps> = ({closeEditPersonalData}) => {
  return (
    <>
      <div className={styles.background}></div>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Editar Datos</h2>

        <input type="text" placeholder="Nombre" className={styles.inputText} />
        <input
          type="text"
          placeholder="Apellido"
          className={styles.inputText}
        />

        <fieldset className={styles.dobSection}>
          <legend className={styles.dobLegend}>FECHA DE NACIMIENTO</legend>
          <div className={styles.dobInputs}>
            <input type="number" placeholder="dd" className={styles.dobInput} />
            <input type="number" placeholder="mm" className={styles.dobInput} />
            <input
              type="number"
              placeholder="yyyy"
              className={styles.dobInput}
            />
          </div>
        </fieldset>

        <fieldset className={styles.genderSection}>
          <legend className={styles.genderLegend}>Sexo</legend>
          <label className={styles.genderOption}>
            <input type="radio" name="sexo" /> Hombre
          </label>
          <label className={styles.genderOption}>
            <input type="radio" name="sexo" /> Mujer
          </label>
          <label className={styles.genderOption}>
            <input type="radio" name="sexo" /> Otros
          </label>
        </fieldset>

        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={closeEditPersonalData} >Cancelar</button>
          <button className={styles.acceptBtn}>Aceptar</button>
        </div>
      </div>
    </>
  );
};

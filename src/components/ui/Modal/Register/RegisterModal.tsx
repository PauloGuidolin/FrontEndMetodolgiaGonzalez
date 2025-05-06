import React from 'react';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onCancelClick }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.logoContainer}>
            <img
              src="https://th.bing.com/th/id/R.a256d74b77286d29095f6bcd600cf991?rik=ZPx%2fHsPcoCEgZQ&riu=http%3a%2f%2f1000logos.net%2fwp-content%2fuploads%2f2016%2f10%2fAdidas-Logo.jpg&ehk=W3QAdAlZyX6x2fhyFVPKxcbnmjhMAJJu%2fZiPr26XrkY%3d&risl=&pid=ImgRaw&r=0"
              alt="Logo de Adidas"
              className={styles.logo}
            />
            <h2>Regístrate</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <form id="registerForm">
            <div className={styles.formGroup}>
              <label htmlFor="registerName">Ingrese su nombre</label>
              <input type="text" id="registerName" name="registerName" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registerLastName">Ingrese su apellido</label>
              <input type="text" id="registerLastName" name="registerLastName" />
            </div>
            <div className={styles.formGroup}>
              <label>Seleccione su sexo</label>
              <div className={styles.radioGroup}>
                <input type="radio" id="registerGenderMale" name="registerGender" value="male" />
                <label htmlFor="registerGenderMale">Hombre</label>
                <input type="radio" id="registerGenderFemale" name="registerGender" value="female" />
                <label htmlFor="registerGenderFemale">Mujer</label>
                <input type="radio" id="registerGenderOther" name="registerGender" value="other" />
                <label htmlFor="registerGenderOther">Otro</label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registerEmail">Ingrese correo electrónico</label>
              <input type="email" id="registerEmail" name="registerEmail" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registerPassword">Ingrese Contraseña</label>
              <input type="password" id="registerPassword" name="registerPassword" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registerConfirmPassword">Ingrese nuevamente la contraseña</label>
              <input type="password" id="registerConfirmPassword" name="registerConfirmPassword" />
            </div>
            <button type="submit" className={styles.registerButton}>Registrarse</button>
            <button type="button" className={styles.cancelButton} onClick={onCancelClick}>Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
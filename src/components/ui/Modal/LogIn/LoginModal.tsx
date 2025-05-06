import React from 'react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onRegisterClick }) => {
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
            <h2>Únete al adiClub</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <form id="loginForm">
            <div className={styles.formGroup}>
              <label htmlFor="loginEmail">Ingresa tu correo electrónico</label>
              <input type="email" id="loginEmail" name="loginEmail" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="loginPassword">Ingresa tu contraseña</label>
              <input type="password" id="loginPassword" name="loginPassword" />
            </div>
            <button type="submit" className={styles.loginButton}>Iniciar Sesión</button>
            <button type="button" className={styles.registerLink} onClick={onRegisterClick}>Registrarse</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
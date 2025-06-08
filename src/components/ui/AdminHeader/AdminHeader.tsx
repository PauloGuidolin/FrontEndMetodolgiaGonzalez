// src/components/admin/AdminHeader/AdminHeader.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación
import styles from './AdminHeader.module.css'; // Importa los estilos CSS

export const AdminHeader: React.FC = () => {
    const navigate = useNavigate(); // Hook para la navegación

    // Función para manejar la redirección
    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <header className={styles.adminHeader}>
            <h1 className={styles.title}>Páginas Admin</h1>
            <nav className={styles.nav}>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/productos')} // Ruta para productos
                >
                    Productos
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/ProductReferencesScreen')} // Ruta para referencias de productos
                >
                    Referencias de Productos
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/usuarios')} // Ruta para usuarios
                >
                    Usuarios
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/ventas')} // Ruta para ventas
                >
                    Ventas
                </button>
            </nav>
        </header>
    );
};
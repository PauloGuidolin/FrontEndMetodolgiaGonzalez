// src/components/admin/AdminHeader/AdminHeader.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la navegación programática en React Router.
import styles from './AdminHeader.module.css'; // Importa los estilos CSS específicos para este componente.

/**
 * `AdminHeader` es un componente funcional que representa el encabezado
 * de las páginas de administración. Contiene un título y botones de navegación
 * para diferentes secciones del panel de administración.
 */
export const AdminHeader: React.FC = () => {
    // Inicializa el hook `useNavigate` para obtener la función que permite navegar entre rutas.
    const navigate = useNavigate();

    /**
     * `handleNavigation` es una función de ayuda que se encarga de redirigir
     * al usuario a la ruta especificada.
     * @param path La ruta a la que se debe navegar (ej. '/admin/productos').
     */
    const handleNavigation = (path: string) => {
        navigate(path); // Utiliza la función `Maps` para cambiar la URL.
    };

    return (
        // El elemento <header> principal con la clase de estilo definida en el módulo CSS.
        <header className={styles.adminHeader}>
            {/* Título de la sección de administración. */}
            <h1 className={styles.title}>Páginas Admin</h1>
            {/* Sección de navegación que contiene los botones. */}
            <nav className={styles.nav}>
                {/* Botón para navegar a la sección de Productos. */}
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/productos')} // Al hacer clic, navega a '/admin/productos'.
                >
                    Productos
                </button>
                {/* Botón para navegar a la sección de Referencias de Productos. */}
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/ProductReferencesScreen')} // Al hacer clic, navega a '/admin/ProductReferencesScreen'.
                >
                    Referencias de Productos
                </button>
                {/* Botón para navegar a la sección de Usuarios. */}
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/AdminUsersScreen')} // Al hacer clic, navega a '/admin/AdminUsersScreen'.
                >
                    Usuarios
                </button>
                {/* Botón para navegar a la sección de Ventas. */}
                <button
                    className={styles.navButton}
                    onClick={() => handleNavigation('/admin/SalesPage')} // Al hacer clic, navega a '/admin/SalesPage'.
                >
                    Ventas
                </button>
            </nav>
        </header>
    );
};
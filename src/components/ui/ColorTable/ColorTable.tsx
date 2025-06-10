import React from "react";
import styles from "./ColorTable.module.css";
import { ColorDTO } from "../../dto/ColorDTO";

/**
 * Define las propiedades esperadas por el componente ColorTable.
 */
interface ColorTableProps {
  colors: ColorDTO[]; // Lista de objetos ColorDTO a mostrar.
  loading: boolean; // Indica si los datos están cargando.
  error: string | null; // Mensaje de error si la carga falla.
  onEditColor: (color: ColorDTO) => void; // Callback para editar un color.
  onToggleColorActive: (
    id: number,
    currentStatus: boolean,
    nombreColor: string
  ) => void; // Callback para cambiar el estado activo/inactivo de un color.
  onDeleteColor: (color: ColorDTO) => void; // Callback para eliminar un color.
}

/**
 * `ColorTable` es un componente funcional que renderiza una tabla
 * para la administración de colores, mostrando su ID, nombre, estado,
 * y botones de acción (Editar, Activar/Desactivar, Eliminar).
 */
export const ColorTable: React.FC<ColorTableProps> = ({
  colors,
  loading,
  error,
  onEditColor,
  onToggleColorActive,
  onDeleteColor,
}) => {
  // Muestra un mensaje de carga mientras se obtienen los datos.
  if (loading) {
    return <p>Cargando colores...</p>;
  }

  // Muestra un mensaje de error si la carga de colores falla.
  if (error) {
    return <p className={styles.errorText}>Error al cargar colores: {error}</p>;
  }

  // Muestra un mensaje si no hay colores para mostrar.
  if (!colors || colors.length === 0) {
    return <p>No hay colores para mostrar.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color.id}>
              <td>{color.id}</td>
              <td>{color.nombreColor}</td>
              <td>
                {/* Muestra el estado del color con un estilo visual */}
                <span
                  className={`${styles.statusPill} ${
                    color.activo ? styles.active : styles.inactive
                  }`}
                >
                  {color.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className={styles.actions}>
                {/* Botón para editar el color */}
                <button
                  onClick={() => onEditColor(color)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                {/* Botón para activar/desactivar el color */}
                <button
                  onClick={() =>
                    onToggleColorActive(
                      color.id!,
                      color.activo,
                      color.nombreColor
                    )
                  }
                  className={
                    color.activo
                      ? styles.deactivateButton
                      : styles.activateButton
                  }
                >
                  {color.activo ? "Desactivar" : "Activar"}
                </button>
                {/* Botón para eliminar el color */}
                <button
                  onClick={() => onDeleteColor(color)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

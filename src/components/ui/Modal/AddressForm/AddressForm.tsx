// src/components/ui/Modal/EditPersonalData/AddressForm.tsx

import { FC, useState, useEffect, useCallback } from "react";
import styles from "./AddressForm.module.css";
// DTO (Data Transfer Object) para la estructura de una dirección.
import { DireccionDTO } from "../../../dto/DireccionDTO"; 
// DTOs para la estructura de localidad y provincia.
import { LocalidadDTO, ProvinciaDTO } from "../../../../components/dto/location"; 
// Hook del store de localidades (Zustand) para gestionar datos de ubicación.
import { useLocalityStore } from "../../../../store/localityStore"; 
// Importación de toast (aunque no se usa directamente en este snippet, es parte del entorno).
import { toast } from "react-toastify"; 
// Componente de input genérico.
import InputField from "../../InputField/InputField";

/**
 * Define las propiedades (props) esperadas por el componente AddressForm.
 */
interface AddressFormProps {
    address: DireccionDTO; // El objeto DireccionDTO que este formulario va a editar.
    index: number; // El índice de esta dirección en una lista (útil para IDs únicos y manejo de arrays).
    onAddressChange: (index: number, updatedAddress: DireccionDTO) => void; // Callback para notificar cambios en la dirección.
    onRemoveAddress: (index: number) => void; // Callback para solicitar la eliminación de esta dirección.
    showRemoveButton: boolean; // Booleano para controlar la visibilidad del botón de eliminar.
}

/**
 * `AddressForm` es un componente funcional que renderiza un formulario para introducir
 * o editar los detalles de una dirección, incluyendo la selección de provincia y localidad
 * de forma dinámica.
 *
 * @param {AddressFormProps} props Las propiedades para configurar el formulario de dirección.
 * @returns {JSX.Element} Un elemento div que contiene el formulario de dirección.
 */
export const AddressForm: FC<AddressFormProps> = ({
    address,
    index,
    onAddressChange,
    onRemoveAddress,
    showRemoveButton,
}) => {
    // Acceso a las propiedades y acciones del store de localidades.
    const {
        provinces, // Lista de todas las provincias disponibles.
        loadingProvinces, // Estado de carga para las provincias.
        errorProvinces, // Mensaje de error si falla la carga de provincias.
        fetchProvinces, // Función para cargar provincias.
        provinceLocalities, // Lista de localidades para la provincia seleccionada.
        loadingProvince, // Estado de carga para las localidades de una provincia.
        errorProvince, // Mensaje de error si falla la carga de localidades.
        fetchLocalitiesByProvinceId, // Función para cargar localidades por ID de provincia.
    } = useLocalityStore(); 

    // Estados locales para los IDs de la provincia y localidad seleccionadas en los <select>.
    const [selectedProvinciaId, setSelectedProvinciaId] = useState<number | null>(
        address.localidad?.provincia?.id || null // Inicializa con la provincia de la dirección o null.
    );
    const [selectedLocalidadId, setSelectedLocalidadId] = useState<number | null>(
        address.localidad?.id || null // Inicializa con la localidad de la dirección o null.
    );

    // Efecto: Carga todas las provincias cuando el componente se monta.
    useEffect(() => {
        fetchProvinces();
    }, [fetchProvinces]); // Dependencia: `fetchProvinces` para asegurar que se ejecute si cambia (aunque `useCallback` lo estabiliza).

    // Efecto: Carga las localidades correspondientes cuando cambia la provincia seleccionada.
    useEffect(() => {
        if (selectedProvinciaId) {
            fetchLocalitiesByProvinceId(selectedProvinciaId);
        } else {
            // Si no hay provincia seleccionada, se limpian las localidades en el store.
            useLocalityStore.setState({ provinceLocalities: [] });
        }
    }, [selectedProvinciaId, fetchLocalitiesByProvinceId]);

    // Efecto: Sincroniza los estados locales de provincia/localidad con la prop 'address'
    // Esto es crucial si la prop 'address' cambia desde el componente padre.
    useEffect(() => {
        setSelectedProvinciaId(address.localidad?.provincia?.id || null);
        setSelectedLocalidadId(address.localidad?.id || null);
    }, [address]); // Se re-ejecuta cada vez que la prop `address` cambia.

    /**
     * Maneja los cambios en los campos de input de texto y número de la dirección.
     * Actualiza el estado de la dirección en el componente padre a través de `onAddressChange`.
     * @param e Evento de cambio del input.
     */
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue: string | number | null = value;

        // Convierte a número si es un campo numérico (calle, número, cp).
        if (name === "numero" || name === "cp") {
            const parsedValue = parseInt(value, 10);
            newValue = isNaN(parsedValue) ? 0 : parsedValue; // Si no es un número válido, se establece en 0.
        }
        // Para 'piso' y 'departamento', si el input está vacío, se establece en null.
        if ((name === "piso" || name === "departamento") && value.trim() === "") {
            newValue = null;
        }

        // Llama al callback para actualizar la dirección en el componente padre.
        onAddressChange(index, { ...address, [name]: newValue });
    }, [address, index, onAddressChange]);

    /**
     * Maneja el cambio en la selección de la provincia.
     * Actualiza el ID de la provincia seleccionada y resetea la localidad.
     * @param e Evento de cambio del select de provincia.
     */
    const handleProvinciaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        // Convierte el ID a número o a null si no es válido (0 o NaN).
        const newProvinciaId = isNaN(id) || id === 0 ? null : id; 

        setSelectedProvinciaId(newProvinciaId);
        setSelectedLocalidadId(null); // Reinicia la localidad cuando la provincia cambia.

        // Encuentra el objeto ProvinciaDTO completo.
        const selectedProvincia = provinces.find(p => p.id === newProvinciaId) || null;

        // Prepara la dirección actualizada con la nueva provincia y una localidad "vacía".
        const updatedAddress: DireccionDTO = {
            ...address,
            localidad: selectedProvincia ? {
                id: undefined, // El ID de la localidad es indefinido hasta que se seleccione una.
                nombre: '', // Nombre vacío.
                provincia: selectedProvincia // Asigna el objeto ProvinciaDTO completo.
            } : null // Si no se selecciona provincia, la localidad es null.
        };
        onAddressChange(index, updatedAddress); // Notifica el cambio al componente padre.
    }, [address, index, onAddressChange, provinces]);

    /**
     * Maneja el cambio en la selección de la localidad.
     * Actualiza el ID de la localidad seleccionada y el objeto de dirección completo.
     * @param e Evento de cambio del select de localidad.
     */
    const handleLocalidadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        // Convierte el ID a número o a null si no es válido (0 o NaN).
        const newLocalidadId = isNaN(id) || id === 0 ? null : id; 

        setSelectedLocalidadId(newLocalidadId);

        // Encuentra el objeto LocalidadDTO completo de las localidades de la provincia actual.
        const selectedLocalidad = provinceLocalities.find(l => l.id === newLocalidadId) || null;

        // Reconstruye el objeto de dirección con la localidad y su provincia.
        const updatedAddress: DireccionDTO = {
            ...address,
            localidad: selectedLocalidad ? {
                id: selectedLocalidad.id,
                nombre: selectedLocalidad.nombre,
                // Busca la provincia completa para asegurar la consistencia.
                provincia: provinces.find(p => p.id === selectedProvinciaId) || undefined 
            } : null // Si no se selecciona localidad, se establece en null.
        };
        onAddressChange(index, updatedAddress); // Notifica el cambio al componente padre.
    }, [address, index, onAddressChange, provinceLocalities, selectedProvinciaId, provinces]);


    return (
        <div className={styles.addressBlock}>
            <h4>Dirección {index + 1}</h4> {/* Título para cada dirección */}
            <InputField
                id={`calle-${index}`}
                label="Calle"
                type="text"
                value={address.calle || ''} // Si `address.calle` es null/undefined, usa una cadena vacía.
                onChange={handleInputChange}
                name="calle" // Nombre del campo para el manejo genérico de cambios.
            />
            <InputField
                id={`numero-${index}`}
                label="Número"
                type="number"
                value={address.numero?.toString() || '0'} // Convierte a string para el input de tipo "number".
                onChange={handleInputChange}
                name="numero"
            />
            <InputField
                id={`piso-${index}`}
                label="Piso (opcional)"
                type="text"
                value={address.piso || ''}
                onChange={handleInputChange}
                name="piso"
            />
            <InputField
                id={`departamento-${index}`}
                label="Departamento (opcional)"
                type="text"
                value={address.departamento || ''}
                onChange={handleInputChange}
                name="departamento"
            />
            <InputField
                id={`cp-${index}`}
                label="Código Postal"
                type="number"
                value={address.cp?.toString() || '0'}
                onChange={handleInputChange}
                name="cp"
            />

            {/* Selector de Provincia */}
            <div className={styles.formGroup}>
                <label htmlFor={`provincia-${index}`}>Provincia</label>
                <select
                    id={`provincia-${index}`}
                    className={styles.selectInput}
                    value={selectedProvinciaId || ''} // El valor debe ser string para el select.
                    onChange={handleProvinciaChange}
                    disabled={loadingProvinces} // Deshabilita mientras cargan las provincias.
                >
                    <option value="">
                        {loadingProvinces ? "Cargando Provincias..." : "Selecciona una Provincia"}
                    </option>
                    {provinces.map((provincia) => (
                        <option key={provincia.id} value={provincia.id}>
                            {provincia.nombre}
                        </option>
                    ))}
                </select>
                {/* Muestra errores si los hay durante la carga de provincias. */}
                {errorProvinces && <p className={styles.errorText}>{errorProvinces}</p>}
            </div>

            {/* Selector de Localidad */}
            <div className={styles.formGroup}>
                <label htmlFor={`localidad-${index}`}>Localidad</label>
                <select
                    id={`localidad-${index}`}
                    className={styles.selectInput}
                    value={selectedLocalidadId || ''}
                    onChange={handleLocalidadChange}
                    // Deshabilita si no hay provincia seleccionada, si están cargando localidades o si no hay localidades.
                    disabled={!selectedProvinciaId || loadingProvince || provinceLocalities.length === 0}
                >
                    <option value="">
                        {loadingProvince ? "Cargando Localidades..." : "Selecciona una Localidad"}
                    </option>
                    {provinceLocalities.map((localidad) => (
                        <option key={localidad.id} value={localidad.id}>
                            {localidad.nombre}
                        </option>
                    ))}
                </select>
                {/* Muestra errores si los hay durante la carga de localidades. */}
                {errorProvince && <p className={styles.errorText}>{errorProvince}</p>}
            </div>

            {/* Botón para eliminar la dirección, si está habilitado */}
            {showRemoveButton && (
                <button
                    type="button"
                    onClick={() => onRemoveAddress(index)} // Llama al callback para eliminar.
                    className={styles.removeAddressBtn}
                >
                    Eliminar Dirección
                </button>
            )}
        </div>
    );
};
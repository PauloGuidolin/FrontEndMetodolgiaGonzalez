// src/components/ui/Modal/EditPersonalData/AddressForm.tsx

import { FC, useState, useEffect } from "react";
import styles from "./AddressForm.module.css";
import { DomicilioDTO } from "../../../dto/DomicilioDTO";
import { LocalidadDTO, ProvinciaDTO } from "../../../dto/location"; // Asumo que estos DTOs están en este path
import { locationService } from "../../../../https/localityApi";
import { toast } from "react-toastify"; // Importar toast para mensajes de error

interface AddressFormProps {
    address: DomicilioDTO;
    index: number;
    onAddressChange: (index: number, updatedAddress: DomicilioDTO) => void;
    onRemoveAddress: (index: number) => void;
    showRemoveButton: boolean; // Para controlar cuándo mostrar el botón de eliminar
}

export const AddressForm: FC<AddressFormProps> = ({
    address,
    index,
    onAddressChange,
    onRemoveAddress,
    showRemoveButton,
}) => {
    const [provincias, setProvincias] = useState<ProvinciaDTO[]>([]);
    const [localidadesOptions, setLocalidadesOptions] = useState<LocalidadDTO[]>([]);

    // Estado local para el ID de la provincia seleccionada, usado en el <select>
    const [selectedProvinciaId, setSelectedProvinciaId] = useState<number | null>(null);
    // Estado local para el ID de la localidad seleccionada, usado en el <select>
    const [selectedLocalidadId, setSelectedLocalidadId] = useState<number | null>(null);

    // Efecto 1: Cargar todas las provincias al montar el componente
    useEffect(() => {
        const fetchProvincias = async () => {
            try {
                const data = await locationService.getAllProvincias();
                setProvincias(data);

                // Si la dirección tiene una localidad y una provincia, intentar pre-seleccionar
                if (address.localidad?.provincia?.id) {
                    setSelectedProvinciaId(address.localidad.provincia.id);
                }
                if (address.localidad?.id) {
                    setSelectedLocalidadId(address.localidad.id);
                }
            } catch (error) {
                console.error("Error fetching provincias:", error);
                toast.error("Error al cargar las provincias.");
            }
        };
        fetchProvincias();
    }, [address.localidad?.provincia?.id, address.localidad?.id]); // Depende de los IDs de la dirección para inicializar

    // Efecto 2: Cargar localidades cuando cambia la provincia seleccionada
    // Se ejecuta al inicio si ya hay una provincia pre-seleccionada, o cuando el usuario la cambia
    useEffect(() => {
        const fetchLocalidades = async () => {
            if (selectedProvinciaId) {
                try {
                    const data = await locationService.getLocalidadesByProvinciaId(selectedProvinciaId);
                    setLocalidadesOptions(data);
                } catch (error) {
                    console.error("Error fetching localidades:", error);
                    toast.error("Error al cargar las localidades.");
                }
            } else {
                setLocalidadesOptions([]); // Limpiar si no hay provincia seleccionada
            }
        };
        fetchLocalidades();
    }, [selectedProvinciaId]);


    // Función genérica para manejar cambios en los inputs de texto/número de la dirección
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue: string | number | undefined = value;

        if (name === "numero" || name === "cp") {
            newValue = parseInt(value, 10);
            if (isNaN(newValue)) {
                newValue = 0; // O undefined, dependiendo de cómo quieras manejar un campo vacío/inválido
            }
        }
        // Para piso y departamento, si el input está vacío, queremos que sea undefined
        if ((name === "piso" || name === "departamento") && value.trim() === "") {
            newValue = undefined;
        }

        onAddressChange(index, { ...address, [name]: newValue });
    };

    // Manejar el cambio de provincia
    const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        setSelectedProvinciaId(id === 0 ? null : id); // Si selecciona la opción "Selecciona una Provincia", resetear a null
        setSelectedLocalidadId(null); // Resetear localidad cuando la provincia cambia

        const selectedProvincia = provincias.find(p => p.id === id);

        // Crear el objeto DomicilioDTO con la nueva provincia y una localidad vacía
        const updatedAddress: DomicilioDTO = {
            ...address,
            localidad: selectedProvincia ? {
                id: 0, // ID 0 para una nueva localidad o no seleccionada
                nombre: '',
                provincia: selectedProvincia // Asigna el objeto ProvinciaDTO completo
            } : null // Si no se selecciona provincia, localidad es null
        };
        onAddressChange(index, updatedAddress);
    };

    // Manejar el cambio de localidad
    const handleLocalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        setSelectedLocalidadId(id === 0 ? null : id); // Si selecciona la opción "Selecciona una Localidad", resetear a null

        const selectedLocalidad = localidadesOptions.find(l => l.id === id);

        // Asegurarse de que 'localidad' y 'provincia' dentro de 'localidad' existan antes de actualizarlos
        const updatedAddress: DomicilioDTO = {
            ...address,
            localidad: selectedLocalidad ? {
                id: selectedLocalidad.id,
                nombre: selectedLocalidad.nombre,
                // Asegúrate de que la provincia de la localidad seleccionada sea la misma que la provincia actual
                // (O podrías buscarla en 'provincias' si fuera necesario, pero ya debería estar establecida)
                provincia: address.localidad?.provincia || null // Mantiene la provincia existente o null
            } : null
        };
        onAddressChange(index, updatedAddress);
    };


    return (
        <div className={styles.addressBlock}>
            <h4>Dirección {index + 1}</h4>
            <input
                type="text"
                placeholder="Calle"
                className={styles.inputText}
                name="calle"
                value={address.calle || ''}
                onChange={handleInputChange}
            />
            <input
                type="number"
                placeholder="Número"
                className={styles.inputText}
                name="numero"
                value={address.numero?.toString() || ''}
                onChange={handleInputChange}
            />
            <input
                type="text"
                placeholder="Piso (opcional)"
                className={styles.inputText}
                name="piso"
                value={address.piso || ''}
                onChange={handleInputChange}
            />
            <input
                type="text"
                placeholder="Departamento (opcional)"
                className={styles.inputText}
                name="departamento"
                value={address.departamento || ''}
                onChange={handleInputChange}
            />
            <input
                type="number"
                placeholder="Código Postal"
                className={styles.inputText}
                name="cp"
                value={address.cp?.toString() || ''}
                onChange={handleInputChange}
            />

            <select
                className={styles.selectInput}
                // El valor del select ahora se basa en selectedProvinciaId
                value={selectedProvinciaId || ''}
                onChange={handleProvinciaChange}
            >
                <option value="">Selecciona una Provincia</option>
                {provincias.map((provincia) => (
                    <option key={provincia.id} value={provincia.id}>
                        {provincia.nombre}
                    </option>
                ))}
            </select>

            <select
                className={styles.selectInput}
                // El valor del select ahora se basa en selectedLocalidadId
                value={selectedLocalidadId || ''}
                onChange={handleLocalidadChange}
                disabled={!selectedProvinciaId || localidadesOptions.length === 0} // Deshabilitar si no hay provincia o no hay localidades
            >
                <option value="">Selecciona una Localidad</option>
                {localidadesOptions.map((localidad) => (
                    <option key={localidad.id} value={localidad.id}>
                        {localidad.nombre}
                    </option>
                ))}
            </select>

            {showRemoveButton && (
                <button
                    type="button"
                    onClick={() => onRemoveAddress(index)}
                    className={styles.removeAddressBtn}
                >
                    Eliminar Dirección
                </button>
            )}
        </div>
    );
};
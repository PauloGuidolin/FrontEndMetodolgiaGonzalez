// src/components/ui/Modal/EditPersonalData/AddressForm.tsx

import { FC, useState, useEffect } from "react";
import styles from "./AddressForm.module.css"; // Crear este CSS
import { DomicilioDTO } from "../../../dto/DomicilioDTO";
import { LocalidadDTO, ProvinciaDTO } from "../../../dto/location";
import { locationService } from "../../../../https/localityApi";


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
    const [localidadesOptions, setLocalidadesOptions] = useState<LocalidadDTO[]>([]); // Para el select de localidades
    const [selectedProvinciaId, setSelectedProvinciaId] = useState<number | null>(null);

    // Cargar todas las provincias al montar el componente
    useEffect(() => {
        const fetchProvincias = async () => {
            try {
                const data = await locationService.getAllProvincias();
                setProvincias(data);

                // Intentar pre-seleccionar la provincia si ya existe en la dirección
                if (address.provinciaNombre) {
                    const initialProv = data.find(p => p.nombre === address.provinciaNombre);
                    if (initialProv) {
                        setSelectedProvinciaId(initialProv.id);
                    }
                }
            } catch (error) {
                console.error("Error fetching provincias:", error);
                // Manejar error (toast)
            }
        };
        fetchProvincias();
    }, [address.provinciaNombre]); // Depende de la provincia para volver a cargar si cambia

    // Cargar localidades cuando cambia la provincia seleccionada (o al inicio si ya hay una provincia)
    useEffect(() => {
        const fetchLocalidades = async () => {
            if (selectedProvinciaId) {
                try {
                    const data = await locationService.getLocalidadesByProvinciaId(selectedProvinciaId);
                    setLocalidadesOptions(data);
                } catch (error) {
                    console.error("Error fetching localidades:", error);
                    // Manejar error (toast)
                }
            } else {
                setLocalidadesOptions([]); // Limpiar si no hay provincia seleccionada
            }
        };
        fetchLocalidades();
    }, [selectedProvinciaId]);

    // Función genérica para manejar cambios en los inputs de la dirección
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue: string | number | null = value;

        if (name === "numero" || name === "cp") {
            newValue = Number(value) || 0;
        }

        onAddressChange(index, { ...address, [name]: newValue });
    };

    // Manejar el cambio de provincia específicamente
    const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinciaId = parseInt(e.target.value);
        const provinciaNombre = e.target.options[e.target.selectedIndex].text; // Obtener el nombre
        setSelectedProvinciaId(provinciaId);
        // Actualizar la dirección con el nombre de la provincia y resetear la localidad
        onAddressChange(index, { ...address, provinciaNombre: provinciaNombre, localidadNombre: '' });
    };

    // Manejar el cambio de localidad
    const handleLocalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const localidadNombre = e.target.value;
        onAddressChange(index, { ...address, localidadNombre: localidadNombre });
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
                value={selectedProvinciaId || ''} // Usar el ID para el valor del select
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
                value={address.localidadNombre || ''}
                onChange={handleLocalidadChange}
                disabled={!selectedProvinciaId} // Deshabilitar si no hay provincia seleccionada
            >
                <option value="">Selecciona una Localidad</option>
                {localidadesOptions.map((localidad) => (
                    <option key={localidad.id} value={localidad.nombre}>
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
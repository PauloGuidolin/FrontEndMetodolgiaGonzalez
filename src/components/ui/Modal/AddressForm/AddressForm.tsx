// src/components/ui/Modal/EditPersonalData/AddressForm.tsx

import { FC, useState, useEffect, useCallback } from "react";
import styles from "./AddressForm.module.css";
import { DireccionDTO } from "../../../dto/DireccionDTO"; // Ajusta la ruta
import { LocalidadDTO, ProvinciaDTO } from "../../../../components/dto/location"; // Ajusta la ruta (ProvinciaDTO is currently unused but might be used implicitly)
import { useLocalityStore } from "../../../../store/localityStore"; // Importa tu store de localidades
import { toast } from "react-toastify"; // 'toast' is declared but its value is never read (warning)
import InputField from "../../InputField/InputField";

interface AddressFormProps {
  address: DireccionDTO;
  index: number;
  onAddressChange: (index: number, updatedAddress: DireccionDTO) => void;
  onRemoveAddress: (index: number) => void;
  showRemoveButton: boolean;
}

export const AddressForm: FC<AddressFormProps> = ({
  address,
  index,
  onAddressChange,
  onRemoveAddress,
  showRemoveButton,
}) => {
  const {
    provinces,
    loadingProvinces,
    errorProvinces,
    fetchProvinces,
    provinceLocalities,
    loadingProvince,
    errorProvince,
    fetchLocalitiesByProvinceId,
  } = useLocalityStore(); // Usa tu store de localidades

  // Estados locales para el ID de la provincia y localidad seleccionada en los <select>
  const [selectedProvinciaId, setSelectedProvinciaId] = useState<number | null>(
    address.localidad?.provincia?.id || null
  );
  const [selectedLocalidadId, setSelectedLocalidadId] = useState<number | null>(
    address.localidad?.id || null
  );

  // Efecto: Cargar todas las provincias al montar el componente
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Efecto: Cargar localidades cuando cambia la provincia seleccionada
  useEffect(() => {
    if (selectedProvinciaId) {
      fetchLocalitiesByProvinceId(selectedProvinciaId);
    } else {
      // Si no hay provincia seleccionada, limpiar las localidades
      useLocalityStore.setState({ provinceLocalities: [] });
    }
  }, [selectedProvinciaId, fetchLocalitiesByProvinceId]);

  // Sincronizar estados locales con la prop 'address' si cambia desde afuera
  useEffect(() => {
    setSelectedProvinciaId(address.localidad?.provincia?.id || null);
    setSelectedLocalidadId(address.localidad?.id || null);
  }, [address]);

  // Función genérica para manejar cambios en los inputs de texto/número de la dirección
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | null = value;

    if (name === "numero" || name === "cp") {
      const parsedValue = parseInt(value, 10);
      newValue = isNaN(parsedValue) ? 0 : parsedValue; // Asegurar que sea 0 o un número
    }
    // Para piso y departamento, si el input está vacío, queremos que sea null
    if ((name === "piso" || name === "departamento") && value.trim() === "") {
      newValue = null;
    }

    onAddressChange(index, { ...address, [name]: newValue });
  }, [address, index, onAddressChange]);

  // Manejar el cambio de provincia
  const handleProvinciaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    const newProvinciaId = isNaN(id) || id === 0 ? null : id; // Si es 0 o NaN, es null

    setSelectedProvinciaId(newProvinciaId);
    setSelectedLocalidadId(null); // Resetear localidad cuando la provincia cambia

    const selectedProvincia = provinces.find(p => p.id === newProvinciaId) || null;

    // Crear el objeto DomicilioDTO con la nueva provincia y una localidad vacía/nula
    const updatedAddress: DireccionDTO = {
      ...address,
      localidad: selectedProvincia ? {
        id: undefined, // Ahora esto es válido si LocalidadDTO.id es opcional
        nombre: '',
        provincia: selectedProvincia // Asigna el objeto ProvinciaDTO completo
      } : null // Si no se selecciona provincia, localidad es null
    };
    onAddressChange(index, updatedAddress);
  }, [address, index, onAddressChange, provinces]);

  // Manejar el cambio de localidad
  const handleLocalidadChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    const newLocalidadId = isNaN(id) || id === 0 ? null : id; // Si es 0 o NaN, es null

    setSelectedLocalidadId(newLocalidadId);

    const selectedLocalidad = provinceLocalities.find(l => l.id === newLocalidadId) || null;

    // Asegurarse de que 'localidad' y 'provincia' dentro de 'localidad' existan antes de actualizarlos
    // Reconstruimos el objeto localidad para asegurar la coherencia
    const updatedAddress: DireccionDTO = {
      ...address,
      localidad: selectedLocalidad ? {
        id: selectedLocalidad.id,
        nombre: selectedLocalidad.nombre,
        provincia: provinces.find(p => p.id === selectedProvinciaId) || undefined // Re-obtener la provincia completa
      } : null
    };
    onAddressChange(index, updatedAddress);
  }, [address, index, onAddressChange, provinceLocalities, selectedProvinciaId, provinces]);


  return (
    <div className={styles.addressBlock}>
      <h4>Dirección {index + 1}</h4>
      <InputField
        id={`calle-${index}`}
        label="Calle"
        type="text"
        value={address.calle || ''}
        onChange={handleInputChange}
        name="calle" // Esta prop 'name' ahora se pasa correctamente a InputField
      />
      <InputField
        id={`numero-${index}`}
        label="Número"
        type="number"
        value={address.numero?.toString() || '0'} // Asegurar string para input type="number"
        onChange={handleInputChange}
        name="numero" // Esta prop 'name' ahora se pasa correctamente a InputField
      />
      <InputField
        id={`piso-${index}`}
        label="Piso (opcional)"
        type="text"
        value={address.piso || ''}
        onChange={handleInputChange}
        name="piso" // Esta prop 'name' ahora se pasa correctamente a InputField
      />
      <InputField
        id={`departamento-${index}`}
        label="Departamento (opcional)"
        type="text"
        value={address.departamento || ''}
        onChange={handleInputChange}
        name="departamento" // Esta prop 'name' ahora se pasa correctamente a InputField
      />
      <InputField
        id={`cp-${index}`}
        label="Código Postal"
        type="number"
        value={address.cp?.toString() || '0'} // Asegurar string para input type="number"
        onChange={handleInputChange}
        name="cp" // Esta prop 'name' ahora se pasa correctamente a InputField
      />

      <div className={styles.formGroup}>
        <label htmlFor={`provincia-${index}`}>Provincia</label>
        <select
          id={`provincia-${index}`}
          className={styles.selectInput}
          value={selectedProvinciaId || ''}
          onChange={handleProvinciaChange}
          disabled={loadingProvinces}
        >
          <option value="">{loadingProvinces ? "Cargando Provincias..." : "Selecciona una Provincia"}</option>
          {provinces.map((provincia) => (
            <option key={provincia.id} value={provincia.id}>
              {provincia.nombre}
            </option>
          ))}
        </select>
        {errorProvinces && <p className={styles.errorText}>{errorProvinces}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`localidad-${index}`}>Localidad</label>
        <select
          id={`localidad-${index}`}
          className={styles.selectInput}
          value={selectedLocalidadId || ''}
          onChange={handleLocalidadChange}
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
        {errorProvince && <p className={styles.errorText}>{errorProvince}</p>}
      </div>

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
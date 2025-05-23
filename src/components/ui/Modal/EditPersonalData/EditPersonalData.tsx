import { FC, useState, useEffect } from "react";
import styles from "./EditPersonalData.module.css";

import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO"; // Asegúrate de que esta ruta sea correcta para tu UserDTO completo
import { DomicilioDTO } from "../../../dto/DomicilioDTO";
import { UserProfileUpdateDTO } from "../../../dto/UserProfileUpdateDTO";
import { AddressForm } from "../AddressForm/AddressForm"; // Asegúrate de que esta ruta sea correcta
import { Sexo } from "../../../../types/ISexo"; // Asegúrate de que esta ruta sea correcta

interface EditPersonalDataProps {
    closeEditPersonalData: () => void;
    user: UserDTO;
}

export const EditPersonalData: FC<EditPersonalDataProps> = ({ closeEditPersonalData, user }) => {

    // Estados para los datos personales, inicializados con los valores del usuario o cadenas vacías/null
    const [firstname, setFirstname] = useState(user.firstname || '');
    const [lastname, setLastname] = useState(user.lastname || '');
    // DNI como string para el input, convierte number o null a string vacío
    const [dni, setDni] = useState(user.dni?.toString() || ''); 

    // Estado 'sexo': puede ser Sexo, una cadena vacía (para no seleccionado) o null
    const [sexo, setSexo] = useState<Sexo | '' | null>(user.sexo || '');

    const [telefono, setTelefono] = useState(user.telefono || '');

    // Estados para la fecha de nacimiento (dd-mm-yyyy)
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    // Estado para las direcciones (array de DomicilioDTO)
    // Se copia el array de direcciones para que las modificaciones en el formulario no afecten el user original directamente
    const [addresses, setAddresses] = useState<DomicilioDTO[]>(user.addresses ? [...user.addresses] : []);

    // Estados para la imagen de perfil
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user.profileImage?.url || "/images/default-profile.png");

    const { updateUser, updateUserImage, loadingUser } = useAuthStore();

    // Efecto para inicializar la fecha de nacimiento y la imagen al montar o si el usuario prop cambia
    useEffect(() => {
        console.log("useEffect: user data changed or component mounted", user);
        if (user.fechaNacimiento) {
            const dateParts = user.fechaNacimiento.split('-'); // Asume formato 'YYYY-MM-DD'
            if (dateParts.length === 3) {
                setYear(dateParts[0]);
                setMonth(dateParts[1]);
                setDay(dateParts[2]);
                console.log(`useEffect: Fecha Nacimiento Seteada: ${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            }
        } else {
            setDay('');
            setMonth('');
            setYear('');
            console.log("useEffect: Fecha Nacimiento NO presente en user.");
        }
        if (user.profileImage?.url) {
            setPreviewImage(user.profileImage.url);
            console.log("useEffect: Imagen de perfil seteada desde user.profileImage.url:", user.profileImage.url);
        } else {
            setPreviewImage("/images/default-profile.png"); // Asegúrate de que esta ruta sea correcta para tu placeholder
            console.log("useEffect: No hay imagen de perfil, usando placeholder.");
        }
        // También inicializa el estado de las direcciones si el user cambia
        setAddresses(user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : []); // Asegura una copia profunda para evitar mutaciones
        console.log("useEffect: Direcciones inicializadas:", user.addresses);

        // Actualiza el estado de sexo directamente desde user.sexo
        setSexo(user.sexo || ''); // Usa user.sexo si existe, de lo contrario una cadena vacía.
        // Asegúrate de que user.dni se convierta a string para el input
        setDni(user.dni?.toString() || '');
    }, [user]);

    // Manejo de la imagen de perfil
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
            console.log("handleImageChange: Nueva imagen seleccionada y previsualizada.", file.name);
        } else {
            setSelectedImage(null);
            setPreviewImage(user.profileImage?.url || "/images/default-profile.png"); // Vuelve al original o placeholder
            console.log("handleImageChange: No se seleccionó archivo o se canceló, volviendo a la imagen original/placeholder.");
        }
    };

    // --- Funciones para manejar direcciones ---
    const handleAddressChange = (index: number, updatedAddress: DomicilioDTO) => {
        const newAddresses = addresses.map((addr, i) =>
            i === index ? updatedAddress : addr
        );
        setAddresses(newAddresses);
        console.log(`handleAddressChange: Dirección en índice ${index} actualizada.`, updatedAddress);
    };

    const handleAddAddress = () => {
        const newAddress: DomicilioDTO = {
            calle: '',
            numero: 0,
            cp: 0,
            piso: null,
            departamento: null,
            localidad: null // Inicializa localidad como null
        };
        setAddresses([...addresses, newAddress]);
        console.log("handleAddAddress: Nueva dirección añadida.", newAddress);
    };

    const handleRemoveAddress = (index: number) => {
        const newAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(newAddresses);
        console.log(`handleRemoveAddress: Dirección en índice ${index} eliminada.`);
    };

    // --- Función para guardar todos los cambios ---
    const handleSave = async () => {
        console.log("handleSave se ha ejecutado!");
        try {
            let fullFechaNacimiento: string | null = null;

            // Lógica para calcular fullFechaNacimiento
            if (day.trim() || month.trim() || year.trim()) {
                const numDay = parseInt(day.trim(), 10);
                const numMonth = parseInt(month.trim(), 10);
                const numYear = parseInt(year.trim(), 10);

                console.log(`DEBUG FECHA: parsedDay=${numDay}, parsedMonth=${numMonth}, parsedYear=${numYear}`);

                if (isNaN(numDay) || isNaN(numMonth) || isNaN(numYear) ||
                    numDay < 1 || numDay > 31 ||
                    numMonth < 1 || numMonth > 12 ||
                    numYear < 1900 || numYear > new Date().getFullYear()) {
                    toast.error("Fecha de nacimiento inválida. Por favor, ingrese números válidos para día, mes y año.");
                    console.log("VALIDACION FECHA: Campos no numéricos o fuera de rango. Retornando.");
                    return;
                }

                const date = new Date(numYear, numMonth - 1, numDay);

                if (date.getFullYear() === numYear &&
                    date.getMonth() === (numMonth - 1) &&
                    date.getDate() === numDay) {
                    const formattedMonth = numMonth.toString().padStart(2, '0');
                    const formattedDay = numDay.toString().padStart(2, '0');
                    fullFechaNacimiento = `${numYear}-${formattedMonth}-${formattedDay}`;
                    console.log("VALIDACION FECHA: Fecha de nacimiento procesada y válida:", fullFechaNacimiento);
                } else {
                    toast.error("Fecha de nacimiento inválida. La fecha ingresada no existe (ej. 31 de febrero).");
                    console.log("VALIDACION FECHA: La fecha ingresada no es válida (ej. 31 de febrero). Retornando.");
                    return;
                }
            } else {
                console.log("VALIDACION FECHA: Todos los campos de fecha están vacíos. Se enviará como null.");
            }

            // --- INICIO DE LA SECCIÓN CRÍTICA DE CAMBIOS ---

            // Inicializa finalUpdateData con los valores originales del usuario.
            // Esto asegura que si un campo no se modifica, su valor original se conserve.
            // Se usa un operador spread condicional para incluir la propiedad solo si tiene un valor no nulo/indefinido en 'user'.
            // Para 'addresses', se hace una copia profunda para asegurar que no se muten los datos originales si no hay cambios detectados.
            const finalUpdateData: UserProfileUpdateDTO = {
                ...(user.firstname && { firstname: user.firstname }),
                ...(user.lastname && { lastname: user.lastname }),
                ...(user.dni !== undefined && user.dni !== null && { dni: user.dni }),
                ...(user.sexo && { sexo: user.sexo }),
                ...(user.fechaNacimiento && { fechaNacimiento: user.fechaNacimiento }),
                ...(user.telefono && { telefono: user.telefono }),
                addresses: user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : [],
            };


            // --- Lógica para DETECTAR y APLICAR CAMBIOS a finalUpdateData ---

            // Nombre
            if (firstname.trim() !== (user.firstname || '')) {
                finalUpdateData.firstname = firstname.trim();
                console.log("CAMBIO detectado: firstname de", user.firstname, "a", finalUpdateData.firstname);
            } else if (!user.firstname && finalUpdateData.firstname !== undefined) {
                 delete finalUpdateData.firstname;
            }


            // Apellido
            if (lastname.trim() !== (user.lastname || '')) {
                finalUpdateData.lastname = lastname.trim();
                console.log("CAMBIO detectado: lastname de", user.lastname, "a", finalUpdateData.lastname);
            } else if (!user.lastname && finalUpdateData.lastname !== undefined) {
                delete finalUpdateData.lastname;
            }

            // DNI
            const currentDniAsString = dni.trim();
            const originalDniAsString = user.dni?.toString() || '';

            if (currentDniAsString !== originalDniAsString) {
                if (currentDniAsString === '') {
                    finalUpdateData.dni = null; // Si se vacía el campo, enviar null
                    console.log("CAMBIO detectado: dni a null (se vació el campo)");
                } else if (!isNaN(Number(currentDniAsString))) {
                    finalUpdateData.dni = Number(currentDniAsString);
                    console.log("CAMBIO detectado: dni de", user.dni, "a", finalUpdateData.dni);
                } else {
                    toast.error("DNI inválido. Debe ser un número o estar vacío.");
                    console.log("VALIDACION DNI: DNI inválido detectado. Retornando.");
                    return;
                }
            } else if ((user.dni === null || user.dni === undefined) && finalUpdateData.dni !== undefined) {
                // Si no hay cambio, y el DNI original era null o undefined, elimina la propiedad
                delete finalUpdateData.dni;
                console.log("NO CAMBIO: dni es idéntico y originalmente null/undefined.");
            } else {
                 console.log("NO CAMBIO: dni es idéntico y tenía valor.");
            }


            // Sexo
            const currentSexoValue = sexo === '' ? null : sexo;
            const originalSexoValue = user.sexo === undefined ? null : user.sexo;

            if (currentSexoValue !== originalSexoValue) {
                finalUpdateData.sexo = currentSexoValue;
                console.log("CAMBIO detectado: sexo de", originalSexoValue, "a", currentSexoValue);
            } else if ((user.sexo === null || user.sexo === undefined) && finalUpdateData.sexo !== undefined) {
                // Si no hay cambio, y el sexo original era null o undefined, elimina la propiedad
                delete finalUpdateData.sexo;
                console.log("NO CAMBIO: sexo es idéntico y originalmente null/undefined.");
            } else {
                console.log("NO CAMBIO: sexo es idéntico y tenía valor.");
            }

            // Fecha de Nacimiento
            const originalFechaNacimiento = user.fechaNacimiento || null;
            const currentFechaNacimiento = fullFechaNacimiento;

            if (currentFechaNacimiento !== originalFechaNacimiento) {
                finalUpdateData.fechaNacimiento = currentFechaNacimiento;
                console.log("CAMBIO detectado: fechaNacimiento de", originalFechaNacimiento, "a", finalUpdateData.fechaNacimiento);
            } else if ((user.fechaNacimiento === null || user.fechaNacimiento === undefined) && finalUpdateData.fechaNacimiento !== undefined) {
                // Si no hay cambio, y la fecha original era null o undefined, elimina la propiedad
                delete finalUpdateData.fechaNacimiento;
                console.log("NO CAMBIO: fechaNacimiento es idéntico y originalmente null/undefined.");
            } else {
                console.log("NO CAMBIO: fechaNacimiento es idéntico y tenía valor.");
            }

            // Teléfono
            if (telefono.trim() !== (user.telefono || '')) {
                finalUpdateData.telefono = telefono.trim();
                console.log("CAMBIO detectado: telefono de", user.telefono, "a", finalUpdateData.telefono);
            } else if (!user.telefono && finalUpdateData.telefono !== undefined) {
                delete finalUpdateData.telefono;
            }

            // Direcciones
            if (JSON.stringify(addresses) !== JSON.stringify(user.addresses || [])) {
                console.log("CAMBIO detectado: addresses.");
                // Filtra direcciones vacías o incompletas si es necesario antes de enviar
                const validAddresses = addresses.filter(addr =>
                    addr.calle.trim() !== '' &&
                    addr.numero > 0 &&
                    addr.cp > 0 &&
                    (addr.localidad?.id !== 0 && addr.localidad?.nombre.trim() !== '') &&
                    (addr.localidad?.provincia?.id !== 0 && addr.localidad?.provincia?.nombre.trim() !== '')
                );
                finalUpdateData.addresses = validAddresses;
                console.log("CAMBIO: addresses finales a enviar:", validAddresses);
            } else {
                // Si no hay cambio en las direcciones, y el usuario original no tenía ninguna,
                // asegura que la propiedad 'addresses' no se envíe en el DTO si no es necesario.
                // Si tu backend espera un array vacío explícitamente para "borrar todas", esto no aplicaría.
                if (!user.addresses || user.addresses.length === 0) {
                     delete finalUpdateData.addresses;
                     console.log("NO CAMBIO: addresses es idéntico y originalmente vacío/null.");
                } else {
                    console.log("NO CAMBIO: addresses es idéntico y tenía valores.");
                }
            }
            // --- FIN DE LA SECCIÓN CRÍTICA DE CAMBIOS ---


            console.log("Datos a enviar (finalUpdateData):", finalUpdateData);

            // Si no hay cambios en los datos personales (después de posibles `delete finalUpdateData.propiedad`) Y no se seleccionó una nueva imagen
            if (Object.keys(finalUpdateData).length === 0 && !selectedImage) {
                toast.info("No hay cambios para guardar.");
                console.log("INFO: No hay cambios para guardar. Cerrando modal.");
                closeEditPersonalData();
                return;
            }

            // Realizar la actualización del perfil si hay cambios en los datos personales
            if (Object.keys(finalUpdateData).length > 0) {
                console.log("Iniciando llamada a updateUser con datos:", finalUpdateData);
                await updateUser(finalUpdateData);
                console.log("updateUser completado exitosamente.");
            } else {
                console.log("No hay cambios en datos personales para enviar a updateUser.");
            }

            // Subir la imagen si se seleccionó una nueva
            if (selectedImage) {
                console.log("Iniciando llamada a updateUserImage con imagen:", selectedImage.name);
                await updateUserImage(selectedImage);
                console.log("updateUserImage completado exitosamente.");
            } else {
                console.log("No se seleccionó ninguna imagen nueva para subir.");
            }

            toast.success("Perfil actualizado exitosamente.");
            console.log("EXITO: Perfil actualizado exitosamente. Cerrando modal.");
            closeEditPersonalData();
        } catch (error: any) {
            console.error("Error al guardar los datos personales (CATCH BLOCK):", error);
            const errorMessage = error.response?.data?.message || error.message || "Error desconocido al actualizar el perfil.";
            toast.error(errorMessage);
            console.log("ERROR: Mensaje de error mostrado en toast:", errorMessage);
        }
    };

    return (
        <>
            {/* El background y el modal ahora están centrados con position: fixed y transform */}
            <div className={styles.background} onClick={closeEditPersonalData}></div>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Editar Datos Personales</h2>

                <div className={styles.profileImageSection}>
                    <img
                        src={previewImage || "/images/default-profile.png"} // Asegúrate de que esta ruta sea correcta para tu placeholder
                        alt="Previsualización de perfil"
                        className={styles.profileImagePreview}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                        id="profileImageUpload"
                    />
                    <label htmlFor="profileImageUpload" className={styles.uploadButton}>
                        Cambiar Imagen
                    </label>
                </div>

                {/* Campos de datos personales */}
                <input
                    type="text"
                    placeholder="Nombre"
                    className={styles.inputText}
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    className={styles.inputText}
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="DNI"
                    className={styles.inputText}
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Teléfono"
                    className={styles.inputText}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />

                {/* Fecha de Nacimiento */}
                <fieldset className={styles.dobSection}>
                    <legend className={styles.dobLegend}>FECHA DE NACIMIENTO</legend>
                    <div className={styles.dobInputs}>
                        <input
                            type="number"
                            placeholder="dd"
                            className={styles.dobInput}
                            value={day}
                            onChange={(e) => {
                                setDay(e.target.value.trim());
                                console.log("Input Día cambiado a:", e.target.value.trim());
                            }}
                            min="1"
                            max="31"
                        />
                        <input
                            type="number"
                            placeholder="mm"
                            className={styles.dobInput}
                            value={month}
                            onChange={(e) => {
                                setMonth(e.target.value.trim());
                                console.log("Input Mes cambiado a:", e.target.value.trim());
                            }}
                            min="1"
                            max="12"
                        />
                        <input
                            type="number"
                            placeholder="yyyy"
                            className={styles.dobInput}
                            value={year}
                            onChange={(e) => {
                                setYear(e.target.value.trim());
                                console.log("Input Año cambiado a:", e.target.value.trim());
                            }}
                            min="1900"
                            max={new Date().getFullYear().toString()}
                        />
                    </div>
                </fieldset>

                {/* Sexo */}
                <fieldset className={styles.genderSection}>
                    <legend className={styles.genderLegend}>Sexo</legend>
                    <label className={styles.genderOption}>
                        <input
                            type="radio"
                            name="sexo"
                            value={Sexo.MASCULINO}
                            checked={sexo === Sexo.MASCULINO}
                            onChange={(e) => setSexo(e.target.value as Sexo)}
                        /> Hombre
                    </label>
                    <label className={styles.genderOption}>
                        <input
                            type="radio"
                            name="sexo"
                            value={Sexo.FEMENINO}
                            checked={sexo === Sexo.FEMENINO}
                            onChange={(e) => setSexo(e.target.value as Sexo)}
                        /> Mujer
                    </label>
                    <label className={styles.genderOption}>
                        <input
                            type="radio"
                            name="sexo"
                            value={Sexo.OTRO}
                            checked={sexo === Sexo.OTRO}
                            onChange={(e) => setSexo(e.target.value as Sexo)}
                        /> Otros
                    </label>
                    <label className={styles.genderOption}>
                        <input
                            type="radio"
                            name="sexo"
                            value={Sexo.UNISEX}
                            checked={sexo === Sexo.UNISEX}
                            onChange={(e) => setSexo(e.target.value as Sexo)}
                        /> Unisex
                    </label>
                    <label className={styles.genderOption}>
                        <input
                            type="radio"
                            name="sexo"
                            value={Sexo.UNISEX_CHILD}
                            checked={sexo === Sexo.UNISEX_CHILD}
                            onChange={(e) => setSexo(e.target.value as Sexo)}
                        /> Unisex Niño
                    </label>
                </fieldset>

                {/* Sección de Direcciones */}
                <h3 className={styles.subTitle}>Direcciones</h3>
                {addresses.map((address, index) => (
                    <AddressForm
                        key={address.id || `new-address-${index}`} // Usar ID si existe, o un id temporal
                        address={address}
                        index={index}
                        onAddressChange={handleAddressChange}
                        onRemoveAddress={handleRemoveAddress}
                        showRemoveButton={addresses.length > 1 || address.id !== undefined} // Mostrar si hay más de una o si ya existe
                    />
                ))}
                <button type="button" onClick={handleAddAddress} className={styles.addAddressBtn}>
                    Añadir Nueva Dirección
                </button>

                {/* Botones de acción */}
                <div className={styles.buttons}>
                    <button className={styles.cancelBtn} onClick={closeEditPersonalData} disabled={loadingUser}>Cancelar</button>
                    <button className={styles.acceptBtn} onClick={handleSave} disabled={loadingUser}>
                        {loadingUser ? 'Guardando...' : 'Aceptar'}
                    </button>
                </div>
            </div>
        </>
    );
};
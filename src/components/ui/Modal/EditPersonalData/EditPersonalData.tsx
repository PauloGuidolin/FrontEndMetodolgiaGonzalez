import { FC, useState, useEffect } from "react";
import styles from "./EditPersonalData.module.css";

import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO";
import { DomicilioDTO } from "../../../dto/DomicilioDTO";
import { UserProfileUpdateDTO } from "../../../dto/UserProfileUpdateDTO";
import { AddressForm } from "../AddressForm/AddressForm"; // Asegúrate de que esta ruta sea correcta
import { Sexo } from "../../../../types/ISexo";



interface EditPersonalDataProps {
    closeEditPersonalData: () => void;
    user: UserDTO;
}

export const EditPersonalData: FC<EditPersonalDataProps> = ({ closeEditPersonalData, user }) => {

    // Estados para los datos personales
    const [firstname, setFirstname] = useState(user.firstname || '');
    const [lastname, setLastname] = useState(user.lastname || '');
    const [dni, setDni] = useState(user.dni?.toString() || ''); // DNI como string para el input
    
    // CORRECCIÓN CLAVE: Permite que el estado 'sexo' sea Sexo, una cadena vacía O null.
    // Esto coincide con el tipo `Sexo | null | undefined` que puede venir de `user.sexo`.
    const [sexo, setSexo] = useState<Sexo | '' | null>(user.sexo || '');

    const [telefono, setTelefono] = useState(user.telefono || '');

    // Estados para la fecha de nacimiento (dd-mm-yyyy)
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    // Estado para las direcciones (array de DomicilioDTO)
    const [addresses, setAddresses] = useState<DomicilioDTO[]>(user.addresses || []);

    // Estados para la imagen de perfil
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user.profileImage?.url || "/images/default-profile.png");

    const { updateUser, updateUserImage, loadingUser } = useAuthStore();

    // Efecto para cargar la fecha de nacimiento y la imagen inicial al montar o si el usuario cambia
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
        setAddresses(user.addresses || []);
        console.log("useEffect: Direcciones inicializadas:", user.addresses);

        // Actualiza el estado de sexo directamente desde user.sexo
        setSexo(user.sexo || ''); // Usa user.sexo si existe, de lo contrario una cadena vacía.

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
            piso: undefined,
            departamento: undefined,
            cp: 0,
            localidadNombre: '',
            provinciaNombre: ''
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
        console.log("handleSave se ha ejecutado!"); // DEBUG: Punto de entrada
        try {
            let fullFechaNacimiento: string | undefined = undefined;

            // Solo procede si los 3 campos de fecha tienen algún valor
            if (day || month || year) { // Si alguno de los campos tiene valor, se intenta validar
                const numDay = parseInt(day.trim(), 10);
                const numMonth = parseInt(month.trim(), 10);
                const numYear = parseInt(year.trim(), 10);

                console.log(`DEBUG FECHA: parsedDay=${numDay}, parsedMonth=${numMonth}, parsedYear=${numYear}`); // DEBUG: Valores parseados

                // Verifica que sean números válidos y estén dentro de rangos razonables
                if (isNaN(numDay) || isNaN(numMonth) || isNaN(numYear) ||
                    numDay < 1 || numDay > 31 ||
                    numMonth < 1 || numMonth > 12 ||
                    numYear < 1900 || numYear > new Date().getFullYear()) {
                    toast.error("Fecha de nacimiento inválida. Por favor, ingrese números válidos para día, mes y año.");
                    console.log("VALIDACION FECHA: Campos no numéricos o fuera de rango. Retornando.");
                    return;
                }

                // Crea un objeto Date. JavaScript es flexible con el mes (0-11)
                const date = new Date(numYear, numMonth - 1, numDay);

                // Validación estricta para asegurar que Date() no "ajustó" la fecha (ej. 31 de Febrero)
                if (date.getFullYear() === numYear &&
                    date.getMonth() === (numMonth - 1) &&
                    date.getDate() === numDay) {
                    // Formatea para el backend (YYYY-MM-DD)
                    const formattedMonth = numMonth.toString().padStart(2, '0');
                    const formattedDay = numDay.toString().padStart(2, '0');
                    fullFechaNacimiento = `${numYear}-${formattedMonth}-${formattedDay}`;
                    console.log("VALIDACION FECHA: Fecha de nacimiento procesada y válida:", fullFechaNacimiento);
                } else {
                    toast.error("Fecha de nacimiento inválida. La fecha ingresada no existe (ej. 31 de febrero).");
                    console.log("VALIDACION FECHA: La fecha ingresada no es válida (ej. 31 de febrero). Retornando.");
                    return;
                }
            } else if (!day && !month && !year) {
                // Si todos los campos están vacíos, significa que el usuario no quiere establecer la fecha
                // o que la está borrando. En este caso, fullFechaNacimiento permanece undefined/null.
                fullFechaNacimiento = undefined; // O null, según lo que espere tu backend para "no fecha"
                console.log("VALIDACION FECHA: Todos los campos de fecha están vacíos. Se enviará como undefined.");
            } else {
                // Si algunos campos de fecha están llenos y otros no
                toast.error("Fecha de nacimiento incompleta. Por favor, complete los tres campos (día, mes, año) o déjelos todos vacíos.");
                console.log("VALIDACION FECHA: Campos de fecha incompletos. Retornando.");
                return;
            }

            const finalUpdateData: UserProfileUpdateDTO = {};

            // Compara cada campo y añade solo si ha cambiado
            if (firstname !== user.firstname) {
                finalUpdateData.firstname = firstname;
                console.log("CAMBIO detectado: firstname de", user.firstname, "a", firstname);
            }
            if (lastname !== user.lastname) {
                finalUpdateData.lastname = lastname;
                console.log("CAMBIO detectado: lastname de", user.lastname, "a", lastname);
            }
            // DNI: considera si el valor es numérico y si ha cambiado.
            // Si el input está vacío ('') y el user.dni existía, lo convierte a null.
            if (dni !== user.dni?.toString()) { // Compara como string para el input
                if (dni === '') {
                    finalUpdateData.dni = null;
                    console.log("CAMBIO detectado: dni a null (se vació el campo)");
                } else if (!isNaN(Number(dni)) && dni.trim() !== '') {
                    finalUpdateData.dni = Number(dni);
                    console.log("CAMBIO detectado: dni de", user.dni, "a", Number(dni));
                } else {
                    toast.error("DNI inválido. Debe ser un número o estar vacío.");
                    console.log("VALIDACION DNI: DNI inválido detectado. Retornando.");
                    return;
                }
            }

            // Compara el valor actual de 'sexo' con el valor original de 'user.sexo'
            // Ambos son ya del tipo Sexo (o undefined/null/vacío)
            if (sexo !== user.sexo) {
                // Si el sexo es una cadena vacía, se envía como null al backend. De lo contrario, se envía el valor de Sexo.
                finalUpdateData.sexo = sexo === '' ? null : sexo;
                console.log("CAMBIO detectado: sexo de", user.sexo, "a", sexo);
            }
            // Solo actualiza fechaNacimiento si el valor calculado es diferente al original del usuario
            if (fullFechaNacimiento !== user.fechaNacimiento) {
                finalUpdateData.fechaNacimiento = fullFechaNacimiento;
                console.log("CAMBIO detectado: fechaNacimiento de", user.fechaNacimiento, "a", fullFechaNacimiento);
            }
            if (telefono !== user.telefono) {
                finalUpdateData.telefono = telefono;
                console.log("CAMBIO detectado: telefono de", user.telefono, "a", telefono);
            }

            // Compara y añade las direcciones si han cambiado
            if (JSON.stringify(addresses) !== JSON.stringify(user.addresses)) {
                console.log("CAMBIO detectado: addresses.");
                // Filtra direcciones vacías (ej. si el usuario añade una y no la completa)
                const validAddresses = addresses.filter(addr =>
                    addr.calle && addr.numero !== 0 && addr.localidadNombre && addr.provinciaNombre && addr.cp !== 0
                );
                finalUpdateData.addresses = validAddresses;
                console.log("CAMBIO: addresses finales a enviar:", validAddresses);
            } else {
                console.log("NO CAMBIO detectado: addresses. JSON.stringify es idéntico.");
            }

            console.log("Datos a enviar (finalUpdateData):", finalUpdateData); // DEBUG: Muestra el objeto que se intentará enviar

            // Si no hay cambios en los datos personales Y no se seleccionó una nueva imagen
            if (Object.keys(finalUpdateData).length === 0 && !selectedImage) {
                toast.info("No hay cambios para guardar.");
                console.log("INFO: No hay cambios para guardar. Cerrando modal.");
                closeEditPersonalData();
                return; // Sal de la función
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
            console.error("Error al guardar los datos personales (CATCH BLOCK):", error); // DEBUG: Aquí se captura el error
            // Intenta extraer el mensaje de error de la respuesta del backend
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
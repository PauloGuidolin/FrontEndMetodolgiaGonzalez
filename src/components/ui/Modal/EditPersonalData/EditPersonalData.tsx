import { FC, useState, useEffect } from "react";
import styles from "./EditPersonalData.module.css";

import { useAuthStore } from "../../../../store/authStore";
import { toast } from "react-toastify";
import { UserDTO } from "../../../dto/UserDTO"; // Asegúrate de que la ruta sea correcta
import { DomicilioDTO } from "../../../dto/DomicilioDTO"; // Asegúrate de que la ruta sea correcta
import { UserProfileUpdateDTO } from "../../../dto/UserProfileUpdateDTO"; // Asegúrate de que la ruta sea correcta
import { AddressForm } from "../AddressForm/AddressForm"; // Asegúrate de que la ruta sea correcta
import { Sexo } from "../../../../types/ISexo"; // Asegúrate de que la ruta sea correcta

interface EditPersonalDataProps {
    closeEditPersonalData: () => void;
    user: UserDTO;
}

export const EditPersonalData: FC<EditPersonalDataProps> = ({ closeEditPersonalData, user }) => {

    // Inicialización de estados con los valores actuales del usuario
    const [firstname, setFirstname] = useState(user.firstname || '');
    const [lastname, setLastname] = useState(user.lastname || '');
    // DNI y Teléfono deben inicializarse como string si el input es de texto,
    // o el DNI como string si el input es de tipo number pero lo manejas como string.
    const [dni, setDni] = useState(user.dni?.toString() || ''); 
    const [sexo, setSexo] = useState<Sexo | '' | null>(user.sexo || ''); // Sexo puede ser Sexo, '', o null
    const [telefono, setTelefono] = useState(user.telefono || '');

    // Para la fecha de nacimiento (dd-mm-yyyy)
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    // Se hace una copia profunda para que las modificaciones en el modal no afecten el objeto 'user' original
    // hasta que se guarde.
    const [addresses, setAddresses] = useState<DomicilioDTO[]>(user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : []);

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(user.imagenUser?.url || "/images/default-profile.png");

    const { updateUser, updateUserImage, loadingUser } = useAuthStore();

    // Este efecto se ejecuta cada vez que el prop 'user' cambia,
    // asegurando que los estados del formulario se re-inicialicen con los datos más recientes.
    useEffect(() => {
        console.log("useEffect: user data changed or component mounted", user);
        setFirstname(user.firstname || '');
        setLastname(user.lastname || '');
        setDni(user.dni?.toString() || '');
        setSexo(user.sexo || '');
        setTelefono(user.telefono || '');

        if (user.fechaNacimiento) {
            const dateParts = user.fechaNacimiento.split('-'); // Asume formato 'YYYY-MM-DD'
            if (dateParts.length === 3) {
                setYear(dateParts[0]);
                setMonth(dateParts[1]);
                setDay(dateParts[2]);
                console.log(`useEffect: Fecha Nacimiento Seteada: ${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            } else {
                console.warn("useEffect: Formato de fecha de nacimiento inesperado en user.fechaNacimiento:", user.fechaNacimiento);
                setDay('');
                setMonth('');
                setYear('');
            }
        } else {
            setDay('');
            setMonth('');
            setYear('');
            console.log("useEffect: Fecha Nacimiento NO presente en user.");
        }
        
        if (user.imagenUser?.url) {
            setPreviewImage(user.imagenUser.url);
            console.log("useEffect: Imagen de perfil seteada desde user.imagenUser.url:", user.imagenUser.url);
        } else {
            setPreviewImage("/images/default-profile.png"); 
            console.log("useEffect: No hay imagen de perfil, usando placeholder.");
        }
        
        setAddresses(user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : []);

    }, [user]); // Dependencia clave del efecto

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
            console.log("handleImageChange: Nueva imagen seleccionada y previsualizada.", file.name);
        } else {
            setSelectedImage(null);
            setPreviewImage(user.imagenUser?.url || "/images/default-profile.png");
            console.log("handleImageChange: No se seleccionó archivo o se canceló, volviendo a la imagen original/placeholder.");
        }
    };

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
            localidad: null
        };
        setAddresses([...addresses, newAddress]);
        console.log("handleAddAddress: Nueva dirección añadida.", newAddress);
    };

    const handleRemoveAddress = (index: number) => {
        const newAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(newAddresses);
        console.log(`handleRemoveAddress: Dirección en índice ${index} eliminada.`);
    };

    const handleSave = async () => {
        console.log("handleSave se ha ejecutado!");
        try {
            let fullFechaNacimiento: string | null = null;

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
                fullFechaNacimiento = null; // Asegurarse de que si todos están vacíos, se envía null
            }

            // --- CONSTRUCCIÓN DEL DTO DE ACTUALIZACIÓN COMPLETO ---
            // Este objeto incluirá todos los campos del usuario, sobrescribiendo los que se modificaron
            const updatedUserData: UserProfileUpdateDTO = {
                id: user.id, // ID del usuario, crucial para la actualización
                username: user.username, // Mantener el username original
                email: user.email,     // Mantener el email original
                role: user.role,       // Mantener el rol original
                imagenUser: user.imagenUser || null, // Mantener la imagen original (si no se sube una nueva)

                // Campos modificables desde el formulario
                firstname: firstname.trim() === '' ? null : firstname.trim(),
                lastname: lastname.trim() === '' ? null : lastname.trim(),
                dni: dni.trim() === '' ? null : Number(dni.trim()),
                sexo: sexo === '' ? null : sexo,
                fechaNacimiento: fullFechaNacimiento,
                telefono: telefono.trim() === '' ? null : telefono.trim(),
                
                // Filtra direcciones para asegurarse de que sean válidas antes de enviar
                addresses: addresses.filter(addr =>
                    addr.calle.trim() !== '' &&
                    (addr.numero === undefined || addr.numero === null || addr.numero >= 0) && // Permite 0 para numero
                    (addr.cp === undefined || addr.cp === null || addr.cp >= 0) && // Permite 0 para CP
                    !!addr.localidad?.id // Asegura que la localidad tenga ID
                ) || null // Asegura que sea un array o null
            };

            console.log("Datos a enviar a updateUser (objeto completo):", updatedUserData);
            
            // Envía los datos actualizados al store
            await updateUser(updatedUserData);
            console.log("updateUser completado exitosamente.");
            
            // Si hay una nueva imagen seleccionada, subirla por separado
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
            <div className={styles.background} onClick={closeEditPersonalData}></div>
            <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Editar Datos Personales</h2>

                <div className={styles.profileImageSection}>
                    <img
                        src={previewImage || "/images/default-profile.png"}
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

                <input
                    type="text"
                    placeholder="Nombre"
                    className={styles.inputText}
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                />
                <input
                    type="text" // Cambiado a 'text' para permitir el string vacío antes de Number()
                    placeholder="Apellido"
                    className={styles.inputText}
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                />
                <input
                    type="text" // Usar 'text' para DNI y validar números si es necesario
                    placeholder="DNI"
                    className={styles.inputText}
                    value={dni}
                    onChange={(e) => {
                        // Opcional: Validación en tiempo real para DNI (solo números)
                        const re = /^[0-9\b]+$/;
                        if (e.target.value === '' || re.test(e.target.value)) {
                            setDni(e.target.value);
                        }
                    }}
                    inputMode="numeric" // Sugerir teclado numérico en móviles
                    pattern="[0-9]*" // Patrón HTML5 para validación
                />
                <input
                    type="text"
                    placeholder="Teléfono"
                    className={styles.inputText}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />

                <fieldset className={styles.dobSection}>
                    <legend className={styles.dobLegend}>FECHA DE NACIMIENTO</legend>
                    <div className={styles.dobInputs}>
                        <input
                            type="number"
                            placeholder="dd"
                            className={styles.dobInput}
                            value={day}
                            onChange={(e) => { setDay(e.target.value.trim()); }}
                            min="1"
                            max="31"
                        />
                        <input
                            type="number"
                            placeholder="mm"
                            className={styles.dobInput}
                            value={month}
                            onChange={(e) => { setMonth(e.target.value.trim()); }}
                            min="1"
                            max="12"
                        />
                        <input
                            type="number"
                            placeholder="yyyy"
                            className={styles.dobInput}
                            value={year}
                            onChange={(e) => { setYear(e.target.value.trim()); }}
                            min="1900"
                            max={new Date().getFullYear().toString()}
                        />
                    </div>
                </fieldset>

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

                <h3 className={styles.subTitle}>Direcciones</h3>
                {addresses.map((address, index) => (
                    <AddressForm
                        key={address.id || `new-address-${index}`}
                        address={address}
                        index={index}
                        onAddressChange={handleAddressChange}
                        onRemoveAddress={handleRemoveAddress}
                        showRemoveButton={addresses.length > 1 || address.id !== undefined}
                    />
                ))}
                <button type="button" onClick={handleAddAddress} className={styles.addAddressBtn}>
                    Añadir Nueva Dirección
                </button>

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
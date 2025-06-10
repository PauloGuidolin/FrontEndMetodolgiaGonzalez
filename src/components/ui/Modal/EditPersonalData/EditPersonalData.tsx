import { FC, useState, useEffect } from "react";
import styles from "./EditPersonalData.module.css"; // Importa los estilos CSS específicos para este componente.

import { useAuthStore } from "../../../../store/authStore"; // Importa el hook del store de autenticación (Zustand, etc.).
import { toast } from "react-toastify"; // Para mostrar notificaciones toast.
import { UserDTO } from "../../../dto/UserDTO"; // Define la estructura del objeto de usuario.
import { DireccionDTO } from "../../../dto/DireccionDTO"; // Define la estructura del objeto de dirección.
import { UserProfileUpdateDTO } from "../../../dto/UserProfileUpdateDTO"; // Define la estructura del payload para la actualización del perfil.
import { AddressForm } from "../AddressForm/AddressForm"; // Componente para editar/añadir una dirección.
import { Sexo } from "../../../../types/ISexo"; // Define un tipo enumerado para el sexo.

/**
 * Define las propiedades (props) que el componente `EditPersonalData` espera recibir.
 */
interface EditPersonalDataProps {
  isOpen: boolean; // Indica si el modal debe estar visible (true) u oculto (false).
  onClose: () => void; // Función callback para cerrar el modal.
  user: UserDTO; // Objeto `UserDTO` con los datos actuales del usuario a editar.
}

/**
 * `EditPersonalData` es un componente funcional de React que actúa como un modal
 * para la edición de los datos personales de un usuario, incluyendo nombre, apellido, DNI,
 * sexo, teléfono, fecha de nacimiento, direcciones e imagen de perfil.
 *
 * @param {EditPersonalDataProps} { isOpen, onClose, user } Las propiedades del componente.
 * @returns {JSX.Element | null} Un elemento de modal React si `isOpen` es true, de lo contrario `null`.
 */
export const EditPersonalData: FC<EditPersonalDataProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Si `isOpen` es `false`, el componente no renderiza nada, ocultando el modal.
  if (!isOpen) {
    return null;
  }

  // **Estados locales para los campos del formulario, inicializados con los datos del usuario.**
  const [firstname, setFirstname] = useState(user.firstname || "");
  const [lastname, setLastname] = useState(user.lastname || "");
  const [dni, setDni] = useState(user.dni?.toString() || ""); // DNI se maneja como string para el input de texto.
  const [sexo, setSexo] = useState<Sexo | "" | null>(user.sexo || ""); // El tipo `Sexo` puede ser un string vacío o null.
  const [telefono, setTelefono] = useState(user.telefono || "");

  // Estados para la fecha de nacimiento (se descompone en día, mes y año para los inputs).
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Estado para las direcciones, se crea una copia profunda para evitar mutar el objeto 'user' directamente.
  const [addresses, setAddresses] = useState<DireccionDTO[]>(
    user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : []
  );

  // Estados para la carga y previsualización de la imagen de perfil.
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.imagenUser?.url || "/images/default-profile.png" // Usa la URL de la imagen del usuario o una por defecto.
  );

  // Destructura funciones y estados del store de autenticación.
  const { updateUser, updateUserImage, loadingUser } = useAuthStore();

  /**
   * `useEffect` para sincronizar los estados locales del formulario con los datos del usuario.
   * Se ejecuta cada vez que el prop `user` cambia, asegurando que el formulario
   * siempre refleje la información más reciente del usuario.
   */
  useEffect(() => {
    console.log("useEffect: user data changed or component mounted", user);
    setFirstname(user.firstname || "");
    setLastname(user.lastname || "");
    setDni(user.dni?.toString() || "");
    setSexo(user.sexo || "");
    setTelefono(user.telefono || "");

    // Procesa la fecha de nacimiento del usuario (asume formato 'YYYY-MM-DD').
    if (user.fechaNacimiento) {
      const dateParts = user.fechaNacimiento.split("-");
      if (dateParts.length === 3) {
        setYear(dateParts[0]);
        setMonth(dateParts[1]);
        setDay(dateParts[2]);
        console.log(
          `useEffect: Fecha Nacimiento Seteada: ${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        );
      } else {
        console.warn(
          "useEffect: Formato de fecha de nacimiento inesperado en user.fechaNacimiento:",
          user.fechaNacimiento
        );
        setDay("");
        setMonth("");
        setYear("");
      }
    } else {
      setDay("");
      setMonth("");
      setYear("");
      console.log("useEffect: Fecha Nacimiento NO presente en user.");
    }

    // Establece la imagen de previsualización.
    if (user.imagenUser?.url) {
      setPreviewImage(user.imagenUser.url);
      console.log(
        "useEffect: Imagen de perfil seteada desde user.imagenUser.url:",
        user.imagenUser.url
      );
    } else {
      setPreviewImage("/images/default-profile.png");
      console.log("useEffect: No hay imagen de perfil, usando placeholder.");
    }

    // Restaura las direcciones, creando una nueva copia profunda.
    setAddresses(
      user.addresses ? JSON.parse(JSON.stringify(user.addresses)) : []
    );
  }, [user]); // Dependencia: el objeto `user`.

  /**
   * Maneja el cambio de la imagen de perfil seleccionada por el usuario.
   * Almacena el archivo y crea una URL de objeto para la previsualización.
   * @param {React.ChangeEvent<HTMLInputElement>} e Evento de cambio del input de tipo 'file'.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Crea una URL temporal para previsualizar la imagen.
      console.log(
        "handleImageChange: Nueva imagen seleccionada y previsualizada.",
        file.name
      );
    } else {
      setSelectedImage(null);
      setPreviewImage(user.imagenUser?.url || "/images/default-profile.png"); // Vuelve a la imagen original o por defecto.
      console.log(
        "handleImageChange: No se seleccionó archivo o se canceló, volviendo a la imagen original/placeholder."
      );
    }
  };

  /**
   * Actualiza una dirección específica en el array de direcciones.
   * @param {number} index El índice de la dirección a actualizar.
   * @param {DireccionDTO} updatedAddress El objeto de dirección actualizado.
   */
  const handleAddressChange = (index: number, updatedAddress: DireccionDTO) => {
    const newAddresses = addresses.map((addr, i) =>
      i === index ? updatedAddress : addr
    );
    setAddresses(newAddresses);
    console.log(
      `handleAddressChange: Dirección en índice ${index} actualizada.`,
      updatedAddress
    );
  };

  /**
   * Añade una nueva dirección vacía al array de direcciones.
   */
  const handleAddAddress = () => {
    const newAddress: DireccionDTO = {
      calle: "",
      numero: 0,
      cp: 0,
      piso: null,
      departamento: null,
      localidad: null,
      active: true, // Asume que las nuevas direcciones están activas por defecto.
    };
    setAddresses([...addresses, newAddress]); // Añade la nueva dirección al final del array.
    console.log("handleAddAddress: Nueva dirección añadida.", newAddress);
  };

  /**
   * Elimina una dirección del array de direcciones.
   * @param {number} index El índice de la dirección a eliminar.
   */
  const handleRemoveAddress = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
    console.log(`handleRemoveAddress: Dirección en índice ${index} eliminada.`);
  };

  /**
   * Manejador asíncrono para el botón de guardar.
   * Realiza validaciones de la fecha de nacimiento, construye el payload
   * `UserProfileUpdateDTO` y llama a las funciones del store para actualizar
   * los datos del usuario y, si es necesario, la imagen de perfil.
   */
  const handleSave = async () => {
    console.log("handleSave se ha ejecutado!");
    try {
      let fullFechaNacimiento: string | null = null;

      // Validación y formateo de la fecha de nacimiento.
      if (day.trim() || month.trim() || year.trim()) {
        const numDay = parseInt(day.trim(), 10);
        const numMonth = parseInt(month.trim(), 10);
        const numYear = parseInt(year.trim(), 10);

        console.log(
          `DEBUG FECHA: parsedDay=${numDay}, parsedMonth=${numMonth}, parsedYear=${numYear}`
        );

        // Verifica que los valores sean números válidos y estén dentro de rangos razonables.
        if (
          isNaN(numDay) ||
          isNaN(numMonth) ||
          isNaN(numYear) ||
          numDay < 1 ||
          numDay > 31 ||
          numMonth < 1 ||
          numMonth > 12 ||
          numYear < 1900 || // Año mínimo razonable.
          numYear > new Date().getFullYear() // Año máximo es el actual.
        ) {
          toast.error(
            "Fecha de nacimiento inválida. Por favor, ingrese números válidos para día, mes y año."
          );
          console.log(
            "VALIDACION FECHA: Campos no numéricos o fuera de rango. Retornando."
          );
          return;
        }

        const date = new Date(numYear, numMonth - 1, numDay);

        // Valida que la fecha construida sea lógicamente consistente (ej. no 31 de febrero).
        if (
          date.getFullYear() === numYear &&
          date.getMonth() === numMonth - 1 &&
          date.getDate() === numDay
        ) {
          const formattedMonth = numMonth.toString().padStart(2, "0"); // Formatea el mes con dos dígitos.
          const formattedDay = numDay.toString().padStart(2, "0"); // Formatea el día con dos dígitos.
          fullFechaNacimiento = `${numYear}-${formattedMonth}-${formattedDay}`; // Formato 'YYYY-MM-DD'.
          console.log(
            "VALIDACION FECHA: Fecha de nacimiento procesada y válida:",
            fullFechaNacimiento
          );
        } else {
          toast.error(
            "Fecha de nacimiento inválida. La fecha ingresada no existe (ej. 31 de febrero)."
          );
          console.log(
            "VALIDACION FECHA: La fecha ingresada no es válida (ej. 31 de febrero). Retornando."
          );
          return;
        }
      } else {
        console.log(
          "VALIDACION FECHA: Todos los campos de fecha están vacíos. Se enviará como null."
        );
        fullFechaNacimiento = null; // Si los campos están vacíos, la fecha se envía como null.
      }

      // **CONSTRUCCIÓN DEL DTO DE ACTUALIZACIÓN COMPLETO**
      // Se crea un objeto `UserProfileUpdateDTO` que incluye todos los campos del usuario.
      // Los campos que no se modifican se mantienen con sus valores originales del `user` prop.
      const updatedUserData: UserProfileUpdateDTO = {
        id: user.id, // ID del usuario, crucial para la actualización.
        username: user.username, // Mantiene el nombre de usuario original.
        email: user.email, // Mantiene el email original (se edita en otro modal).
        role: user.role, // Mantiene el rol original.
        imagenUser: user.imagenUser || null, // Mantiene la imagen original si no se sube una nueva.

        // Campos modificables directamente desde este formulario:
        firstname: firstname.trim() === "" ? null : firstname.trim(), // Si está vacío, se envía null.
        lastname: lastname.trim() === "" ? null : lastname.trim(),
        dni: dni.trim() === "" ? null : Number(dni.trim()), // Convierte el DNI a número, si no está vacío.
        sexo: sexo === "" ? null : sexo, // Si el sexo es un string vacío, se envía null.
        fechaNacimiento: fullFechaNacimiento, // La fecha de nacimiento ya validada y formateada.
        telefono: telefono.trim() === "" ? null : telefono.trim(),

        // Filtra las direcciones para asegurarse de que sean válidas antes de enviar.
        // Una dirección se considera válida si tiene una calle, un número o un código postal,
        // y un ID de localidad asociado (indicando que la localidad está seleccionada).
        addresses:
          addresses.filter(
            (addr) =>
              addr.calle.trim() !== "" && // La calle no puede estar vacía.
              (addr.numero === undefined ||
                addr.numero === null ||
                addr.numero >= 0) && // El número puede ser 0 o nulo.
              (addr.cp === undefined || addr.cp === null || addr.cp >= 0) && // El CP puede ser 0 o nulo.
              !!addr.localidad?.id // Debe tener una localidad con un ID.
          ) || null, // Si no hay direcciones válidas, se envía null.
      };

      console.log(
        "Datos a enviar a updateUser (objeto completo):",
        updatedUserData
      );

      // Llama a la función del store para actualizar los datos del perfil.
      await updateUser(updatedUserData);
      console.log("updateUser completado exitosamente.");

      // Si hay una nueva imagen seleccionada, se sube por separado.
      if (selectedImage) {
        console.log(
          "Iniciando llamada a updateUserImage con imagen:",
          selectedImage.name
        );
        await updateUserImage(selectedImage);
        console.log("updateUserImage completado exitosamente.");
      } else {
        console.log("No se seleccionó ninguna imagen nueva para subir.");
      }

      toast.success("Perfil actualizado exitosamente."); // Muestra un mensaje de éxito.
      console.log("EXITO: Perfil actualizado exitosamente. Cerrando modal.");
      onClose(); // Cierra el modal después de una actualización exitosa.
    } catch (error: any) {
      // Manejo de errores en caso de fallo en la actualización.
      console.error(
        "Error al guardar los datos personales (CATCH BLOCK):",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error desconocido al actualizar el perfil.";
      toast.error(errorMessage); // Muestra un mensaje de error al usuario.
      console.log("ERROR: Mensaje de error mostrado en toast:", errorMessage);
    }
  };

  return (
    <>
      {/* Fondo oscuro del modal que también lo cierra al hacer clic fuera */}
      <div className={styles.background} onClick={onClose}></div>
      {/* Contenedor principal del modal */}
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Editar Datos Personales</h2>

        {/* Sección de la imagen de perfil */}
        <div className={styles.profileImageSection}>
          <img
            src={previewImage || "/images/default-profile.png"} // Muestra la imagen de previsualización o una por defecto.
            alt="Previsualización de perfil"
            className={styles.profileImagePreview}
          />
          <input
            type="file"
            accept="image/*" // Solo acepta archivos de imagen.
            onChange={handleImageChange}
            className={styles.fileInput}
            id="profileImageUpload" // ID para asociar con la etiqueta.
          />
          <label htmlFor="profileImageUpload" className={styles.uploadButton}>
            Cambiar Imagen
          </label>
        </div>

        {/* Campos de texto para nombre, apellido, DNI, y teléfono */}
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
          type="text" // Usar 'text' para DNI y validar números si es necesario.
          placeholder="DNI"
          className={styles.inputText}
          value={dni}
          onChange={(e) => {
            // Validación opcional en tiempo real para DNI (solo números).
            const re = /^[0-9\b]+$/;
            if (e.target.value === "" || re.test(e.target.value)) {
              setDni(e.target.value);
            }
          }}
          inputMode="numeric" // Sugiere teclado numérico en dispositivos móviles.
          pattern="[0-9]*" // Patrón HTML5 para validación.
        />
        <input
          type="text"
          placeholder="Teléfono"
          className={styles.inputText}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        {/* Sección de la fecha de nacimiento */}
        <fieldset className={styles.dobSection}>
          <legend className={styles.dobLegend}>FECHA DE NACIMIENTO</legend>
          <div className={styles.dobInputs}>
            <input
              type="number"
              placeholder="dd"
              className={styles.dobInput}
              value={day}
              onChange={(e) => {
                setDay(e.target.value.trim()); // Elimina espacios en blanco.
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
              }}
              min="1900"
              max={new Date().getFullYear().toString()} // El año máximo es el actual.
            />
          </div>
        </fieldset>

        {/* Sección de selección de sexo */}
        <fieldset className={styles.genderSection}>
          <legend className={styles.genderLegend}>Sexo</legend>
          <label className={styles.genderOption}>
            <input
              type="radio"
              name="sexo"
              value={Sexo.MASCULINO}
              checked={sexo === Sexo.MASCULINO}
              onChange={(e) => setSexo(e.target.value as Sexo)}
            />{" "}
            Hombre
          </label>
          <label className={styles.genderOption}>
            <input
              type="radio"
              name="sexo"
              value={Sexo.FEMENINO}
              checked={sexo === Sexo.FEMENINO}
              onChange={(e) => setSexo(e.target.value as Sexo)}
            />{" "}
            Mujer
          </label>
          <label className={styles.genderOption}>
            <input
              type="radio"
              name="sexo"
              value={Sexo.OTRO}
              checked={sexo === Sexo.OTRO}
              onChange={(e) => setSexo(e.target.value as Sexo)}
            />{" "}
            Otros
          </label>
          <label className={styles.genderOption}>
            <input
              type="radio"
              name="sexo"
              value={Sexo.UNISEX}
              checked={sexo === Sexo.UNISEX}
              onChange={(e) => setSexo(e.target.value as Sexo)}
            />{" "}
            Unisex
          </label>
          <label className={styles.genderOption}>
            <input
              type="radio"
              name="sexo"
              value={Sexo.UNISEX_CHILD}
              checked={sexo === Sexo.UNISEX_CHILD}
              onChange={(e) => setSexo(e.target.value as Sexo)}
            />{" "}
            Unisex Niño
          </label>
        </fieldset>

        {/* Sección de direcciones */}
        <h3 className={styles.subTitle}>Direcciones</h3>
        {addresses.map((address, index) => (
          <AddressForm
            key={address.id || `new-address-${index}`} // Usa el ID de la dirección o un ID temporal para nuevas.
            address={address}
            index={index}
            onAddressChange={handleAddressChange}
            onRemoveAddress={handleRemoveAddress}
            // Muestra el botón de eliminar si hay más de una dirección o si la dirección ya existe.
            showRemoveButton={addresses.length > 1 || address.id !== undefined}
          />
        ))}
        <button
          type="button"
          onClick={handleAddAddress}
          className={styles.addAddressBtn}
        >
          Añadir Nueva Dirección
        </button>

        {/* Botones de acción */}
        <div className={styles.buttons}>
          <button
            className={styles.cancelBtn}
            onClick={onClose} // Cierra el modal al hacer clic en "Cancelar".
            disabled={loadingUser} // Deshabilita el botón durante la carga.
          >
            Cancelar
          </button>
          <button
            className={styles.acceptBtn}
            onClick={handleSave} // Llama a la función de guardado.
            disabled={loadingUser} // Deshabilita el botón durante la carga.
          >
            {loadingUser ? "Guardando..." : "Aceptar"} {/* Texto dinámico según el estado de carga. */}
          </button>
        </div>
      </div>
    </>
  );
};
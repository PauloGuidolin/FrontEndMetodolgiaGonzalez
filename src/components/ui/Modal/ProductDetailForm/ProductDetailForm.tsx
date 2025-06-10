import React, { useEffect, useState } from "react";
import {
    Dialog, // Contenedor de diálogo modal de Material-UI
    DialogTitle, // Título del diálogo
    DialogContent, // Contenido principal del diálogo
    DialogActions, // Acciones (botones) en el pie del diálogo
    Button, // Botón de Material-UI
    TextField, // Campo de texto de Material-UI
    MenuItem, // Ítem de menú para Select
    Select, // Componente de selección (dropdown)
    FormControl, // Contenedor para agrupar Label, Input y HelperText
    InputLabel, // Etiqueta para FormControl
    CircularProgress, // Indicador de carga circular
    Box, // Componente para layout flexible
    FormHelperText // Texto de ayuda/error para formularios
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select"; // Tipo de evento para el componente Select

// Importar los DTOs (Data Transfer Objects) para la tipificación de datos
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO"; // DTO para un detalle de producto (para lectura/edición)
import { ColorDTO } from "../../../dto/ColorDTO"; // DTO para un color
import { TalleDTO } from "../../../dto/TalleDTO"; // DTO para un talle
import { ProductoDetalleRequestDTO } from "../../../dto/ProductoRequestDTO"; // DTO para el payload de solicitud de detalle de producto (para envío al backend)

// Importar el CSS Module para estilos específicos del componente
import styles from './ProductDetailForm.module.css';

/**
 * Interfaz para definir la estructura del estado interno del formulario.
 * Representa los campos del formulario antes de ser transformados a un DTO de request.
 */
interface ProductDetailFormState {
    id?: number; // ID del detalle de producto (opcional, presente en modo edición)
    precioCompra: number | ''; // Precio de compra (puede ser número o string vacío para el input)
    stockActual: number | ''; // Stock actual (puede ser número o string vacío)
    stockMaximo: number | ''; // Stock máximo (puede ser número o string vacío)
    color: ColorDTO | null; // Objeto ColorDTO seleccionado (o null si no hay)
    talle: TalleDTO | null; // Objeto TalleDTO seleccionado (o null si no hay)
    productoId: number | null; // ID del producto al que pertenece este detalle
    activo?: boolean; // Estado de actividad (opcional)
}

/**
 * Interfaz para el estado de los errores de validación del formulario.
 * Las claves coinciden con los nombres de los campos del formulario.
 */
interface ProductDetailFormErrors {
    precioCompra?: string; // Mensaje de error para precioCompra
    stockActual?: string; // Mensaje de error para stockActual
    stockMaximo?: string; // Mensaje de error para stockMaximo
    color?: string; // Mensaje de error para color
    talle?: string; // Mensaje de error para talle
    productoId?: string; // Mensaje de error para productoId
}

/**
 * Interfaz para las propiedades (props) del componente `ProductDetailForm`.
 */
interface ProductDetailFormProps {
    open: boolean; // Controla la visibilidad del diálogo.
    onClose: () => void; // Función para cerrar el diálogo.
    productDetail: ProductoDetalleDTO | null; // Objeto `ProductoDetalleDTO` a editar (null si es nuevo).
    productId: number | null; // ID del producto padre (para creación de nuevos detalles).
    onSubmit: (detailData: ProductoDetalleRequestDTO) => Promise<void>; // Función para manejar el envío del formulario.
    colors: ColorDTO[]; // Lista de colores disponibles.
    loadingColors: boolean; // Indica si los colores están cargando.
    talles: TalleDTO[]; // Lista de talles disponibles.
    loadingTalles: boolean; // Indica si los talles están cargando.
}

/**
 * `ProductDetailForm` es un componente funcional que renderiza un formulario
 * modal para gestionar los detalles de un producto. Permite crear nuevos detalles
 * o editar los existentes.
 *
 * @param {ProductDetailFormProps} props Las propiedades del componente.
 * @returns {JSX.Element} El componente de formulario del detalle de producto.
 */
const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
    open,
    onClose,
    productDetail,
    productId,
    onSubmit,
    colors,
    loadingColors,
    talles,
    loadingTalles,
}) => {
    // Estado `formData` para almacenar los valores actuales de los campos del formulario.
    // Se inicializa con los datos de `productDetail` si está en modo edición, o con valores predeterminados.
    const [formData, setFormData] = useState<ProductDetailFormState>(() => {
        if (productDetail) {
            // Modo edición: inicializa con los datos existentes.
            return {
                id: productDetail.id,
                precioCompra: productDetail.precioCompra,
                stockActual: productDetail.stockActual,
                stockMaximo: productDetail.stockMaximo,
                // Busca el objeto completo de color/talle en las listas proporcionadas
                // para asegurar que el `Select` muestre el valor correcto.
                color: productDetail.color || null,
                talle: productDetail.talle || null,
                productoId: productDetail.productoId || null,
                activo: productDetail.activo
            };
        } else if (productId) {
            // Modo creación con un `productId` preestablecido: inicializa campos vacíos.
            return {
                precioCompra: '',
                stockActual: '',
                stockMaximo: '',
                color: null,
                talle: null,
                productoId: productId, // Asigna el productId pasado por prop.
                activo: true,
            };
        }
        // Caso por defecto (si no hay productDetail ni productId): todos los campos vacíos.
        return {
            precioCompra: '',
            stockActual: '',
            stockMaximo: '',
            color: null,
            talle: null,
            productoId: null,
            activo: true,
        };
    });

    // Estado `errors` para manejar los mensajes de error de validación.
    const [errors, setErrors] = useState<ProductDetailFormErrors>({});

    /**
     * `useEffect` para re-inicializar el formulario y limpiar los errores
     * cada vez que el diálogo se abre (`open` es true) o cuando cambian
     * `productDetail`, `productId`, `colors` o `talles` (en caso de que
     * se carguen asincrónicamente o cambien).
     */
    useEffect(() => {
        if (open) { // Solo re-inicializa si el modal está abierto.
            if (productDetail) { // Modo edición:
                setFormData({
                    id: productDetail.id,
                    precioCompra: productDetail.precioCompra,
                    stockActual: productDetail.stockActual,
                    stockMaximo: productDetail.stockMaximo,
                    // Busca el objeto Color/Talle completo en las listas cargadas
                    // para asegurar que el Select pueda preseleccionar el valor correcto.
                    color: colors.find(c => c.id === productDetail.color?.id) || productDetail.color || null,
                    talle: talles.find(t => t.id === productDetail.talle?.id) || productDetail.talle || null,
                    productoId: productDetail.productoId || null,
                    activo: productDetail.activo
                });
            } else { // Modo creación:
                // Establece un color y talle por defecto si existen en las listas (ej. "NEGRO", "L").
                const defaultColor = colors.find(c => c.nombreColor === 'NEGRO');
                const defaultTalle = talles.find(t => t.nombreTalle === 'L');

                setFormData({
                    precioCompra: '',
                    stockActual: '',
                    stockMaximo: '',
                    color: defaultColor ?? null,
                    talle: defaultTalle ?? null,
                    productoId: productId, // Asigna el productId del producto principal.
                    activo: true
                });
            }
            setErrors({}); // Limpia cualquier error de validación previo.
        }
    }, [open, productDetail, productId, colors, talles]); // Dependencias del efecto.

    /**
     * Manejador genérico para cambios en los campos de texto numéricos (`TextField`).
     * Actualiza el estado `formData` y limpia el error de validación para el campo modificado.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e El evento de cambio.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Limpiar el error para el campo específico cuando el usuario empieza a escribir
        setErrors(prev => ({ ...prev, [name]: undefined }));

        setFormData((prev) => ({
            ...prev,
            [name]: (name === 'precioCompra' || name === 'stockActual' || name === 'stockMaximo')
                ? (value === '' ? '' : parseFloat(value)) // Convierte a número si no está vacío.
                : value
        }));
    };

    /**
     * Manejador para cambios en los campos de selección (`Select`).
     * Actualiza el estado `formData` con el objeto `ColorDTO` o `TalleDTO` completo,
     * y limpia el error de validación para el campo modificado.
     * @param {SelectChangeEvent<string>} event El evento de cambio del Select.
     */
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        // Limpiar el error para el campo específico cuando el usuario selecciona una opción
        setErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === "color") {
            // Busca el objeto ColorDTO completo por su `nombreColor`.
            const selectedColor = colors.find(c => c.nombreColor === value);
            setFormData((prev) => ({ ...prev, color: selectedColor ?? null }));
        } else if (name === "talle") {
            // Busca el objeto TalleDTO completo por su `nombreTalle`.
            const selectedTalle = talles.find(t => t.nombreTalle === value);
            setFormData((prev) => ({ ...prev, talle: selectedTalle ?? null }));
        }
    };

    /**
     * Función para validar todos los campos del formulario.
     * Establece los errores en el estado `errors` y retorna `true` si el formulario es válido, `false` de lo contrario.
     */
    const validateForm = () => {
        let newErrors: ProductDetailFormErrors = {};
        let isValid = true;

        // Validación: precioCompra
        if (formData.precioCompra === '' || formData.precioCompra === null || isNaN(Number(formData.precioCompra)) || Number(formData.precioCompra) <= 0) {
            newErrors.precioCompra = "El precio de compra es obligatorio y debe ser un número positivo.";
            isValid = false;
        }

        // Validación: stockActual
        if (formData.stockActual === '' || formData.stockActual === null || isNaN(Number(formData.stockActual)) || Number(formData.stockActual) < 0) {
            newErrors.stockActual = "El stock actual es obligatorio y no puede ser negativo.";
            isValid = false;
        }

        // Validación: stockMaximo
        if (formData.stockMaximo === '' || formData.stockMaximo === null || isNaN(Number(formData.stockMaximo)) || Number(formData.stockMaximo) <= 0) {
            newErrors.stockMaximo = "El stock máximo es obligatorio y debe ser un número positivo.";
            isValid = false;
        } else if (Number(formData.stockMaximo) < Number(formData.stockActual)) {
            newErrors.stockMaximo = "El stock máximo no puede ser menor que el stock actual.";
            isValid = false;
        }

        // Validación: Color
        if (!formData.color) {
            newErrors.color = "Debe seleccionar un color.";
            isValid = false;
        }

        // Validación: Talle
        if (!formData.talle) {
            newErrors.talle = "Debe seleccionar un talle.";
            isValid = false;
        }

        // Validación: productoId (asegura que el ID del producto padre esté presente)
        if (!formData.productoId) {
            newErrors.productoId = "El ID del producto padre es obligatorio."; // Este error es más para el desarrollador, no para el usuario.
            isValid = false;
        }

        setErrors(newErrors); // Actualiza el estado de errores.
        return isValid;
    };

    /**
     * Manejador para el envío del formulario.
     * Previene el comportamiento por defecto del formulario, valida los datos,
     * construye el `ProductoDetalleRequestDTO` y llama a la función `onSubmit` prop.
     * @param {React.FormEvent} e El evento de envío del formulario.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita el recargado de la página.

        if (!validateForm()) {
            console.error("Errores de validación en el formulario.");
            return; // Si hay errores, detiene el envío.
        }

        // Construir el DTO `ProductoDetalleRequestDTO` para enviar al backend.
        // Se asegura de que los valores numéricos sean `number` y los objetos `ColorDTO`/`TalleDTO` se conviertan a sus `id`s.
        const detailDataToSubmit: ProductoDetalleRequestDTO = {
            id: formData.id,
            precioCompra: formData.precioCompra as number,
            stockActual: formData.stockActual as number,
            stockMaximo: formData.stockMaximo as number,
            activo: formData.activo ?? true, // Si `activo` no está definido, por defecto es true.

            // IMPORTANTE: Se envían los IDs al backend, no los objetos completos.
            colorId: formData.color!.id as number, // El `!` asegura que `color` no es null (ya validado).
            talleId: formData.talle!.id as number, // El `!` asegura que `talle` no es null (ya validado).
            productoId: formData.productoId as number,
        };

        console.log('ProductDetailForm: Final payload (detailDataToSubmit) ready for backend:', detailDataToSubmit);

        await onSubmit(detailDataToSubmit); // Llama a la función `onSubmit` pasada por props.
        onClose(); // Cierra el modal después de un envío exitoso.
    };

    // Determina el título del diálogo basado en si se está editando o creando un detalle.
    const dialogTitle = productDetail ? "Editar Detalle de Producto" : "Agregar Detalle de Producto";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle className={styles.dialogTitle}>{dialogTitle}</DialogTitle>
            <DialogContent dividers className={styles.dialogContent}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Campo para Precio de Compra */}
                    <TextField
                        name="precioCompra"
                        label="Precio de Compra"
                        type="number"
                        value={formData.precioCompra}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01", min: "0" }} // Permite decimales y valores no negativos.
                        className={styles.textField}
                        error={!!errors.precioCompra} // Muestra el estado de error si hay un mensaje de error.
                        helperText={errors.precioCompra} // Muestra el mensaje de error.
                    />
                    {/* Campo para Stock Actual */}
                    <TextField
                        name="stockActual"
                        label="Stock Actual"
                        type="number"
                        value={formData.stockActual}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ min: "0" }} // Permite valores no negativos.
                        className={styles.textField}
                        error={!!errors.stockActual}
                        helperText={errors.stockActual}
                    />
                    {/* Campo para Stock Máximo */}
                    <TextField
                        name="stockMaximo"
                        label="Stock Máximo"
                        type="number"
                        value={formData.stockMaximo}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ min: "0" }}
                        className={styles.textField}
                        error={!!errors.stockMaximo}
                        helperText={errors.stockMaximo}
                    />

                    {/* Selector de Color */}
                    <FormControl
                        fullWidth
                        margin="normal"
                        required
                        className={styles.formControl}
                        error={!!errors.color} // Aplica el estilo de error al FormControl completo.
                    >
                        <InputLabel id="color-select-label">Color</InputLabel>
                        <Select
                            labelId="color-select-label"
                            id="color-select"
                            name="color"
                            value={formData.color?.nombreColor || ''} // Muestra el nombre del color seleccionado o vacío.
                            onChange={handleSelectChange}
                            label="Color"
                            disabled={loadingColors || colors.length === 0} // Deshabilita si está cargando o no hay opciones.
                        >
                            {loadingColors ? (
                                // Muestra un indicador de carga si los colores están cargando.
                                <MenuItem disabled>
                                    <Box className={styles.loadingText}>
                                        <CircularProgress size={20} /> Cargando colores...
                                    </Box>
                                </MenuItem>
                            ) : (
                                // Mapea las opciones de color si ya están cargadas.
                                colors.map((colorOption) => (
                                    <MenuItem key={colorOption.id} value={colorOption.nombreColor}>
                                        {colorOption.nombreColor}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        {/* Muestra el mensaje de error para el selector de color */}
                        {errors.color && <FormHelperText>{errors.color}</FormHelperText>}
                    </FormControl>

                    {/* Selector de Talle */}
                    <FormControl
                        fullWidth
                        margin="normal"
                        required
                        className={styles.formControl}
                        error={!!errors.talle} // Aplica el estilo de error al FormControl completo.
                    >
                        <InputLabel id="talle-select-label">Talle</InputLabel>
                        <Select
                            labelId="talle-select-label"
                            id="talle-select"
                            name="talle"
                            value={formData.talle?.nombreTalle || ''} // Muestra el nombre del talle seleccionado o vacío.
                            onChange={handleSelectChange}
                            label="Talle"
                            disabled={loadingTalles || talles.length === 0} // Deshabilita si está cargando o no hay opciones.
                        >
                            {loadingTalles ? (
                                // Muestra un indicador de carga si los talles están cargando.
                                <MenuItem disabled>
                                    <Box className={styles.loadingText}>
                                        <CircularProgress size={20} /> Cargando talles...
                                    </Box>
                                </MenuItem>
                            ) : (
                                // Mapea las opciones de talle si ya están cargadas.
                                talles.map((talleOption) => (
                                    <MenuItem key={talleOption.id} value={talleOption.nombreTalle}>
                                        {talleOption.nombreTalle.replace(/_/g, ' ')} {/* Reemplaza guiones bajos por espacios para mejor legibilidad. */}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        {/* Muestra el mensaje de error para el selector de talle */}
                        {errors.talle && <FormHelperText>{errors.talle}</FormHelperText>}
                    </FormControl>
                </form>
            </DialogContent>
            {/* Acciones del diálogo (botones de Cancelar y Guardar) */}
            <DialogActions className={styles.dialogActions}>
                <Button onClick={onClose} color="secondary" variant="outlined" className={styles.button}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" className={styles.button}>
                    {productDetail ? "Guardar Cambios" : "Agregar Detalle"} {/* Texto dinámico según el modo. */}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductDetailForm;
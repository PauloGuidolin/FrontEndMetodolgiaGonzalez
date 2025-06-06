import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Box
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// Importar los DTOs
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { ColorDTO } from "../../../dto/ColorDTO";
import { TalleDTO } from "../../../dto/TalleDTO";
import { ProductoDetalleRequestDTO } from "../../../dto/ProductoRequestDTO"; // Importar ProductoDetalleRequestDTO (usado para el payload de envío)

// Importar el CSS Module
import styles from './ProductDetailForm.module.css';

// Interfaz para el estado interno del formulario
interface ProductDetailFormState {
    id?: number;
    precioCompra: number | '';
    stockActual: number | '';
    stockMaximo: number | '';
    color: ColorDTO | null; // Objeto ColorDTO completo para manejo en el frontend (para mostrar el nombre)
    talle: TalleDTO | null; // Objeto TalleDTO completo para manejo en el frontend (para mostrar el nombre)
    productoId: number | null; // ID del producto asociado. Puede ser null al inicio para creación hasta que se pase productId.
    activo?: boolean;
}

interface ProductDetailFormProps {
    open: boolean;
    onClose: () => void;
    productDetail: ProductoDetalleDTO | null; // Esto será `selectedProductDetail` del padre
    productId: number | null; // Este será `currentProductIdForDetail` del padre (usado para CREACIÓN)
    onSubmit: (detailData: ProductoDetalleRequestDTO) => Promise<void>;
    colors: ColorDTO[];
    loadingColors: boolean;
    talles: TalleDTO[];
    loadingTalles: boolean;
}

const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
    open,
    onClose,
    productDetail, // Contiene los datos del detalle a EDITAR (incluido productoId)
    productId,     // Contiene el ID del producto PADRE para CREAR un nuevo detalle
    onSubmit,
    colors,
    loadingColors,
    talles,
    loadingTalles,
}) => {
    // Inicialización del estado: Si hay un 'productDetail' (modo edición), usa sus datos.
    // Si no, y hay un 'productId' (modo creación), úsalo. De lo contrario, valores por defecto.
    const [formData, setFormData] = useState<ProductDetailFormState>(() => {
        if (productDetail) { // Modo edición: Usar los datos del detalle existente
            return {
                id: productDetail.id,
                precioCompra: productDetail.precioCompra,
                stockActual: productDetail.stockActual,
                stockMaximo: productDetail.stockMaximo,
                color: productDetail.color || null, // Asignar el objeto completo si viene
                talle: productDetail.talle || null, // Asignar el objeto completo si viene
                productoId: productDetail.productoId || null, // **CRÍTICO: Obtener productoId directamente**
                activo: productDetail.activo
            };
        } else if (productId) { // Modo creación: Usar el ID del producto padre proporcionado
            return {
                precioCompra: '',
                stockActual: '',
                stockMaximo: '',
                color: null,
                talle: null,
                productoId: productId, // Se inicializa con el productId recibido por props
                activo: true,
            };
        }
        // Estado por defecto si no hay detalle existente ni productId (esto no debería ocurrir en un flujo normal)
        return {
            precioCompra: '',
            stockActual: '',
            stockMaximo: '',
            color: null,
            talle: null,
            productoId: null, // Si no se conoce el ID del producto padre al inicio
            activo: true,
        };
    });

    // useEffect para re-inicializar el formulario si las props cambian (ej. se abre para un nuevo detalle o edición)
    useEffect(() => {
        if (open) { // Solo si el modal está abierto
            if (productDetail) { // Modo edición
                setFormData({
                    id: productDetail.id,
                    precioCompra: productDetail.precioCompra,
                    stockActual: productDetail.stockActual,
                    stockMaximo: productDetail.stockMaximo,
                    // Busca el objeto ColorDTO/TalleDTO completo por ID, o usa el objeto anidado si viene completo
                    color: colors.find(c => c.id === productDetail.color?.id) || productDetail.color || null,
                    talle: talles.find(t => t.id === productDetail.talle?.id) || productDetail.talle || null,
                    productoId: productDetail.productoId || null, // **CRÍTICO: Ya lo tenemos en la inicialización, pero reafirmamos**
                    activo: productDetail.activo
                });
                console.log('ProductDetailForm: Initializing form for EDIT - productDetail:', productDetail);
                console.log('ProductDetailForm: Initializing form for EDIT - productDetail.productoId:', productDetail.productoId);
            } else { // Modo creación
                const defaultColor = colors.find(c => c.nombreColor === 'NEGRO'); // Considera qué color por defecto quieres
                const defaultTalle = talles.find(t => t.nombreTalle === 'L');    // Considera qué talle por defecto quieres

                setFormData({
                    precioCompra: '',
                    stockActual: '',
                    stockMaximo: '',
                    color: defaultColor ?? null,
                    talle: defaultTalle ?? null,
                    productoId: productId, // Para creación, usa el productId de la prop
                    activo: true
                });
                console.log('ProductDetailForm: Initializing form for NEW - productId:', productId);
            }
        }
        // Este log se ejecutará cada vez que formData cambie, incluyendo después de la inicialización
        // Pero el log que nos interesa para la verificación es el del handleSubmit, que ocurre al enviar.
        console.log('ProductDetailForm: Current formData after useEffect:', formData);
    }, [open, productDetail, productId, colors, talles]); // Dependencias del useEffect

    // Manejador de cambios para los campos de texto numéricos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: (name === 'precioCompra' || name === 'stockActual' || name === 'stockMaximo')
                ? (value === '' ? '' : parseFloat(value))
                : value
        }));
    };

    // Manejador de cambios para los Select (Color y Talle)
    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        console.log(`ProductDetailForm: Select changed - Name: ${name}, Value: ${value}`);

        if (name === "color") {
            const selectedColor = colors.find(c => c.nombreColor === value);
            setFormData((prev) => ({ ...prev, color: selectedColor ?? null }));
            console.log('ProductDetailForm: Selected Color Object:', selectedColor);
        } else if (name === "talle") {
            const selectedTalle = talles.find(t => t.nombreTalle === value);
            setFormData((prev) => ({ ...prev, talle: selectedTalle ?? null }));
            console.log('ProductDetailForm: Selected Talle Object:', selectedTalle);
        }
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones de formulario
        if (formData.precioCompra === '' || formData.precioCompra === null || formData.precioCompra <= 0) {
            console.error("El precio de compra es obligatorio y debe ser mayor que 0.");
            return;
        }
        if (formData.stockActual === '' || formData.stockActual === null || formData.stockActual < 0) {
            console.error("El stock actual es obligatorio y no puede ser negativo.");
            return;
        }
        if (formData.stockMaximo === '' || formData.stockMaximo === null || formData.stockMaximo <= 0) {
            console.error("El stock máximo es obligatorio y debe ser mayor que 0.");
            return;
        }

        console.log('--- ProductDetailForm: Submitting Form Data ---');
        console.log('formData.color:', formData.color);
        console.log('formData.color?.id (value to be sent as colorId):', formData.color?.id);
        console.log('formData.talle:', formData.talle);
        console.log('formData.talle?.id (value to be sent as talleId):', formData.talle?.id);
        console.log('formData.productoId (value to be sent as productoId):', formData.productoId); // **Verificación clave**
        console.log('--- End of form data inspection ---');

        if (!formData.color) {
            console.error("El color es obligatorio (validación de frontend).");
            return;
        }
        if (!formData.talle) {
            console.error("El talle es obligatorio (validación de frontend).");
            return;
        }
        if (!formData.productoId) { // Esta validación ahora debería pasar en modo edición
            console.error("El ID del producto es obligatorio (validación de frontend).");
            return;
        }

        // Construir el DTO a enviar al backend - AHORA ES ProductoDetalleRequestDTO
        const detailDataToSubmit: ProductoDetalleRequestDTO = {
            id: formData.id, // 'id' es opcional en ProductoDetalleRequestDTO para creaciones
            precioCompra: formData.precioCompra as number, // Asegurarse que es number
            stockActual: formData.stockActual as number,   // Asegurarse que es number
            stockMaximo: formData.stockMaximo as number,  // Asegurarse que es number
            activo: formData.activo ?? true,

            // MANDAMOS LOS IDs AL BACKEND, NO LOS OBJETOS COMPLETOS
            colorId: formData.color.id as number,
            talleId: formData.talle.id as number,
            productoId: formData.productoId as number, // **Asegurarse que es number y que viene de formData**
        };

        console.log('ProductDetailForm: Final payload (detailDataToSubmit) ready for backend:', detailDataToSubmit);

        await onSubmit(detailDataToSubmit);
        onClose();
    };

    const dialogTitle = productDetail ? "Editar Detalle de Producto" : "Agregar Detalle de Producto";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle className={styles.dialogTitle}>{dialogTitle}</DialogTitle>
            <DialogContent dividers className={styles.dialogContent}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <TextField
                        name="precioCompra"
                        label="Precio de Compra"
                        type="number"
                        value={formData.precioCompra}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01", min: "0" }}
                        className={styles.textField}
                    />
                    <TextField
                        name="stockActual"
                        label="Stock Actual"
                        type="number"
                        value={formData.stockActual}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ min: "0" }}
                        className={styles.textField}
                    />
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
                    />

                    {/* Selector de Color */}
                    <FormControl fullWidth margin="normal" required className={styles.formControl}>
                        <InputLabel id="color-select-label">Color</InputLabel>
                        <Select
                            labelId="color-select-label"
                            id="color-select"
                            name="color"
                            value={formData.color?.nombreColor || ''}
                            onChange={handleSelectChange}
                            label="Color"
                            disabled={loadingColors || colors.length === 0}
                        >
                            {loadingColors ? (
                                <MenuItem disabled>
                                    <Box className={styles.loadingText}>
                                        <CircularProgress size={20} /> Cargando colores...
                                    </Box>
                                </MenuItem>
                            ) : (
                                colors.map((colorOption) => (
                                    <MenuItem key={colorOption.id} value={colorOption.nombreColor}>
                                        {colorOption.nombreColor}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Selector de Talle */}
                    <FormControl fullWidth margin="normal" required className={styles.formControl}>
                        <InputLabel id="talle-select-label">Talle</InputLabel>
                        <Select
                            labelId="talle-select-label"
                            id="talle-select"
                            name="talle"
                            value={formData.talle?.nombreTalle || ''}
                            onChange={handleSelectChange}
                            label="Talle"
                            disabled={loadingTalles || talles.length === 0}
                        >
                            {loadingTalles ? (
                                <MenuItem disabled>
                                    <Box className={styles.loadingText}>
                                        <CircularProgress size={20} /> Cargando talles...
                                    </Box>
                                </MenuItem>
                            ) : (
                                talles.map((talleOption) => (
                                    <MenuItem key={talleOption.id} value={talleOption.nombreTalle}>
                                        {talleOption.nombreTalle.replace(/_/g, ' ')}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button onClick={onClose} color="secondary" variant="outlined" className={styles.button}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" className={styles.button}>
                    {productDetail ? "Guardar Cambios" : "Agregar Detalle"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductDetailForm;
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
    Box,
    FormHelperText // Importar FormHelperText para mostrar errores en Select
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// Importar los DTOs
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { ColorDTO } from "../../../dto/ColorDTO";
import { TalleDTO } from "../../../dto/TalleDTO";
import { ProductoDetalleRequestDTO } from "../../../dto/ProductoRequestDTO";

// Importar el CSS Module
import styles from './ProductDetailForm.module.css';

// Interfaz para el estado interno del formulario
interface ProductDetailFormState {
    id?: number;
    precioCompra: number | '';
    stockActual: number | '';
    stockMaximo: number | '';
    color: ColorDTO | null; 
    talle: TalleDTO | null; 
    productoId: number | null; 
    activo?: boolean;
}

// Interfaz para el estado de los errores de validación
interface ProductDetailFormErrors {
    precioCompra?: string;
    stockActual?: string;
    stockMaximo?: string;
    color?: string;
    talle?: string;
    productoId?: string;
}

interface ProductDetailFormProps {
    open: boolean;
    onClose: () => void;
    productDetail: ProductoDetalleDTO | null; 
    productId: number | null; 
    onSubmit: (detailData: ProductoDetalleRequestDTO) => Promise<void>;
    colors: ColorDTO[];
    loadingColors: boolean;
    talles: TalleDTO[];
    loadingTalles: boolean;
}

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
    const [formData, setFormData] = useState<ProductDetailFormState>(() => {
        if (productDetail) {
            return {
                id: productDetail.id,
                precioCompra: productDetail.precioCompra,
                stockActual: productDetail.stockActual,
                stockMaximo: productDetail.stockMaximo,
                color: productDetail.color || null,
                talle: productDetail.talle || null,
                productoId: productDetail.productoId || null,
                activo: productDetail.activo
            };
        } else if (productId) {
            return {
                precioCompra: '',
                stockActual: '',
                stockMaximo: '',
                color: null,
                talle: null,
                productoId: productId,
                activo: true,
            };
        }
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

    // Nuevo estado para manejar los errores de validación
    const [errors, setErrors] = useState<ProductDetailFormErrors>({});

    // useEffect para re-inicializar el formulario y limpiar errores
    useEffect(() => {
        if (open) { 
            if (productDetail) { // Modo edición
                setFormData({
                    id: productDetail.id,
                    precioCompra: productDetail.precioCompra,
                    stockActual: productDetail.stockActual,
                    stockMaximo: productDetail.stockMaximo,
                    color: colors.find(c => c.id === productDetail.color?.id) || productDetail.color || null,
                    talle: talles.find(t => t.id === productDetail.talle?.id) || productDetail.talle || null,
                    productoId: productDetail.productoId || null,
                    activo: productDetail.activo
                });
            } else { // Modo creación
                const defaultColor = colors.find(c => c.nombreColor === 'NEGRO'); 
                const defaultTalle = talles.find(t => t.nombreTalle === 'L'); 

                setFormData({
                    precioCompra: '',
                    stockActual: '',
                    stockMaximo: '',
                    color: defaultColor ?? null,
                    talle: defaultTalle ?? null,
                    productoId: productId, 
                    activo: true
                });
            }
            setErrors({}); // Limpiar errores al abrir/reinicializar el formulario
        }
    }, [open, productDetail, productId, colors, talles]); 

    // Manejador de cambios para los campos de texto numéricos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Limpiar el error para el campo específico cuando el usuario empieza a escribir
        setErrors(prev => ({ ...prev, [name]: undefined }));

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
        // Limpiar el error para el campo específico cuando el usuario selecciona una opción
        setErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === "color") {
            const selectedColor = colors.find(c => c.nombreColor === value);
            setFormData((prev) => ({ ...prev, color: selectedColor ?? null }));
        } else if (name === "talle") {
            const selectedTalle = talles.find(t => t.nombreTalle === value);
            setFormData((prev) => ({ ...prev, talle: selectedTalle ?? null }));
        }
    };

    // Función para validar el formulario
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

        // Validación: productoId (aunque esto debería venir siempre del padre)
        if (!formData.productoId) {
            newErrors.productoId = "El ID del producto padre es obligatorio."; // Mensaje de error interno, no visible al usuario
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            console.error("Errores de validación en el formulario.");
            return;
        }

        // Construir el DTO a enviar al backend
        const detailDataToSubmit: ProductoDetalleRequestDTO = {
            id: formData.id, 
            precioCompra: formData.precioCompra as number, 
            stockActual: formData.stockActual as number, 
            stockMaximo: formData.stockMaximo as number, 
            activo: formData.activo ?? true, // Mantener el estado activo si no se especifica

            // MANDAMOS LOS IDs AL BACKEND, NO LOS OBJETOS COMPLETOS
            colorId: formData.color!.id as number, // ! para asegurar que no es null (ya validado)
            talleId: formData.talle!.id as number, // ! para asegurar que no es null (ya validado)
            productoId: formData.productoId as number,
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
                        error={!!errors.precioCompra} // Si existe un error para precioCompra, marcar como error
                        helperText={errors.precioCompra} // Mostrar el mensaje de error
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
                        error={!!errors.stockActual}
                        helperText={errors.stockActual}
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
                        error={!!errors.stockMaximo}
                        helperText={errors.stockMaximo}
                    />

                    {/* Selector de Color */}
                    <FormControl 
                        fullWidth 
                        margin="normal" 
                        required 
                        className={styles.formControl}
                        error={!!errors.color} // Aplicar el estilo de error al FormControl
                    >
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
                        {/* Mostrar el mensaje de error para el selector de color */}
                        {errors.color && <FormHelperText>{errors.color}</FormHelperText>}
                    </FormControl>

                    {/* Selector de Talle */}
                    <FormControl 
                        fullWidth 
                        margin="normal" 
                        required 
                        className={styles.formControl}
                        error={!!errors.talle} // Aplicar el estilo de error al FormControl
                    >
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
                        {/* Mostrar el mensaje de error para el selector de talle */}
                        {errors.talle && <FormHelperText>{errors.talle}</FormHelperText>}
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
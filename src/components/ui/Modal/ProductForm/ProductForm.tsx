// src/components/ui/Modal/ProductForm/ProductForm.tsx
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
    OutlinedInput,
    Checkbox,
    ListItemText,
    Chip,
    Box,
    styled,
    Typography,
    IconButton,
    FormControlLabel,
    Switch, // Asegúrate de que Switch esté importado
} from "@mui/material";
import { ProductoDTO } from "../../../dto/ProductoDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { Sexo } from "../../../../types/ISexo";
import { Add, Delete } from "@mui/icons-material";
import { ImagenDTO } from "../../../dto/ImagenDTO";

// Estilo para el input de archivo oculto
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface ProductFormData extends Partial<ProductoDTO> {
    selectedCategoryIds: number[];
    newImageFiles?: File[];
}

interface ProductFormProps {
    open: boolean;
    onClose: () => void;
    product: ProductoDTO | null;
    onSubmit: (productData: ProductFormData) => Promise<void>;
    categorias: CategoriaDTO[];
    loadingCategorias: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
    open,
    onClose,
    product,
    onSubmit,
    categorias,
    loadingCategorias,
}) => {
    const [formData, setFormData] = useState<Partial<ProductoDTO> & { selectedCategoryIds: number[] }>({
        denominacion: "",
        precioOriginal: 0,
        tienePromocion: false,
        active: true,
        sexo: Sexo.UNISEX,
        selectedCategoryIds: [],
        imagenes: [],
    });

    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id,
                denominacion: product.denominacion || "",
                precioOriginal: product.precioOriginal || 0,
                tienePromocion: product.tienePromocion ?? false,
                active: product.active ?? true,
                sexo: product.sexo || Sexo.UNISEX,
                selectedCategoryIds: (product.categorias || []).map(cat => cat.id as number),
                imagenes: product.imagenes || [],
            });
            setImagePreviews((product.imagenes || []).map(img => img.url));
            setSelectedImageFiles([]);
        } else {
            setFormData({
                denominacion: "",
                precioOriginal: 0,
                tienePromocion: false,
                active: true,
                sexo: Sexo.UNISEX,
                selectedCategoryIds: [],
                imagenes: [],
            });
            setSelectedImageFiles([]);
            setImagePreviews([]);
        }
    }, [product, open]);

    // Manejador para TextField y otros inputs con 'value'
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Manejador específico para Switches
    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSelectChange = (event: any) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (event: any) => {
        const {
            target: { value },
        } = event;
        const selectedIds = typeof value === 'string' ? value.split(',').map(Number) : value;
        setFormData((prev) => ({ ...prev, selectedCategoryIds: selectedIds }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedImageFiles((prev) => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const existingImagesCount = formData.imagenes?.length || 0;

        if (indexToRemove < existingImagesCount) {
            const updatedExistingImages = (formData.imagenes || []).filter((_, index) => index !== indexToRemove);
            setFormData((prev) => ({ ...prev, imagenes: updatedExistingImages as ImagenDTO[] }));
        } else {
            const newFileIndex = indexToRemove - existingImagesCount;
            const updatedSelectedFiles = selectedImageFiles.filter((_, index) => index !== newFileIndex);
            setSelectedImageFiles(updatedSelectedFiles);
        }

        const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSubmit: ProductFormData = {
            ...formData,
            selectedCategoryIds: formData.selectedCategoryIds,
            newImageFiles: selectedImageFiles,
        };

        await onSubmit(dataToSubmit);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{product ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
            <DialogContent dividers>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="denominacion"
                        label="Denominación"
                        value={formData.denominacion}
                        onChange={handleInputChange} 
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        name="precioOriginal"
                        label="Precio Original"
                        type="number"
                        value={formData.precioOriginal}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01" }}
                    />

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="sexo-select-label">Sexo</InputLabel>
                        <Select
                            labelId="sexo-select-label"
                            id="sexo-select"
                            name="sexo"
                            value={formData.sexo || ''}
                            onChange={handleSelectChange}
                            label="Sexo"
                        >
                            {Object.values(Sexo).map((sexoOption) => (
                                <MenuItem key={sexoOption} value={sexoOption}>
                                    {sexoOption.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Switch para Tiene Promoción */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.tienePromocion ?? false}
                                onChange={handleSwitchChange} 
                                name="tienePromocion"
                            />
                        }
                        label="¿Tiene Promoción?"
                    />
                    {/* Switch para Activo */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.active ?? true}
                                onChange={handleSwitchChange} 
                                name="active"
                            />
                        }
                        label="Activo"
                    />

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="categorias-multiple-checkbox-label">Categorías</InputLabel>
                        <Select
                            labelId="categorias-multiple-checkbox-label"
                            id="categorias-multiple-checkbox"
                            multiple
                            name="categorias"
                            value={formData.selectedCategoryIds}
                            onChange={handleMultiSelectChange}
                            input={<OutlinedInput label="Categorías" />}
                            renderValue={(selectedIds) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selectedIds.map((value: any) => {
                                        const category = categorias.find(cat => cat.id === value);
                                        return category ? <Chip key={value} label={category.denominacion} /> : null;
                                    })}
                                </Box>
                            )}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 224,
                                        width: 250,
                                    },
                                },
                            }}
                            disabled={loadingCategorias}
                        >
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.id} value={categoria.id}>
                                    <Checkbox checked={formData.selectedCategoryIds.includes(categoria.id as number)} />
                                    <ListItemText primary={categoria.denominacion} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>Imágenes del Producto</Typography>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<Add />}
                        >
                            Seleccionar Imágenes
                            <VisuallyHiddenInput type="file" multiple onChange={handleImageChange} accept="image/*" />
                        </Button>
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {imagePreviews.map((src, index) => (
                                <Box key={src + index} sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <img src={src} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        sx={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,255,255,0.7)' }}
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                            Puedes seleccionar varias imágenes. Las imágenes existentes se mostrarán si estás editando.
                        </Typography>
                    </FormControl>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {product ? "Guardar Cambios" : "Agregar Producto"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductForm;
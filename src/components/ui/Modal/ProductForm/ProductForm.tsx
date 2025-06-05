// Archivo: src/components/ui/Modal/ProductForm/ProductForm.tsx

import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik"; // Removed Field, ErrorMessage
import * as Yup from "yup";
import { useShallow } from "zustand/shallow";

// Importar componentes de Material-UI
import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Checkbox,
    FormControlLabel,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';

// Importar iconos de Material-UI
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import { ProductoDTO } from "../../../dto/ProductoDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { Sexo } from "../../../../types/ISexo";
import { ImagenDTO } from "../../../dto/ImagenDTO"; 
import { ProductoRequestDTO, ImagenRequestDTO, DescuentoRequestDTO } from "../../../dto/ProductoRequestDTO";

import { useDiscountStore } from "../../../../store/discountStore";
import { Footer } from "../../Footer/Footer";
import { Header } from "../../Header/Header";

// Definición de la interfaz para los valores del formulario
interface ProductFormValues {
    denominacion: string;
    precioOriginal: number;
    tienePromocion: boolean;
    sexo: Sexo; // Asegurar que sea el tipo enum Sexo
    selectedCategoryIds: number[];
    newImageFiles: File[];
    imagenes: ImagenDTO[]; // Sigue siendo ImagenDTO para el estado interno y previsualizaciones
    descuentoId: number | '' | undefined; // ID del descuento seleccionado
}

interface ProductFormProps {
    open: boolean;
    onClose: () => void;
    product: ProductoDTO | null;
    onSubmit: (
        productData: Partial<ProductoRequestDTO> & {
            newImageFiles?: File[];
        }
    ) => void;
    categorias: CategoriaDTO[];
    loadingCategorias: boolean;
}

const validationSchema = Yup.object({
    denominacion: Yup.string().required("La denominación es obligatoria."),
    precioOriginal: Yup.number()
        .required("El precio original es obligatorio.")
        .min(0.01, "El precio original debe ser mayor a 0."),
    sexo: Yup.string().oneOf(Object.values(Sexo), "Sexo inválido.").required("El sexo es obligatorio."),
    selectedCategoryIds: Yup.array()
        .min(1, "Debe seleccionar al menos una categoría.")
        .required("Debe seleccionar al menos una categoría."),
    tienePromocion: Yup.boolean().required(),
});


const ProductForm: React.FC<ProductFormProps> = ({
    open,
    onClose,
    product,
    onSubmit,
    categorias,
    loadingCategorias,
}) => {
    const isEditing = !!product;

    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<ImagenDTO[]>([]);

    // Estados para el diálogo de confirmación de eliminación de imagen
    const [isConfirmRemoveImageOpen, setIsConfirmRemoveImageOpen] = useState(false);
    const [imageToRemove, setImageToRemove] = useState<{ originalIndexInSource: number; isNew: boolean } | null>(null);


    const { discounts, loading: loadingDiscounts, fetchDiscounts } = useDiscountStore(
        useShallow((state) => ({
            discounts: state.discounts,
            loading: state.loading,
            fetchDiscounts: state.fetchDiscounts,
        }))
    );

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    useEffect(() => {
        console.log("ProductForm - useEffect [product] triggered. Product:", product);
        if (product) {
            console.log("ProductForm - Product has images:", product.imagenes);
            // Set existing images from the product prop. These are already on the backend.
            setExistingImages(product.imagenes || []);
            // Clear new files as we're initializing from a potentially saved product
            setNewImageFiles([]);
            console.log("ProductForm - Initial existing images (from product prop):", product.imagenes);
            console.log("ProductForm - New local files cleared.");
        } else {
            // For a new product, clear all image states
            setExistingImages([]);
            setNewImageFiles([]);
            console.log("ProductForm - Resetting image states for new product.");
        }
    }, [product]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setNewImageFiles(prevFiles => {
                console.log("ProductForm - New files selected locally:", filesArray);
                return [...prevFiles, ...filesArray];
            });
        }
    };

    // Abre el diálogo de confirmación
    const handleRemoveImageClick = (originalIndexInSource: number, isNew: boolean) => {
        setImageToRemove({ originalIndexInSource, isNew });
        setIsConfirmRemoveImageOpen(true);
    };

    // Confirma la eliminación de la imagen
    const handleConfirmRemoveImage = () => {
        if (!imageToRemove) return;

        const { originalIndexInSource, isNew } = imageToRemove;

        if (isNew) {
            console.log(`ProductForm - Confirming removal of new local image at original index ${originalIndexInSource}`);
            const updatedNewImageFiles = newImageFiles.filter((_, i) => i !== originalIndexInSource);
            setNewImageFiles(updatedNewImageFiles);
        } else {
            console.log(`ProductForm - Confirming marking existing image at original index ${originalIndexInSource} as inactive (id: ${existingImages[originalIndexInSource]?.id})`);
            const updatedExistingImages = existingImages.map((img, i) =>
                i === originalIndexInSource ? { ...img, active: false } : img
            );
            setExistingImages(updatedExistingImages);
        }
        setIsConfirmRemoveImageOpen(false);
        setImageToRemove(null); // Limpiar el estado de la imagen a eliminar
    };

    // Cancela la eliminación de la imagen
    const handleCancelRemoveImage = () => {
        setIsConfirmRemoveImageOpen(false);
        setImageToRemove(null); // Limpiar el estado de la imagen a eliminar
    };

    // Combined array for rendering previews: active existing images + new local files
    const imagePreviewsToRender = [
        ...existingImages.map((img, originalIndex) => ({
            src: img.url,
            isNew: false,
            key: `existing-${img.id || originalIndex}`,
            originalIndexInSource: originalIndex,
            active: img.active // Keep active status for filtering later
        })),
        ...newImageFiles.map((file, originalIndex) => ({
            src: URL.createObjectURL(file),
            isNew: true,
            key: `new-${originalIndex}`,
            originalIndexInSource: originalIndex,
            active: true // Explicitly set active for new images to satisfy type check
        }))
    ].filter(image => image.isNew || image.active !== false); // Filter out inactive existing images here


    const initialValues: ProductFormValues = {
        denominacion: product?.denominacion || "",
        precioOriginal: product?.precioOriginal || 0,
        tienePromocion: product?.tienePromocion || false,
        sexo: product?.sexo || Sexo.UNISEX, // Usar directamente el enum Sexo
        selectedCategoryIds: product?.categorias?.map((cat) => cat.id as number) || [],
        newImageFiles: [], // Formik will only track these if they are put into `values` from file input
        imagenes: product?.imagenes || [], // This is initialized, but the state `existingImages` is the source of truth for updates
        descuentoId: product?.descuento?.id || '',
    };

    return (
       
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{isEditing ? "Editar Producto" : "Agregar Producto"}</Typography>
                    <IconButton onClick={onClose} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    console.log("ProductForm - Submitting values to parent:", values);
                    console.log("ProductForm - New Image Files (from state) to submit:", newImageFiles);
                    console.log("ProductForm - Existing Images (from state) to submit:", existingImages);

                    const finalDiscountId = values.tienePromocion ? values.descuentoId : undefined;
                    const descuentoRequest: DescuentoRequestDTO | undefined = finalDiscountId ? { id: finalDiscountId as number } : undefined;

                    // Mapear `existingImages` (el estado actualizado) a `ImagenRequestDTO[]`
                    const imagenesRequest: ImagenRequestDTO[] = existingImages
                        .filter(img => img.active !== false) // Asegurarse de enviar solo las activas
                        .map(img => ({ id: img.id, url: img.url, activo: img.active ?? true })); // Asegura `activo`


                    onSubmit({
                        id: product?.id,
                        denominacion: values.denominacion,
                        precioOriginal: values.precioOriginal,
                        tienePromocion: values.tienePromocion,
                        sexo: values.sexo,
                        activo: product?.activo ?? true, // El estado activo lo maneja AdminProductScreen
                        categoriaIds: values.selectedCategoryIds,
                        imagenes: imagenesRequest, // ¡Usar el estado `existingImages` actualizado y filtrado!
                        newImageFiles: newImageFiles, // ¡Usar el estado `newImageFiles` directamente!
                        productos_detalles: product?.productos_detalles?.map(d => ({
                            id: d.id,
                            precioCompra: d.precioCompra,
                            stockActual: d.stockActual,
                            stockMaximo: d.stockMaximo,
                            color: d.color,
                            talle: d.talle,
                            activo: d.active ?? true,
                        })) || [],
                        descuento: descuentoRequest,
                    });
                    setSubmitting(false);
                }}
            >
                {({ values, handleChange, handleBlur, setFieldValue, errors, touched, isSubmitting }) => (
                    <Form>
                        <DialogContent dividers>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControl fullWidth margin="normal" error={touched.denominacion && Boolean(errors.denominacion)}>
                                        <TextField
                                            id="denominacion"
                                            name="denominacion"
                                            label="Denominación"
                                            value={values.denominacion}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.denominacion && Boolean(errors.denominacion)}
                                            helperText={touched.denominacion && errors.denominacion}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    </FormControl>

                                    <FormControl fullWidth margin="normal" error={touched.precioOriginal && Boolean(errors.precioOriginal)}>
                                        <TextField
                                            id="precioOriginal"
                                            name="precioOriginal"
                                            label="Precio Original"
                                            type="number"
                                            value={values.precioOriginal}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.precioOriginal && Boolean(errors.precioOriginal)}
                                            helperText={touched.precioOriginal && errors.precioOriginal}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    </FormControl>

                                    <FormControl fullWidth margin="normal" error={touched.sexo && Boolean(errors.sexo)}>
                                        <InputLabel id="sexo-label">Sexo</InputLabel>
                                        <Select
                                            labelId="sexo-label"
                                            id="sexo"
                                            name="sexo"
                                            value={values.sexo}
                                            label="Sexo"
                                            onChange={(event) => {
                                                setFieldValue('sexo', event.target.value as Sexo);
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.sexo && Boolean(errors.sexo)}
                                        >
                                            {Object.values(Sexo).map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {touched.sexo && errors.sexo && <FormHelperText>{errors.sexo}</FormHelperText>}
                                    </FormControl>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="tienePromocion"
                                                name="tienePromocion"
                                                checked={values.tienePromocion}
                                                onChange={(e) => {
                                                    setFieldValue('tienePromocion', e.target.checked);
                                                    if (!e.target.checked) {
                                                        setFieldValue('descuentoId', '');
                                                    }
                                                }}
                                            />
                                        }
                                        label="Tiene Promoción"
                                        sx={{ mt: 1, mb: 1 }}
                                    />

                                    {values.tienePromocion && (
                                        <FormControl fullWidth margin="normal" error={touched.descuentoId && Boolean(errors.descuentoId)}>
                                            <InputLabel id="descuento-label">Seleccionar Descuento</InputLabel>
                                            <Select
                                                labelId="descuento-label"
                                                id="descuentoId"
                                                name="descuentoId"
                                                value={values.descuentoId || ''}
                                                label="Seleccionar Descuento"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.descuentoId && Boolean(errors.descuentoId)}
                                                disabled={loadingDiscounts}
                                            >
                                                <MenuItem value="">Selecciona un descuento</MenuItem>
                                                {loadingDiscounts ? (
                                                    <MenuItem disabled>Cargando descuentos...</MenuItem>
                                                ) : (
                                                    discounts.map((discount) => (
                                                        <MenuItem key={discount.id} value={discount.id}>
                                                            {discount.denominacion}
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                            {touched.descuentoId && errors.descuentoId && <FormHelperText>{errors.descuentoId}</FormHelperText>}
                                        </FormControl>
                                    )}

                                    <FormControl fullWidth margin="normal" error={touched.selectedCategoryIds && Boolean(errors.selectedCategoryIds)}>
                                        <InputLabel id="categorias-label">Categorías</InputLabel>
                                        <Select
                                            labelId="categorias-label"
                                            id="selectedCategoryIds"
                                            name="selectedCategoryIds"
                                            multiple
                                            value={values.selectedCategoryIds}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.selectedCategoryIds && Boolean(errors.selectedCategoryIds)}
                                            label="Categorías"
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(selected as number[]).map((value) => {
                                                        const category = categorias.find(cat => cat.id === value);
                                                        return (
                                                            <Chip key={value} label={category ? category.denominacion : value} />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {loadingCategorias ? (
                                                <MenuItem disabled>Cargando categorías...</MenuItem>
                                            ) : (
                                                categorias.map((category) => (
                                                    <MenuItem key={category.id} value={category.id}>
                                                        <Checkbox checked={values.selectedCategoryIds.indexOf(category.id as number) > -1} />
                                                        {category.denominacion}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                        {touched.selectedCategoryIds && errors.selectedCategoryIds && <FormHelperText>{errors.selectedCategoryIds}</FormHelperText>}
                                    </FormControl>
                                </Box>

                                <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: '8px', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                                    <input
                                        accept="image/*"
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange} 
                                    />
                                    <label htmlFor="image-upload">
                                        <Button variant="outlined" component="span" startIcon={<AddPhotoAlternateIcon />}>
                                            Subir Imágenes
                                        </Button>
                                    </label>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>PNG, JPG (Máx 5MB por archivo)</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, justifyContent: 'center' }}>
                                        {imagePreviewsToRender.map((image) => (
                                            <Box key={image.key} sx={{ position: 'relative', width: 100, height: 100, border: '1px solid', borderColor: 'grey.300', borderRadius: '4px', overflow: 'hidden', boxShadow: 1 }}>
                                                <img
                                                    src={image.src}
                                                    alt="preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                                                    onClick={() => handleRemoveImageClick(
                                                        image.originalIndexInSource,
                                                        image.isNew
                                                    )}
                                                    aria-label={`Eliminar ${image.isNew ? 'nueva' : 'existente'} imagen`}
                                                >
                                                    <CloseIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={onClose} color="inherit" variant="outlined">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (isEditing ? "Guardar Cambios" : "Agregar Producto")}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>

            {/* Diálogo de Confirmación para Eliminar Imagen */}
            <Dialog
                open={isConfirmRemoveImageOpen}
                onClose={handleCancelRemoveImage}
                aria-labelledby="confirm-image-delete-title"
                aria-describedby="confirm-image-delete-description"
            >
                <DialogTitle id="confirm-image-delete-title">{"Confirmar Eliminación de Imagen"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-image-delete-description">
                        ¿Estás seguro de que deseas eliminar esta imagen?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRemoveImage} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmRemoveImage}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
        
    );
};

export default ProductForm;

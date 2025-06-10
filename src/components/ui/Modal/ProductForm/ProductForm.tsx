
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
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
  ListSubheader, // Importar ListSubheader para agrupar categorías
} from "@mui/material";

// Importar iconos de Material-UI
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { ProductoDTO } from "../../../dto/ProductoDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { Sexo } from "../../../../types/ISexo";
import { ImagenDTO } from "../../../dto/ImagenDTO";
import {
  ProductoRequestDTO,
  ImagenRequestDTO,
  DescuentoRequestDTO,
  ProductoDetalleRequestDTO,
} from "../../../dto/ProductoRequestDTO"; // Importar ProductoDetalleRequestDTO

import { useDiscountStore } from "../../../../store/discountStore";

// Definición de la interfaz para los valores del formulario
interface ProductFormValues {
  denominacion: string;
  precioOriginal: number;
  tienePromocion: boolean;
  sexo: Sexo; // Asegurar que sea el tipo enum Sexo
  selectedCategoryIds: number[];
  newImageFiles: File[];
  imagenes: ImagenDTO[]; // Usado para inicializar Formik, el estado real es existingImages
  descuentoId: number | "" | undefined; // ID del descuento seleccionado
}

interface ProductFormProps {
  open: boolean; // Controla si el modal está abierto
  onClose: () => void; // Función para cerrar el modal
  product: ProductoDTO | null; // Datos del producto a editar (o null para nuevo)
  onSubmit: (
    productData: Partial<ProductoRequestDTO> & {
      newImageFiles?: File[];
    }
  ) => void; // Función para manejar el envío del formulario
  categorias: CategoriaDTO[]; // Lista de categorías disponibles
  loadingCategorias: boolean; // Indica si las categorías están cargando
}

// Esquema de validación con Yup para el formulario
const validationSchema = Yup.object({
  denominacion: Yup.string().required("La denominación es obligatoria."),
  precioOriginal: Yup.number()
    .required("El precio original es obligatorio.")
    .min(0.01, "El precio original debe ser mayor a 0."),
  sexo: Yup.string()
    .oneOf(Object.values(Sexo), "Sexo inválido.")
    .required("El sexo es obligatorio."),
  selectedCategoryIds: Yup.array()
    .min(1, "Debe seleccionar al menos una categoría.") // Requiere al menos una categoría
    .required("Debe seleccionar al menos una categoría."),
  tienePromocion: Yup.boolean().required(), // Campo booleano requerido
});

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  product,
  onSubmit,
  categorias,
  loadingCategorias,
}) => {
  // Determina si el formulario está en modo edición o creación
  const isEditing = !!product;

  // Estado para los archivos de imagen nuevos seleccionados por el usuario
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // Estado para las imágenes existentes del producto (las que ya están en el backend)
  const [existingImages, setExistingImages] = useState<ImagenDTO[]>([]);

  // Estados para el diálogo de confirmación de eliminación de imagen
  const [isConfirmRemoveImageOpen, setIsConfirmRemoveImageOpen] =
    useState(false);
  const [imageToRemove, setImageToRemove] = useState<{
    originalIndexInSource: number; // Índice original de la imagen en su array (newImageFiles o existingImages)
    isNew: boolean; // true si es una imagen nueva, false si es existente
  } | null>(null);

  // Usa el store de descuentos para obtener los descuentos y la función de carga
  const {
    discounts,
    loading: loadingDiscounts,
    fetchDiscounts,
  } = useDiscountStore(
    useShallow((state) => ({
      discounts: state.discounts,
      loading: state.loading,
      fetchDiscounts: state.fetchDiscounts,
    }))
  );

  // Carga los descuentos al montar el componente
  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Sincroniza el estado de las imágenes con el producto cuando cambia la prop 'product'
  useEffect(() => {
    if (product) {
      // Si hay un producto, inicializa 'existingImages' con las imágenes del producto
      setExistingImages(product.imagenes || []);
      // Limpia 'newImageFiles' al cargar un producto existente
      setNewImageFiles([]);
    } else {
      // Si no hay producto (formulario de creación), limpia ambos estados de imagen
      setExistingImages([]);
      setNewImageFiles([]);
    }
  }, [product]);

  // Maneja la selección de nuevos archivos de imagen
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setNewImageFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  // Abre el diálogo de confirmación para eliminar una imagen
  const handleRemoveImageClick = (
    originalIndexInSource: number,
    isNew: boolean
  ) => {
    setImageToRemove({ originalIndexInSource, isNew });
    setIsConfirmRemoveImageOpen(true);
  };

  // Confirma y ejecuta la eliminación/desactivación de la imagen
  const handleConfirmRemoveImage = () => {
    if (!imageToRemove) return;

    const { originalIndexInSource, isNew } = imageToRemove;

    if (isNew) {
      // Si es una imagen nueva (local), simplemente la elimina del array
      const updatedNewImageFiles = newImageFiles.filter(
        (_, i) => i !== originalIndexInSource
      );
      setNewImageFiles(updatedNewImageFiles);
    } else {
      // Si es una imagen existente, la marca como inactiva (para eliminación lógica en el backend)
      const updatedExistingImages = existingImages.map((img, i) =>
        i === originalIndexInSource ? { ...img, active: false } : img
      );
      setExistingImages(updatedExistingImages);
    }
    setIsConfirmRemoveImageOpen(false);
    setImageToRemove(null); // Limpiar el estado de la imagen a eliminar
  };

  // Cancela la eliminación de la imagen y cierra el diálogo
  const handleCancelRemoveImage = () => {
    setIsConfirmRemoveImageOpen(false);
    setImageToRemove(null); // Limpiar el estado de la imagen a eliminar
  };

  // Array combinado de imágenes para renderizar las previsualizaciones
  const imagePreviewsToRender = [
    // Mapea las imágenes existentes y activas
    ...existingImages.map((img, originalIndex) => ({
      src: img.url,
      isNew: false,
      key: `existing-${img.id || originalIndex}`,
      originalIndexInSource: originalIndex,
      active: img.active,
    })),
    // Mapea las nuevas imágenes locales
    ...newImageFiles.map((file, originalIndex) => ({
      src: URL.createObjectURL(file), // Crea una URL temporal para previsualización
      isNew: true,
      key: `new-${originalIndex}`,
      originalIndexInSource: originalIndex,
      active: true, // Las nuevas imágenes siempre se consideran activas
    })),
  ].filter((image) => image.isNew || image.active !== false); // Filtra las imágenes existentes marcadas como inactivas

  // Valores iniciales para Formik, basados en el producto prop o valores por defecto
  const initialValues: ProductFormValues = {
    denominacion: product?.denominacion || "",
    precioOriginal: product?.precioOriginal || 0,
    tienePromocion: product?.tienePromocion || false,
    sexo: Sexo.UNISEX, // Inicializa con el sexo del producto o UNISEX
    selectedCategoryIds:
      product?.categorias?.map((cat) => cat.id as number) || [],
    newImageFiles: [], // Formik no gestiona directamente archivos, estos se manejan por el estado 'newImageFiles'
    imagenes: product?.imagenes || [], // Usado solo para inicialización, el estado 'existingImages' es la fuente de verdad
    descuentoId: product?.descuento?.id || "",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {isEditing ? "Editar Producto" : "Agregar Producto"}
          </Typography>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          // Determina el ID del descuento a enviar
          const finalDiscountId = values.tienePromocion
            ? values.descuentoId
            : undefined;
          // Crea el objeto DescuentoRequestDTO si hay un descuento
          const descuentoRequest: DescuentoRequestDTO | undefined =
            finalDiscountId ? { id: finalDiscountId as number } : undefined;

          // Mapea las 'existingImages' (desde el estado, ya filtradas por 'active') a 'ImagenRequestDTO[]'
          const imagenesRequest: ImagenRequestDTO[] = existingImages
            .filter((img) => img.active !== false) // Asegura que solo se envíen las imágenes activas
            .map((img) => ({
              id: img.id,
              url: img.url,
              activo: img.active ?? true, // Asegura que 'activo' esté definido
            }));

          // Mapea los detalles del producto a 'ProductoDetalleRequestDTO[]'
          const productosDetallesRequest: ProductoDetalleRequestDTO[] =
            product?.productos_detalles
              ?.map((d) => {
                const colorId = d.color?.id;
                const talleId = d.talle?.id;

                // Si falta el ID de color o talle, emite una advertencia y omite este detalle
                if (colorId === undefined || talleId === undefined) {
                  console.warn(
                    `ProductForm: Detalle de producto con ID ${d.id} le falta Color o Talle. Se omitirá del request.`
                  );
                  return null; // Omitir este detalle del request
                }

                return {
                  id: d.id,
                  precioCompra: d.precioCompra,
                  stockActual: d.stockActual,
                  stockMaximo: d.stockMaximo,
                  colorId: colorId as number, // Aserción de tipo
                  talleId: talleId as number, // Aserción de tipo
                  activo: d.activo ?? true,
                  productoId: product.id as number, // Asegura que `product.id` existe si `isEditing`
                };
              })
              .filter(Boolean) as ProductoDetalleRequestDTO[] || []; // Filtra los elementos 'null'

          // Llama a la función onSubmit del componente padre con los datos preparados
          onSubmit({
            id: product?.id, // ID del producto (si está editando)
            denominacion: values.denominacion,
            precioOriginal: values.precioOriginal,
            tienePromocion: values.tienePromocion,
            sexo: values.sexo,
            activo: product?.activo ?? true, // El estado activo lo maneja AdminProductScreen
            categoriaIds: values.selectedCategoryIds,
            imagenes: imagenesRequest, // Usa las imágenes existentes (activas) del estado
            newImageFiles: newImageFiles, // Usa los nuevos archivos de imagen directamente del estado
            productos_detalles: productosDetallesRequest, // Detalles de producto mapeados
            descuento: descuentoRequest,
          });
          setSubmitting(false); // Deshabilita el estado de submitting
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          setFieldValue,
          errors,
          touched,
          isSubmitting,
        }) => (
          <Form>
            <DialogContent dividers>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {/* Columna izquierda: Campos del formulario */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={touched.denominacion && Boolean(errors.denominacion)}
                  >
                    <TextField
                      id="denominacion"
                      name="denominacion"
                      label="Denominación"
                      value={values.denominacion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.denominacion && Boolean(errors.denominacion)
                      }
                      helperText={touched.denominacion && errors.denominacion}
                      fullWidth
                      variant="outlined"
                    />
                  </FormControl>

                  <FormControl
                    fullWidth
                    margin="normal"
                    error={
                      touched.precioOriginal && Boolean(errors.precioOriginal)
                    }
                  >
                    <TextField
                      id="precioOriginal"
                      name="precioOriginal"
                      label="Precio Original"
                      type="number"
                      value={values.precioOriginal}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.precioOriginal && Boolean(errors.precioOriginal)
                      }
                      helperText={
                        touched.precioOriginal && errors.precioOriginal
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </FormControl>

                  <FormControl
                    fullWidth
                    margin="normal"
                    error={touched.sexo && Boolean(errors.sexo)}
                  >
                    <InputLabel id="sexo-label">Sexo</InputLabel>
                    <Select
                      labelId="sexo-label"
                      id="sexo"
                      name="sexo"
                      value={values.sexo}
                      label="Sexo"
                      onChange={(event) => {
                        setFieldValue("sexo", event.target.value as Sexo);
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
                    {touched.sexo && errors.sexo && (
                      <FormHelperText>{errors.sexo}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        id="tienePromocion"
                        name="tienePromocion"
                        checked={values.tienePromocion}
                        onChange={(e) => {
                          setFieldValue("tienePromocion", e.target.checked);
                          // Si se desactiva la promoción, limpia el descuento seleccionado
                          if (!e.target.checked) {
                            setFieldValue("descuentoId", "");
                          }
                        }}
                      />
                    }
                    label="Tiene Promoción"
                    sx={{ mt: 1, mb: 1 }}
                  />

                  {/* Campo de selección de descuento, solo si tienePromocion es true */}
                  {values.tienePromocion && (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={
                        touched.descuentoId && Boolean(errors.descuentoId)
                      }
                    >
                      <InputLabel id="descuento-label">
                        Seleccionar Descuento
                      </InputLabel>
                      <Select
                        labelId="descuento-label"
                        id="descuentoId"
                        name="descuentoId"
                        value={values.descuentoId || ""}
                        label="Seleccionar Descuento"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.descuentoId && Boolean(errors.descuentoId)
                        }
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
                      {touched.descuentoId && errors.descuentoId && (
                        <FormHelperText>{errors.descuentoId}</FormHelperText>
                      )}
                    </FormControl>
                  )}

                  <FormControl
                    fullWidth
                    margin="normal"
                    error={
                      touched.selectedCategoryIds &&
                      Boolean(errors.selectedCategoryIds)
                    }
                  >
                    <InputLabel id="categorias-label">Categorías</InputLabel>
                    <Select
                      labelId="categorias-label"
                      id="selectedCategoryIds"
                      name="selectedCategoryIds"
                      multiple // Permite selección múltiple
                      value={values.selectedCategoryIds}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.selectedCategoryIds &&
                        Boolean(errors.selectedCategoryIds)
                      }
                      label="Categorías"
                      // Renderiza los chips para las categorías seleccionadas
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as number[]).map((value) => {
                            // Encuentra la categoría o subcategoría por su ID para mostrar su denominación
                            const category = categorias.find(
                              (cat) => cat.id === value
                            );
                            const subcategory = category
                              ? null
                              : categorias
                                  .flatMap((cat) => cat.subcategorias || [])
                                  .find((subCat) => subCat.id === value);

                            const displayCategory = category || subcategory;

                            return (
                              <Chip
                                key={value}
                                label={
                                  displayCategory
                                    ? displayCategory.denominacion
                                    : value // Si no se encuentra, muestra el ID
                                }
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {loadingCategorias ? (
                        <MenuItem disabled>Cargando categorías...</MenuItem>
                      ) : (
                        // Mapea las categorías y subcategorías para el menú de selección
                        categorias.map((category) => (
                          [
                            // Opción para la categoría principal
                            <MenuItem key={category.id} value={category.id}>
                              <Checkbox
                                checked={
                                  values.selectedCategoryIds.indexOf(
                                    category.id as number
                                  ) > -1
                                }
                              />
                              {category.denominacion}
                            </MenuItem>,
                            // Si tiene subcategorías, añade un subencabezado
                            category.subcategorias &&
                              category.subcategorias.length > 0 && (
                                <ListSubheader
                                  key={`subheader-${category.id}`}
                                  sx={{ pl: 4 }}
                                >
                                  Subcategorías de {category.denominacion}
                                </ListSubheader>
                              ),
                            // Opciones para las subcategorías (con indentación)
                            ...(category.subcategorias || []).map(
                              (subCategory) => (
                                <MenuItem
                                  key={subCategory.id}
                                  value={subCategory.id}
                                  sx={{ pl: 6 }} // Indenta las subcategorías
                                >
                                  <Checkbox
                                    checked={
                                      values.selectedCategoryIds.indexOf(
                                        subCategory.id as number
                                      ) > -1
                                    }
                                  />
                                  {subCategory.denominacion}
                                </MenuItem>
                              )
                            ),
                          ]
                        ))
                      )}
                    </Select>
                    {touched.selectedCategoryIds &&
                      errors.selectedCategoryIds && (
                        <FormHelperText>
                          {errors.selectedCategoryIds}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Box>

                {/* Columna derecha: Carga y previsualización de imágenes */}
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "grey.400",
                    borderRadius: "8px",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "200px",
                  }}
                >
                  {/* Input oculto para la selección de archivos */}
                  <input
                    accept="image/*"
                    id="image-upload"
                    type="file"
                    multiple // Permite seleccionar múltiples archivos
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  {/* Botón para activar el input de archivos */}
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span" // Permite que el botón active el input de archivo
                      startIcon={<AddPhotoAlternateIcon />}
                    >
                      Subir Imágenes
                    </Button>
                  </label>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    PNG, JPG (Máx 5MB por archivo)
                  </Typography>
                  {/* Contenedor para las previsualizaciones de imágenes */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.5,
                      mt: 2,
                      justifyContent: "center",
                    }}
                  >
                    {imagePreviewsToRender.map((image) => (
                      <Box
                        key={image.key}
                        sx={{
                          position: "relative",
                          width: 100,
                          height: 100,
                          border: "1px solid",
                          borderColor: "grey.300",
                          borderRadius: "4px",
                          overflow: "hidden",
                          boxShadow: 1,
                        }}
                      >
                        <img
                          src={image.src}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {/* Botón para eliminar/desactivar imagen */}
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.8)",
                            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                          }}
                          onClick={() =>
                            handleRemoveImageClick(
                              image.originalIndexInSource,
                              image.isNew
                            )
                          }
                          aria-label={`Eliminar ${
                            image.isNew ? "nueva" : "existente"
                          } imagen`}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            {/* Acciones del formulario (Botones) */}
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={onClose} color="inherit" variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar Cambios"
                  : "Agregar Producto"}
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
        <DialogTitle id="confirm-image-delete-title">
          {"Confirmar Eliminación de Imagen"}
        </DialogTitle>
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
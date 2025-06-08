import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useShallow } from "zustand/react/shallow";
import styles from "./AdminProductScreen.module.css";

// --- Importaciones de DTOs y Stores ---
import { ProductoDTO } from "../../../dto/ProductoDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO"; // Asegúrate de que esta importación existe
import { useProductStore } from "../../../../store/productStore";
import { useProductDetailStore } from "../../../../store/productDetailStore";
import { useCategoryStore } from "../../../../store/categoryStore";
import { useColorStore } from "../../../../store/colorStore";
import { useTalleStore } from "../../../../store/talleStore";
import { useImageStore } from "../../../../store/imageStore";
import {
  ImagenRequestDTO,
  ProductoDetalleRequestDTO,
  ProductoRequestDTO,
} from "../../../dto/ProductoRequestDTO";
import { Sexo } from "../../../../types/ISexo";
import { Header } from "../../../ui/Header/Header";
import ProductDetailForm from "../../../ui/Modal/ProductDetailForm/ProductDetailForm";
import ProductForm from "../../../ui/Modal/ProductForm/ProductForm";
import { Footer } from "../../../ui/Footer/Footer";
import { AdminHeader } from "../../../ui/AdminHeader/AdminHeader";

// Componente Alert para el Snackbar (MuiAlert con ref)
const Alert = React.forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// --- Interfaz de Props para ProductRow ---
interface ProductRowProps {
  product: ProductoDTO;
  onEditProduct: (product: ProductoDTO) => void;
  onDeleteProduct: (productId: number, isActive: boolean) => void;
  fetchProductDetails: (productId: number) => void;
  productDetails: ProductoDetalleDTO[];
  loadingDetails: boolean;
  errorDetails: string | null;
  onAddProductDetail: (productId: number) => void;
  onEditProductDetail: (detail: ProductoDetalleDTO) => void;
  onDeleteProductDetail: (detailId: number, parentProductId: number) => void;
}

// --- Componente ProductRow: Muestra una fila de producto y sus detalles anidados ---
const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEditProduct,
  onDeleteProduct,
  fetchProductDetails,
  productDetails,
  loadingDetails,
  errorDetails,
  onAddProductDetail,
  onEditProductDetail,
  onDeleteProductDetail,
}) => {
  const [open, setOpen] = useState(false);

  // Determina el color del texto de estado (Activo/Inactivo)
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "#4CAF50" : "#F44336"; // Verde para activo, Rojo para inactivo
  };

  // Determina el texto de estado (Activo/Inactivo)
  const getStatusText = (isActive: boolean) => {
    return isActive ? "Activo" : "Inactivo";
  };

  // Maneja el toggle de la sección de detalles del producto
  const handleToggleDetails = () => {
    setOpen(!open);
    if (!open && product.id) {
      fetchProductDetails(product.id); // Carga los detalles si se expande la fila
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleToggleDetails}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {product.id}
        </TableCell>
        <TableCell>{product.denominacion}</TableCell>
        <TableCell align="right">
          ${product.precioOriginal.toFixed(2)}
        </TableCell>
        <TableCell align="right">
          <Box
            sx={{
              fontWeight: "bold",
              color: product.tienePromocion ? "#FF5722" : "inherit", // Naranja si tiene promoción
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {product.tienePromocion && (
              <Typography
                variant="caption"
                sx={{
                  mr: 0.5,
                  backgroundColor: "#FFF3E0",
                  color: "#FF5722",
                  borderRadius: "4px",
                  px: 0.5,
                }}
              >
                -{product.descuento?.precioPromocional || 0}%
              </Typography>
            )}
            ${product.precioFinal.toFixed(2)}
          </Box>
        </TableCell>
        <TableCell align="center">{product.sexo}</TableCell>
        <TableCell>
          {product.categorias && product.categorias.length > 0
            ? product.categorias.map((cat) => cat.denominacion).join(", ")
            : "N/A"}
        </TableCell>
        {/* NUEVA CELDA PARA SUBCATEGORIAS */}
        <TableCell>
          {product.categorias && product.categorias.length > 0
            ? product.categorias.map((subcat) => subcat.denominacion).join(", ")
            : "N/A"}
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onEditProduct(product)}
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              size="small"
              color={product.activo ? "error" : "success"}
              onClick={() =>
                onDeleteProduct(product.id as number, product.activo)
              }
              startIcon={
                product.activo ? <VisibilityOffIcon /> : <VisibilityIcon />
              }
            >
              {product.activo ? "Desactivar" : "Activar"}
            </Button>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}> {/* Aumenta colSpan a 9 por la nueva columna */}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  Detalles del Producto
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onAddProductDetail(product.id as number)}
                >
                  Agregar Detalle
                </Button>
              </Box>
              {loadingDetails ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80px",
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Cargando detalles...
                  </Typography>
                </Box>
              ) : errorDetails ? (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  Error al cargar detalles: {errorDetails}
                </Typography>
              ) : productDetails.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  No hay detalles de producto disponibles.
                </Typography>
              ) : (
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha("#f5f5f5", 0.8) }}>
                      <TableCell>ID Detalle</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Talle</TableCell>
                      <TableCell align="right">Precio Compra</TableCell>
                      <TableCell align="right">Stock Actual</TableCell>
                      <TableCell align="right">Stock Máximo</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productDetails.map((detail) => (
                      <TableRow
                        key={detail.id}
                        sx={{
                          backgroundColor: detail.activo
                            ? "inherit"
                            : alpha("#ffebee", 0.5), // Fondo ligeramente rosado si está inactivo
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {detail.id}
                        </TableCell>
                        <TableCell>
                          {/* Muestra solo el nombre del color, ya que no tenemos el código HEX */}
                          {detail.color?.nombreColor || "N/A"}
                        </TableCell>
                        <TableCell>
                          {detail.talle?.nombreTalle || "N/A"}
                        </TableCell>
                        <TableCell align="right">
                          ${detail.precioCompra.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {detail.stockActual}
                        </TableCell>
                        <TableCell align="right">
                          {detail.stockMaximo}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: "4px",
                              backgroundColor: alpha(
                                getStatusColor(detail.activo),
                                0.1
                              ),
                              color: getStatusColor(detail.activo),
                              fontWeight: "bold",
                            }}
                          >
                            {getStatusText(detail.activo)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              aria-label="edit detail"
                              size="small"
                              onClick={() => onEditProductDetail(detail)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete detail"
                              size="small"
                              color="error"
                              onClick={() =>
                                onDeleteProductDetail(
                                  detail.id as number,
                                  product.id as number
                                )
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

// --- Componente principal AdminProductScreen ---
const AdminProductScreen: React.FC = () => {
  // --- Stores de datos con Zustand (useShallow para optimización de render) ---
  const {
    originalProducts,
    loading: loadingProducts,
    error: errorProducts,
    fetchProducts,
    addProduct,
    updateProduct,
  } = useProductStore(
    useShallow((state) => ({
      originalProducts: state.originalProducts,
      loading: state.loading,
      error: state.error,
      fetchProducts: state.fetchProducts,
      addProduct: state.addProduct,
      updateProduct: state.updateProduct,
    }))
  );

  const {
    productDetailsByProductId,
    fetchProductDetailsByProductId,
    addProductDetail,
    updateProductDetail,
    deleteProductDetail,
    loadingByProduct: loadingDetailsByProduct,
    errorByProduct: errorDetailsByProduct,
  } = useProductDetailStore(
    useShallow((state) => ({
      productDetailsByProductId: state.productDetailsByProductId,
      fetchProductDetailsByProductId: state.fetchProductDetailsByProductId,
      addProductDetail: state.addProductDetail,
      updateProductDetail: state.updateProductDetail,
      deleteProductDetail: state.deleteProductDetail,
      loadingByProduct: state.loadingByProduct,
      errorByProduct: state.errorByProduct,
    }))
  );

  const {
    categories,
    subCategories, // AÑADIDO: Para obtener subcategorías
    loading: loadingCategorias,
    fetchCategories, // Renombrado a fetchRootCategories para mayor claridad si solo trae raíces
    fetchSubcategories, // AÑADIDO: Función para obtener subcategorías
  } = useCategoryStore(
    useShallow((state) => ({
      categories: state.categories,
      subCategories: state.categories, // Asegúrate de que tu categoryStore tenga este estado
      loading: state.loading,
      fetchCategories: state.fetchRootCategories, // Asumo que fetchRootCategories es el método para categorías de nivel superior
      fetchSubcategories: state.fetchSubcategories, // Asegúrate de que tu categoryStore tenga este método
    }))
  );

  const {
    colors,
    loading: loadingColors,
    fetchAllColors,
  } = useColorStore(
    useShallow((state) => ({
      colors: state.colors,
      loading: state.loading,
      fetchAllColors: state.fetchAllColors,
    }))
  );

  const {
    talles,
    loading: loadingTalles,
    fetchAllTalles,
  } = useTalleStore(
    useShallow((state) => ({
      talles: state.talles,
      loading: state.loading,
      fetchAllTalles: state.fetchAllTalles,
    }))
  );

  const { uploadImageFile } = useImageStore(
    useShallow((state) => ({
      uploadImageFile: state.uploadImageFile,
    }))
  );

  // --- Estados para el manejo de modales y datos seleccionados ---
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductoDTO | null>(
    null
  );

  const [isProductDetailFormOpen, setIsProductDetailFormOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] =
    useState<ProductoDetalleDTO | null>(null);
  const [currentProductIdForDetail, setCurrentProductIdForDetail] = useState<
    number | null
  >(null);

  // Estados para el diálogo de confirmación de cambio de estado de Producto (activar/desactivar)
  const [
    isConfirmProductStatusChangeOpen,
    setIsConfirmProductStatusChangeOpen,
  ] = useState(false);
  const [productIdToChangeStatus, setProductIdToChangeStatus] = useState<
    number | null
  >(null);
  const [productStatusAction, setProductStatusAction] = useState<
    "activate" | "deactivate" | null
  >(null);

  // Estados para el diálogo de confirmación de eliminación de Detalle de Producto
  const [isConfirmDetailDeleteOpen, setIsConfirmDetailDeleteOpen] =
    useState(false);
  const [productDetailIdToDelete, setProductDetailIdToDelete] = useState<
    number | null
  >(null);
  const [parentProductIdForDetailDelete, setParentProductIdForDetailDelete] =
    useState<number | null>(null);

  // --- Estados para Snackbar de notificaciones ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Muestra un mensaje en el Snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Cierra el Snackbar
  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // --- Efecto: Carga datos iniciales al montar el componente ---
  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Trae las categorías principales
    fetchSubcategories(); // AÑADIDO: Trae las subcategorías
    fetchAllColors();
    fetchAllTalles();
  }, [fetchProducts, fetchCategories, fetchSubcategories, fetchAllColors, fetchAllTalles]);

  // --- Manejadores para Productos ---

  // Abre el formulario para agregar un nuevo producto
  const handleAddProductClick = () => {
    setSelectedProduct(null); // Limpia cualquier producto previamente seleccionado
    setIsProductFormOpen(true);
  };

  // Abre el formulario para editar un producto existente
  const handleEditProductClick = (product: ProductoDTO) => {
    setSelectedProduct(product); // Establece el producto a editar
    setIsProductFormOpen(true);
  };

  // Prepara el diálogo de confirmación para activar/desactivar un producto
  const handleDeleteProductClick = (id: number, isActive: boolean) => {
    setProductIdToChangeStatus(id);
    setProductStatusAction(isActive ? "deactivate" : "activate"); // Determina la acción según el estado actual
    setIsConfirmProductStatusChangeOpen(true);
  };

  // Confirma y ejecuta el cambio de estado (activar/desactivar) de un producto
  const handleConfirmProductStatusChange = async () => {
    if (productIdToChangeStatus === null || productStatusAction === null)
      return;

    const product = originalProducts.find(
      (p) => p.id === productIdToChangeStatus
    );
    if (!product) {
      showSnackbar("Producto no encontrado.", "error");
      setIsConfirmProductStatusChangeOpen(false);
      return;
    }

    try {
      // Construye el DTO con el estado 'activo' invertido/definido por la acción
      const updatedProductDto: ProductoRequestDTO = {
        id: product.id,
        denominacion: product.denominacion,
        precioOriginal: product.precioOriginal,
        tienePromocion: product.tienePromocion,
        sexo: product.sexo as Sexo,
        activo: productStatusAction === "activate", // Establece 'activo' basado en la acción (true para activar, false para desactivar)
        categoriaIds: product.categorias?.map((cat) => cat.id as number) || [],
        subcategoriaIds:
          product.categorias?.map((subcat) => subcat.id as number) || [], // CORREGIDO: Usar product.subCategorias
        imagenes:
          product.imagenes?.map((img) => ({
            id: img.id,
            url: img.url,
            activo: img.active ?? true,
          })) || [],
        // Mantiene los detalles de producto existentes si se está actualizando el producto padre
        productos_detalles:
          product.productos_detalles?.map((detail) => ({
            id: detail.id,
            precioCompra: detail.precioCompra,
            stockActual: detail.stockActual,
            stockMaximo: detail.stockMaximo,
            colorId: detail.color?.id as number,
            talleId: detail.talle?.id as number,
            activo: detail.activo ?? true,
            productoId: product.id as number,
          })) || [],
        descuento: product.descuento
          ? { id: product.descuento.id as number }
          : undefined,
      };

      await updateProduct(updatedProductDto);
      showSnackbar(
        `Producto ${
          productStatusAction === "activate" ? "activado" : "desactivado"
        } correctamente.`,
        "success"
      );
      await fetchProducts(); // Refresca la lista de productos
    } catch (error: any) {
      showSnackbar(
        `Error al ${
          productStatusAction === "activate" ? "activar" : "desactivar"
        } el producto: ${error.message || "Error desconocido"}`,
        "error"
      );
      console.error(`Error al ${productStatusAction} producto:`, error);
    } finally {
      setIsConfirmProductStatusChangeOpen(false);
      setProductIdToChangeStatus(null);
      setProductStatusAction(null);
    }
  };

  // Cancela el cambio de estado de un producto
  const handleCancelProductStatusChange = () => {
    setIsConfirmProductStatusChangeOpen(false);
    setProductIdToChangeStatus(null);
    setProductStatusAction(null);
  };

  // Maneja el envío del formulario de producto (agregar o editar)
  const handleProductFormSubmit = async (
    productDataFromForm: Partial<ProductoRequestDTO> & {
      newImageFiles?: File[];
    }
  ) => {
    try {
      const processedImages: ImagenRequestDTO[] = [];

      // Procesa imágenes existentes del formulario (las que no fueron marcadas como inactivas)
      if (
        productDataFromForm.imagenes &&
        Array.isArray(productDataFromForm.imagenes)
      ) {
        productDataFromForm.imagenes.forEach((img) => {
          if (img.activo !== false) {
            processedImages.push({
              id: img.id,
              url: img.url,
              activo: img.activo ?? true,
            });
          }
        });
      }

      // Sube nuevas imágenes
      const uploadedImageUrls: string[] = [];
      if (
        productDataFromForm.newImageFiles &&
        productDataFromForm.newImageFiles.length > 0
      ) {
        const uploadPromises = productDataFromForm.newImageFiles.map((file) =>
          uploadImageFile(file)
        );
        const results = await Promise.allSettled(uploadPromises); // Usa Promise.allSettled para manejar fallos individuales

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            uploadedImageUrls.push(result.value);
          } else {
            console.error(
              `Error al subir archivo ${
                productDataFromForm.newImageFiles?.[index]?.name ||
                "desconocido"
              }:`,
              result.reason
            );
            showSnackbar(
              `Error al subir imagen: ${
                productDataFromForm.newImageFiles?.[index]?.name ||
                "desconocido"
              }`,
              "error"
            );
          }
        });
      }

      // Añade las URLs de las imágenes recién subidas a la lista de imágenes procesadas
      uploadedImageUrls.forEach((url) => {
        processedImages.push({
          id: undefined, // Las nuevas imágenes no tienen ID hasta que se guarden en el backend
          url: url,
          activo: true,
        });
      });

      // Determina el estado 'activo' del producto: si se está editando, mantiene su estado actual; si es nuevo, por defecto es true.
      const currentProductActiveStatus = selectedProduct
        ? selectedProduct.activo
        : true;

      const requestDto: ProductoRequestDTO = {
        id: selectedProduct?.id, // `undefined` para nuevos productos
        denominacion: productDataFromForm.denominacion || "",
        precioOriginal: productDataFromForm.precioOriginal || 0,
        tienePromocion: productDataFromForm.tienePromocion ?? false,
        sexo: productDataFromForm.sexo ?? Sexo.UNISEX,
        activo: currentProductActiveStatus, // Mantiene el estado activo para actualizaciones, por defecto true para nuevos
        categoriaIds: productDataFromForm.categoriaIds || [],
        subcategoriaIds: productDataFromForm.subcategoriaIds || [], // AÑADIDO: Incluye las subcategorías del formulario
        imagenes: processedImages, // Lista combinada de imágenes existentes activas y nuevas
        // Cuando se actualiza un producto, se conservan sus detalles existentes.
        // Los nuevos detalles de producto se añaden a través de un modal separado.
        productos_detalles:
          selectedProduct?.productos_detalles?.map((d) => ({
            id: d.id,
            precioCompra: d.precioCompra,
            stockActual: d.stockActual,
            stockMaximo: d.stockMaximo,
            colorId: d.color?.id as number,
            talleId: d.talle?.id as number,
            activo: d.activo ?? true,
            productoId: selectedProduct!.id as number, // `productoId` es requerido para detalles existentes
          })) || [], // Si no hay `selectedProduct`, se inicializa con un array vacío de detalles
        descuento: productDataFromForm.descuento,
      };

      if (selectedProduct) {
        await updateProduct(requestDto);
        showSnackbar("Producto actualizado correctamente.", "success");
      } else {
        await addProduct(requestDto);
        showSnackbar("Producto agregado correctamente.", "success");
      }

      await fetchProducts(); // Refresca la lista principal de productos
      // Después de refrescar, si estábamos editando, sincroniza el estado `selectedProduct`
      if (selectedProduct) {
        const updatedProductInStore = originalProducts.find(
          (p) => p.id === selectedProduct.id
        );
        if (updatedProductInStore) {
          setSelectedProduct(updatedProductInStore);
        } else {
          setSelectedProduct(null); // Limpia si no se encuentra
        }
      } else {
        setSelectedProduct(null); // Siempre limpia para nuevos productos
      }

      setIsProductFormOpen(false); // Cierra el formulario tras el éxito
    } catch (error: any) {
      showSnackbar(
        `Error al guardar el producto: ${error.message || "Error desconocido"}`,
        "error"
      );
      console.error("Error al guardar producto:", error);
    }
  };

  // --- Manejadores para Detalles de Producto ---

  // Abre el formulario para agregar un nuevo detalle de producto
  const handleAddProductDetailClick = (productId: number) => {
    setSelectedProductDetail(null); // Limpia cualquier detalle previamente seleccionado
    setCurrentProductIdForDetail(productId); // Establece el ID del producto padre
    setIsProductDetailFormOpen(true);
  };

  // Abre el formulario para editar un detalle de producto existente
  const handleEditProductDetailClick = (detail: ProductoDetalleDTO) => {
    setSelectedProductDetail(detail); // Establece el detalle a editar
    setCurrentProductIdForDetail(detail.producto?.id as number); // Asegura que el ID del producto padre esté correctamente establecido
    setIsProductDetailFormOpen(true);
  };

  // Prepara el diálogo de confirmación para eliminar un detalle de producto
  const handleDeleteProductDetailClick = (
    detailId: number,
    parentProductId: number
  ) => {
    setProductDetailIdToDelete(detailId);
    setParentProductIdForDetailDelete(parentProductId);
    setIsConfirmDetailDeleteOpen(true);
  };

  // Confirma y ejecuta la eliminación de un detalle de producto
  const handleConfirmProductDetailDelete = async () => {
    if (
      productDetailIdToDelete === null ||
      parentProductIdForDetailDelete === null
    )
      return;

    try {
      await deleteProductDetail(productDetailIdToDelete); // Llama a la función de eliminación del store
      showSnackbar("Detalle de producto eliminado correctamente.", "success");
      // Refresca los detalles del producto padre para actualizar la UI
      fetchProductDetailsByProductId(parentProductIdForDetailDelete);
    } catch (error: any) {
      showSnackbar(
        `Error al eliminar el detalle: ${error.message || "Error desconocido"}`,
        "error"
      );
      console.error("Error al eliminar detalle de producto:", error);
    } finally {
      setIsConfirmDetailDeleteOpen(false);
      setProductDetailIdToDelete(null);
      setParentProductIdForDetailDelete(null);
    }
  };

  // Cancela la eliminación de un detalle de producto
  const handleCancelProductDetailDelete = () => {
    setIsConfirmDetailDeleteOpen(false);
    setProductDetailIdToDelete(null);
    setParentProductIdForDetailDelete(null);
  };

  // Maneja el envío del formulario de detalle de producto (agregar o editar)
  const handleProductDetailFormSubmit = async (
    detailData: ProductoDetalleRequestDTO
  ) => {
    try {
      if (detailData.id) {
        // Es una actualización
        await updateProductDetail(detailData.id, detailData);
        showSnackbar(
          "Detalle de producto actualizado correctamente.",
          "success"
        );
      } else {
        // Es una adición
        if (
          detailData.productoId === null ||
          detailData.productoId === undefined
        ) {
          throw new Error(
            "El ID del producto padre es obligatorio para agregar un nuevo detalle de producto."
          );
        }
        await addProductDetail(detailData);
        showSnackbar("Detalle de producto agregado correctamente.", "success");
      }

      // Refresca los detalles del producto padre para actualizar la UI
      if (detailData.productoId) {
        fetchProductDetailsByProductId(detailData.productoId);
      }
      setIsProductDetailFormOpen(false); // Cierra el formulario
    } catch (error: any) {
      showSnackbar(
        `Error al guardar el detalle: ${error.message || "Error desconocido"}`,
        "error"
      );
      console.error("Error al guardar detalle de producto:", error);
    } finally {
      // Limpia el estado después de la operación
      setCurrentProductIdForDetail(null);
      setSelectedProductDetail(null);
    }
  };

  // --- Renderizado principal del componente AdminProductScreen ---
  if (loadingProducts) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: 1,
        }}
      >
        <CircularProgress />
        <Typography>Cargando productos...</Typography>
      </Box>
    );
  }

  if (errorProducts) {
    return (
      <Typography color="error" sx={{ textAlign: "center", p: 2 }}>
        Error: {errorProducts}
      </Typography>
    );
  }

  return (
    <>
      <Header />
      <AdminHeader/>
      <Box className={styles.adminProductScreen}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administración de Productos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProductClick}
          sx={{ mb: 2 }}
        >
          Agregar Producto
        </Button>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell /> {/* Para el icono de expandir/contraer */}
                <TableCell>ID</TableCell>
                <TableCell>Denominación</TableCell>
                <TableCell align="right">Precio Original</TableCell>
                <TableCell align="right">Precio Final</TableCell>
                <TableCell align="center">Sexo</TableCell>
                <TableCell>Categorías</TableCell>
                <TableCell>Subcategorías</TableCell> {/* AÑADIDO: Encabezado para Subcategorías */}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {originalProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9} // Aumenta colSpan a 9 por la nueva columna de subcategorías
                    sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                  >
                    No hay productos para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                originalProducts.map((product: ProductoDTO) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEditProduct={handleEditProductClick}
                    onDeleteProduct={handleDeleteProductClick}
                    fetchProductDetails={fetchProductDetailsByProductId}
                    productDetails={
                      productDetailsByProductId[product.id as number] || []
                    }
                    loadingDetails={
                      loadingDetailsByProduct[product.id as number] || false
                    }
                    errorDetails={
                      errorDetailsByProduct[product.id as number] || null
                    }
                    onAddProductDetail={handleAddProductDetailClick}
                    onEditProductDetail={handleEditProductDetailClick}
                    onDeleteProductDetail={handleDeleteProductDetailClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal para Agregar/Editar Producto */}
        <ProductForm
          open={isProductFormOpen}
          onClose={() => setIsProductFormOpen(false)}
          product={selectedProduct}
          onSubmit={handleProductFormSubmit}
          categorias={categories}
          subCategorias={subCategories} // AÑADIDO: Pasa las subcategorías al ProductForm
          loadingCategorias={loadingCategorias}
          loadingSubCategorias={loadingCategorias} // Puedes tener un loading separado para subCategorias si tu store lo maneja
        />

        {/* Modal para Agregar/Editar Detalle de Producto */}
        {/* Se renderiza solo si el modal debe estar abierto y un producto padre ha sido seleccionado */}
        {isProductDetailFormOpen && currentProductIdForDetail !== null && (
          <ProductDetailForm
            open={isProductDetailFormOpen}
            onClose={() => setIsProductDetailFormOpen(false)}
            productDetail={selectedProductDetail}
            productId={currentProductIdForDetail} // Pasa el ID del producto padre al formulario de detalle
            onSubmit={handleProductDetailFormSubmit}
            colors={colors}
            loadingColors={loadingColors}
            talles={talles}
            loadingTalles={loadingTalles}
          />
        )}

        {/* Diálogo de Confirmación de Eliminación/Activación de Producto */}
        <Dialog
          open={isConfirmProductStatusChangeOpen}
          onClose={handleCancelProductStatusChange}
          aria-labelledby="confirm-product-status-title"
          aria-describedby="confirm-product-status-description"
        >
          <DialogTitle id="confirm-product-status-title">
            {productStatusAction === "deactivate"
              ? "Confirmar Desactivación de Producto"
              : "Confirmar Activación de Producto"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-product-status-description">
              {productStatusAction === "deactivate"
                ? "¿Estás seguro de que deseas DESACTIVAR este producto? Ya no será visible en la tienda y sus detalles tampoco estarán activos."
                : "¿Estás seguro de que deseas ACTIVAR este producto? Volverá a ser visible en la tienda, junto con sus detalles activos."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelProductStatusChange} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmProductStatusChange}
              color={productStatusAction === "deactivate" ? "error" : "success"}
              variant="contained"
              autoFocus
            >
              {productStatusAction === "deactivate" ? "Desactivar" : "Activar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Confirmación de Eliminación de Detalle de Producto */}
        <Dialog
          open={isConfirmDetailDeleteOpen}
          onClose={handleCancelProductDetailDelete}
          aria-labelledby="confirm-detail-delete-title"
          aria-describedby="confirm-detail-delete-description"
        >
          <DialogTitle id="confirm-detail-delete-title">
            {"Confirmar Eliminación de Detalle"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-detail-delete-description">
              ¿Estás seguro de que deseas eliminar este detalle de producto de
              forma permanente? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelProductDetailDelete} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmProductDetailDelete}
              color="error"
              variant="contained"
              autoFocus
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            icon={
              snackbarSeverity === "success" ? (
                <CheckCircleOutlineIcon fontSize="inherit" />
              ) : (
                <ErrorOutlineIcon fontSize="inherit" />
              )
            }
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </>
  );
};

export default AdminProductScreen;
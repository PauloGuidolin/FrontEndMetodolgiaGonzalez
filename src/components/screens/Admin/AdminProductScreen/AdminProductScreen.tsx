// Archivo: src/components/screens/Admin/AdminProductScreen/AdminProductScreen.tsx

import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useProductStore } from "../../../../store/productStore";
import { useProductDetailStore } from "../../../../store/productDetailStore";
import { useCategoryStore } from "../../../../store/categoryStore";
import { useImageStore } from "../../../../store/imageStore";

import { ProductoDTO } from "../../../dto/ProductoDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { ImagenDTO } from "../../../dto/ImagenDTO";
import { ProductoRequestDTO, ImagenRequestDTO } from "../../../dto/ProductoRequestDTO";
import { Sexo } from "../../../../types/ISexo";

import ProductForm from "../../../ui/Modal/ProductForm/ProductForm";
import ProductDetailForm from "../../../ui/Modal/ProductDetailForm/ProductDetailForm";

// Importar componentes de Material-UI
import {
    Box,
    Button,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Collapse,
    Paper,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

// Importar iconos de Material-UI
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// CloseIcon removed as it's not used directly here, only in ProductForm

// Importar el módulo CSS (para estilos generales de layout si los hubiera)
import styles from "./AdminProductScreen.module.css";
import { Footer } from "../../../ui/Footer/Footer";
import { Header } from "../../../ui/Header/Header";

// Componente de Fila de Producto Expandible
interface ProductRowProps {
    product: ProductoDTO;
    onEditProduct: (product: ProductoDTO) => void;
    onDeleteProduct: (id: number) => void;
    fetchProductDetails: (productId: number) => void;
    productDetails: ProductoDetalleDTO[];
    loadingDetails: boolean;
    errorDetails: string | null;
    onAddProductDetail: (productId: number) => void;
    onEditProductDetail: (detail: ProductoDetalleDTO) => void;
    onDeleteProductDetail: (detailId: number, parentProductId: number) => void;
}

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
    const [openDetails, setOpenDetails] = useState(false);

    const handleToggleDetails = () => {
        if (!openDetails) {
            fetchProductDetails(product.id as number);
        }
        setOpenDetails(!openDetails);
    };

    const rowSx = product.activo === false ? { backgroundColor: '#ffebee', opacity: 0.7 } : {};

    return (
        <React.Fragment>
            <TableRow sx={rowSx}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={handleToggleDetails}
                    >
                        {openDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{product.id}</TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.denominacion}
                        {product.activo === false && (
                            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold', ml: 1 }}>
                                (INACTIVO)
                            </Typography>
                        )}
                    </Box>
                </TableCell>
                <TableCell align="right">${product.precioOriginal?.toFixed(2) || '0.00'}</TableCell>
                <TableCell align="right">${product.precioFinal?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{product.sexo}</TableCell>
                <TableCell>
                    {product.categorias?.map((cat: CategoriaDTO) => cat.denominacion).join(", ") || "N/A"}
                </TableCell>
                <TableCell align="center">
                    <IconButton
                        color="primary"
                        onClick={() => onEditProduct(product)}
                        aria-label="editar producto"
                        disabled={product.activo === false}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color={product.activo === false ? "success" : "error"}
                        onClick={() => onDeleteProduct(product.id as number)}
                        aria-label={product.activo === false ? "activar producto" : "desactivar producto"}
                    >
                        {product.activo === false ? <AddIcon /> : <DeleteIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={openDetails} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Detalles del Producto
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => onAddProductDetail(product.id as number)}
                                    disabled={product.activo === false}
                                >
                                    Añadir Detalle
                                </Button>
                            </Box>
                            {loadingDetails ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>Cargando detalles...</Typography>
                                </Box>
                            ) : errorDetails ? (
                                <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
                                    Error al cargar detalles: {errorDetails}
                                </Typography>
                            ) : productDetails.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                    No hay detalles de producto disponibles para este producto.
                                </Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID Detalle</TableCell>
                                            <TableCell>Talle</TableCell>
                                            <TableCell>Color</TableCell>
                                            <TableCell align="right">Precio Compra</TableCell>
                                            <TableCell align="right">Stock Actual</TableCell>
                                            <TableCell align="right">Stock Máximo</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {productDetails.map((detail: ProductoDetalleDTO) => (
                                            <TableRow key={detail.id}>
                                                <TableCell>{detail.id}</TableCell>
                                                <TableCell>{detail.talle}</TableCell>
                                                <TableCell>{detail.color}</TableCell>
                                                <TableCell align="right">${detail.precioCompra.toFixed(2)}</TableCell>
                                                <TableCell align="right">{detail.stockActual}</TableCell>
                                                <TableCell align="right">{detail.stockMaximo}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => onEditProductDetail(detail)}
                                                        aria-label="editar detalle"
                                                        disabled={product.activo === false}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => onDeleteProductDetail(detail.id as number, product.id as number)}
                                                        aria-label="eliminar detalle"
                                                        disabled={product.activo === false}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
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


const AdminProductScreen: React.FC = () => {
    // --- Store de Productos ---
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

    // --- Store de Detalles de Producto ---
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

    // --- Store de Categorías (para el formulario de productos) ---
    const {
        categories,
        loading: loadingCategorias,
        fetchCategories,
    } = useCategoryStore(
        useShallow((state) => ({
            categories: state.categories,
            loading: state.loading,
            error: state.error,
            fetchCategories: state.fetchCategories,
        }))
    );

    // --- Store de Imágenes (para la subida de archivos) ---
    const {
        uploadImageFile,
    } = useImageStore(
        useShallow((state) => ({
            uploadImageFile: state.uploadImageFile,
            loading: state.loading,
            error: state.error,
        }))
    );


    // --- Estado para el modal de producto (agregar/editar) ---
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductoDTO | null>(null);

    // --- Estado para el modal de detalles de producto (agregar/editar) ---
    const [isProductDetailFormOpen, setIsProductDetailFormOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState<ProductoDetalleDTO | null>(null);
    const [currentProductIdForDetail, setCurrentProductIdForDetail] = useState<number | null>(null);


    // --- Estado para el modal de confirmación de eliminación/activación de Producto ---
    const [isConfirmProductStatusChangeOpen, setIsConfirmProductStatusChangeOpen] = useState(false);
    const [productIdToChangeStatus, setProductIdToChangeStatus] = useState<number | null>(null);
    const [productStatusAction, setProductStatusAction] = useState<'activate' | 'deactivate' | null>(null);


    // --- Estado para el modal de confirmación de eliminación de Detalle de Producto ---
    const [isConfirmDetailDeleteOpen, setIsConfirmDetailDeleteOpen] = useState(false);
    const [productDetailIdToDelete, setProductDetailIdToDelete] = useState<number | null>(null);
    const [parentProductIdForDetailDelete, setParentProductIdForDetailDelete] = useState<number | null>(null);


    // --- Estado para Snackbar de notificaciones ---
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    // --- Manejadores para Producto ---
    const handleAddProductClick = () => {
        setSelectedProduct(null);
        setIsProductFormOpen(true);
        console.log("AdminProductScreen - Add Product Clicked. selectedProduct set to null.");
    };

    const handleEditProductClick = (product: ProductoDTO) => {
        setSelectedProduct(product);
        setIsProductFormOpen(true);
        console.log("AdminProductScreen - Edit Product Clicked. selectedProduct set to:", product);
    };

    const handleDeleteProductClick = (id: number) => {
        const productToChange = originalProducts.find(p => p.id === id);
        if (productToChange) {
            setProductIdToChangeStatus(id);
            setProductStatusAction(productToChange.activo === false ? 'activate' : 'deactivate');
            setIsConfirmProductStatusChangeOpen(true);
        }
    };

    const handleConfirmProductStatusChange = async () => {
        if (productIdToChangeStatus === null || productStatusAction === null) return;

        const product = originalProducts.find(p => p.id === productIdToChangeStatus);
        if (!product) return;

        try {
            // Construir el DTO con el estado 'activo' invertido
            const updatedProductDto: ProductoRequestDTO = {
                id: product.id,
                denominacion: product.denominacion,
                precioOriginal: product.precioOriginal,
                tienePromocion: product.tienePromocion,
                sexo: product.sexo,
                activo: productStatusAction === 'activate', // Cambia el estado activo
                categoriaIds: product.categorias?.map(cat => cat.id as number) || [],
                imagenes: product.imagenes?.map(img => ({
                    id: img.id,
                    url: img.url,
                    activo: img.active ?? true
                })) || [],
                productos_detalles: product.productos_detalles?.map(detail => ({
                    id: detail.id,
                    precioCompra: detail.precioCompra,
                    stockActual: detail.stockActual,
                    stockMaximo: detail.stockMaximo,
                    color: detail.color,
                    talle: detail.talle,
                    activo: detail.active ?? true
                })) || [],
                descuento: product.descuento ? { id: product.descuento.id as number } : undefined // Asegura que el descuento se envíe como DescuentoRequestDTO
            };

            await updateProduct(updatedProductDto); // Usar updateProduct para cambiar solo el estado 'activo'
            showSnackbar(`Producto ${productStatusAction === 'activate' ? 'activado' : 'desactivado'} correctamente.`, "success");
            await fetchProducts(); // Refetch para asegurar la lista actualizada
        } catch (error: any) {
            showSnackbar(`Error al ${productStatusAction === 'activate' ? 'activar' : 'desactivar'} el producto: ${error.message || "Error desconocido"}`, "error");
            console.error(`Error al ${productStatusAction} producto:`, error);
        } finally {
            setIsConfirmProductStatusChangeOpen(false);
            setProductIdToChangeStatus(null);
            setProductStatusAction(null);
        }
    };

    const handleCancelProductStatusChange = () => {
        setIsConfirmProductStatusChangeOpen(false);
        setProductIdToChangeStatus(null);
        setProductStatusAction(null);
    };

    // --- MODIFICACIÓN CLAVE AQUÍ: handleProductFormSubmit ---
    const handleProductFormSubmit = async (
        productDataFromForm: Partial<ProductoRequestDTO> & {
            newImageFiles?: File[];
        }
    ) => {
        console.log("AdminProductScreen - handleProductFormSubmit called.");
        console.log("AdminProductScreen - Received productDataFromForm:", productDataFromForm);
        console.log("AdminProductScreen - New Image Files to upload:", productDataFromForm.newImageFiles);

        try {
            // Paso 1: Procesar las imágenes existentes y subir las nuevas
            const processedImages: ImagenRequestDTO[] = [];

            // Añadir imágenes existentes (que vienen del formulario y están activas)
            if (productDataFromForm.imagenes && Array.isArray(productDataFromForm.imagenes)) {
                productDataFromForm.imagenes.forEach(img => {
                    if (img.activo !== false) { // Solo incluimos imágenes que no fueron marcadas como inactivas en el formulario
                        processedImages.push({
                            id: img.id,
                            url: img.url,
                            activo: img.activo ?? true, // Asegura que sea booleano
                        });
                    }
                });
                console.log("AdminProductScreen - Existing active images processed (from form data):", processedImages);
            }

            // Subir nuevas imágenes a Cloudinary y obtener sus URLs
            const uploadedImageUrls: string[] = [];
            if (productDataFromForm.newImageFiles && productDataFromForm.newImageFiles.length > 0) {
                console.log("AdminProductScreen - Starting image uploads...");
                const uploadPromises = productDataFromForm.newImageFiles.map(file =>
                    uploadImageFile(file)
                );
                const results = await Promise.allSettled(uploadPromises);

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        uploadedImageUrls.push(result.value);
                        console.log(`AdminProductScreen - Uploaded file ${productDataFromForm.newImageFiles?.[index]?.name} successfully: ${result.value}`);
                    } else {
                        console.error(`AdminProductScreen - Error uploading file ${productDataFromForm.newImageFiles?.[index]?.name || 'desconocido'}:`, result.reason);
                        showSnackbar(`Error al subir imagen: ${productDataFromForm.newImageFiles?.[index]?.name || 'desconocido'}`, "error");
                    }
                });
                console.log("AdminProductScreen - Uploaded image URLs:", uploadedImageUrls);
            }

            // Añadir las URLs de las imágenes recién subidas (y exitosas) como nuevas ImagenRequestDTO
            uploadedImageUrls.forEach(url => {
                processedImages.push({
                    id: undefined, // Como es una imagen nueva, no tendrá ID todavía
                    url: url,
                    activo: true, // Las nuevas imágenes suelen estar activas por defecto
                });
            });
            console.log("AdminProductScreen - Final processed images for DTO (including new URLs):", processedImages);


            // Obtener el producto original si estamos editando para mantener el estado 'activo'
            const currentProductActiveStatus = selectedProduct ? selectedProduct.activo : true;

            // Paso 2: Construir el ProductoRequestDTO final
            const requestDto: ProductoRequestDTO = {
                id: selectedProduct?.id, // Solo para actualizaciones
                denominacion: productDataFromForm.denominacion || '',
                precioOriginal: productDataFromForm.precioOriginal || 0,
                tienePromocion: productDataFromForm.tienePromocion ?? false,
                sexo: productDataFromForm.sexo ?? Sexo.UNISEX, // Asegura el tipo Sexo
                activo: currentProductActiveStatus, // Mantener el estado activo existente o true para nuevo
                categoriaIds: productDataFromForm.categoriaIds || [], // Ya viene correctamente del form
                imagenes: processedImages, // ¡Ahora con URLs reales de imágenes nuevas y existentes!
                productos_detalles: productDataFromForm.productos_detalles || selectedProduct?.productos_detalles?.map(d => ({
                    id: d.id,
                    precioCompra: d.precioCompra,
                    stockActual: d.stockActual,
                    stockMaximo: d.stockMaximo,
                    color: d.color,
                    talle: d.talle,
                    activo: d.active ?? true,
                })) || [],
                descuento: productDataFromForm.descuento
            };

            console.log("AdminProductScreen - Final ProductoRequestDTO sent to store:", requestDto);

            let savedProductId: number | undefined;
            if (selectedProduct) {
                await updateProduct(requestDto);
                savedProductId = selectedProduct.id;
                showSnackbar("Producto actualizado correctamente.", "success");
            } else {
                // Si addProduct devuelve void, no intentamos extraer el ID directamente.
                // Simplemente ejecutamos la acción y luego recargamos los productos.
                await addProduct(requestDto);
                showSnackbar("Producto agregado correctamente.", "success");
                savedProductId = undefined; // No podemos obtener el ID directamente aquí
            }

            // Refresca la lista completa de productos en el store para obtener los últimos datos
            await fetchProducts();
            console.log("AdminProductScreen - Products refetched after save.");

            // Sincroniza el `selectedProduct` con el estado más reciente del store
            // Esto es CRUCIAL para que `ProductForm` reciba las imágenes actualizadas cuando se edite de nuevo
            if (savedProductId) {
                const updatedProductInStore = originalProducts.find(p => p.id === savedProductId);
                if (updatedProductInStore) {
                    setSelectedProduct(updatedProductInStore); // Actualiza el estado `selectedProduct`
                    console.log("AdminProductScreen - selectedProduct state synchronized with latest data:", updatedProductInStore);
                } else {
                    console.warn("AdminProductScreen - Could not find saved product in store after refetch. ID:", savedProductId);
                    setSelectedProduct(null); // Si no se encuentra, limpia para evitar errores
                }
            } else {
                // Para productos nuevos donde no obtuvimos un ID al añadir,
                // limpiamos selectedProduct para asegurar que el formulario se abra vacío la próxima vez.
                setSelectedProduct(null);
                console.log("AdminProductScreen - selectedProduct cleared (new product or failed sync).");
            }

            setIsProductFormOpen(false); // Cierra el modal de formulario
            console.log("AdminProductScreen - Product form closed.");

        } catch (error: any) {
            showSnackbar(`Error al guardar el producto: ${error.message || "Error desconocido"}`, "error");
            console.error("AdminProductScreen - Error saving product:", error);
        }
    };


    // --- Manejadores para Detalles de Producto ---
    const handleAddProductDetailClick = (productId: number) => {
        setSelectedProductDetail(null);
        setCurrentProductIdForDetail(productId);
        setIsProductDetailFormOpen(true);
    };

    const handleEditProductDetailClick = (detail: ProductoDetalleDTO) => {
        setSelectedProductDetail(detail);
        setCurrentProductIdForDetail(detail.producto?.id as number);
        setIsProductDetailFormOpen(true);
    };

    const handleDeleteProductDetailClick = (detailId: number, parentProductId: number) => {
        setProductDetailIdToDelete(detailId);
        setParentProductIdForDetailDelete(parentProductId);
        setIsConfirmDetailDeleteOpen(true);
    };

    const handleConfirmProductDetailDelete = async () => {
        if (productDetailIdToDelete === null || parentProductIdForDetailDelete === null) return;

        try {
            await deleteProductDetail(productDetailIdToDelete);
            showSnackbar("Detalle de producto eliminado correctamente.", "success");
            fetchProductDetailsByProductId(parentProductIdForDetailDelete);
        } catch (error: any) {
            showSnackbar(`Error al eliminar el detalle: ${error.message || "Error desconocido"}`, "error");
            console.error("Error al eliminar detalle de producto:", error);
        } finally {
            setIsConfirmDetailDeleteOpen(false);
            setProductDetailIdToDelete(null);
            setParentProductIdForDetailDelete(null);
        }
    };

    const handleCancelProductDetailDelete = () => {
        setIsConfirmDetailDeleteOpen(false);
        setProductDetailIdToDelete(null);
        setParentProductIdForDetailDelete(null);
    };

    const handleProductDetailFormSubmit = async (detailData: Partial<ProductoDetalleDTO>) => {
        try {
            if (selectedProductDetail) {
                if (selectedProductDetail.id) {
                    await updateProductDetail({ ...selectedProductDetail, ...detailData } as ProductoDetalleDTO);
                    showSnackbar("Detalle de producto actualizado correctamente.", "success");
                }
            } else {
                await addProductDetail({ ...detailData, producto: { id: currentProductIdForDetail } } as ProductoDetalleDTO);
                showSnackbar("Detalle de producto agregado correctamente.", "success");
            }
            if (currentProductIdForDetail) {
                fetchProductDetailsByProductId(currentProductIdForDetail);
            }
            setIsProductDetailFormOpen(false);
        } catch (error: any) {
            showSnackbar(`Error al guardar el detalle: ${error.message || "Error desconocido"}`, "error");
            console.error("Error al guardar detalle de producto:", error);
        } finally {
            setCurrentProductIdForDetail(null);
        }
    };


    if (loadingProducts) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', gap: 1 }}>
                <CircularProgress />
                <Typography>Cargando productos...</Typography>
            </Box>
        );
    }

    if (errorProducts) {
        return (
            <Typography color="error" sx={{ textAlign: 'center', p: 2 }}>
                Error: {errorProducts}
            </Typography>
        );
    }

    return (
        <>
            <Header/>
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
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>ID</TableCell>
                            <TableCell>Denominación</TableCell>
                            <TableCell align="right">Precio Original</TableCell>
                            <TableCell align="right">Precio Final</TableCell>
                            <TableCell align="center">Sexo</TableCell> {/* Centered for consistency */}
                            <TableCell>Categorías</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {originalProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
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
                                    productDetails={productDetailsByProductId[product.id as number] || []}
                                    loadingDetails={loadingDetailsByProduct[product.id as number] || false}
                                    errorDetails={errorDetailsByProduct[product.id as number] || null}
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
                loadingCategorias={loadingCategorias}
            />

            {/* Modal para Agregar/Editar Detalle de Producto */}
            {isProductDetailFormOpen && currentProductIdForDetail !== null && (
                <ProductDetailForm
                    open={isProductDetailFormOpen}
                    onClose={() => setIsProductDetailFormOpen(false)}
                    productDetail={selectedProductDetail}
                    productId={currentProductIdForDetail}
                    onSubmit={handleProductDetailFormSubmit}
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
                    {productStatusAction === 'deactivate' ? "Confirmar Desactivación de Producto" : "Confirmar Activación de Producto"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-product-status-description">
                        {productStatusAction === 'deactivate'
                            ? "¿Estás seguro de que deseas DESACTIVAR este producto? Ya no será visible en la tienda."
                            : "¿Estás seguro de que deseas ACTIVAR este producto? Volverá a ser visible en la tienda."
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelProductStatusChange} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmProductStatusChange}
                        color={productStatusAction === 'deactivate' ? "error" : "success"}
                        variant="contained"
                        autoFocus
                    >
                        {productStatusAction === 'deactivate' ? "Desactivar" : "Activar"}
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
                <DialogTitle id="confirm-detail-delete-title">{"Confirmar Eliminación de Detalle"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-detail-delete-description">
                        ¿Estás seguro de que deseas eliminar este detalle de producto?
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
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                    icon={snackbarSeverity === 'success' ? <CheckCircleOutlineIcon fontSize="inherit" /> : <ErrorOutlineIcon fontSize="inherit" />}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
        <Footer/>
        </>
    );
};

export default AdminProductScreen;

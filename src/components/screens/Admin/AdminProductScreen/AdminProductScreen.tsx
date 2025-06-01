// Archivo: src/components/screens/Admin/AdminProductScreen/AdminProductScreen.tsx

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Collapse,
} from "@mui/material";
import { Edit, Delete, Add, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useShallow } from "zustand/shallow";

import { useProductStore } from "../../../../store/productStore";
import { useProductDetailStore } from "../../../../store/productDetailStore";
import { useCategoryStore } from "../../../../store/categoryStore";

import { ProductoDTO } from "../../../dto/ProductoDTO";
import { CategoriaDTO } from "../../../dto/CategoriaDTO";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { ImagenDTO } from "../../../dto/ImagenDTO"; // Necesario para manejar imágenes existentes
import { ProductoRequestDTO, ImagenRequestDTO } from "../../../dto/ProductoRequestDTO";
import { Sexo } from "../../../../types/ISexo"; // Asegúrate de importar Sexo aquí

import ProductForm from "../../../ui/Modal/ProductForm/ProductForm";
import ProductDetailForm from "../../../ui/Modal/ProductDetailForm/ProductDetailForm";

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
    onDeleteProductDetail: (detailId: number, parentProductId: number) => void; // AQUI LA CORRECCIÓN DE LA INTERFAZ
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

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={handleToggleDetails}
                    >
                        {openDetails ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{product.id}</TableCell>
                <TableCell>{product.denominacion}</TableCell>
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
                    >
                        <Edit />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => onDeleteProduct(product.id as number)}
                        aria-label="eliminar producto"
                    >
                        <Delete />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={openDetails} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalles del Producto
                                <Button
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 2 }}
                                    startIcon={<Add />}
                                    onClick={() => onAddProductDetail(product.id as number)}
                                >
                                    Añadir Detalle
                                </Button>
                            </Typography>
                            {loadingDetails ? (
                                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                                    <CircularProgress size={20} />
                                    <Typography sx={{ ml: 1 }}>Cargando detalles...</Typography>
                                </Box>
                            ) : errorDetails ? (
                                <Typography color="error">Error al cargar detalles: {errorDetails}</Typography>
                            ) : productDetails.length === 0 ? (
                                <Typography>No hay detalles de producto disponibles para este producto.</Typography>
                            ) : (
                                <Table size="small" aria-label="product details">
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
                                                <TableCell component="th" scope="row">{detail.id}</TableCell>
                                                <TableCell>{detail.talle}</TableCell>
                                                <TableCell>{detail.color}</TableCell>
                                                <TableCell align="right">${detail.precioCompra.toFixed(2)}</TableCell>
                                                <TableCell align="right">{detail.stockActual}</TableCell>
                                                <TableCell align="right">{detail.stockMaximo}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => onEditProductDetail(detail)}
                                                        aria-label="editar detalle"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onDeleteProductDetail(detail.id as number, product.id as number)}
                                                        aria-label="eliminar detalle"
                                                    >
                                                        <Delete />
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
        </>
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
        deleteProduct,
    } = useProductStore(
        useShallow((state) => ({
            originalProducts: state.originalProducts,
            loading: state.loading,
            error: state.error,
            fetchProducts: state.fetchProducts,
            addProduct: state.addProduct,
            updateProduct: state.updateProduct,
            deleteProduct: state.deleteProduct,
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

    // --- Estado para el modal de producto (agregar/editar) ---
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductoDTO | null>(null);

    // --- Estado para el modal de detalles de producto (agregar/editar) ---
    const [isProductDetailFormOpen, setIsProductDetailFormOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState<ProductoDetalleDTO | null>(null);
    const [currentProductIdForDetail, setCurrentProductIdForDetail] = useState<number | null>(null);


    // --- Estado para el modal de confirmación de eliminación de Producto ---
    const [isConfirmProductDeleteOpen, setIsConfirmProductDeleteOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);

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

    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => { // Agregado '_'
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
        setSelectedProduct(null); // Limpiar para el modo "Agregar"
        setIsProductFormOpen(true);
    };

    const handleEditProductClick = (product: ProductoDTO) => {
        setSelectedProduct(product); // Establecer el producto para el modo "Editar"
        setIsProductFormOpen(true);
    };

    const handleDeleteProductClick = (id: number) => {
        setProductIdToDelete(id);
        setIsConfirmProductDeleteOpen(true);
    };

    const handleConfirmProductDelete = async () => {
        if (productIdToDelete === null) return;

        try {
            await deleteProduct(productIdToDelete);
            showSnackbar("Producto eliminado correctamente.", "success");
            fetchProducts(); // Refrescar la lista de productos
        } catch (error: any) {
            showSnackbar(`Error al eliminar el producto: ${error.message || "Error desconocido"}`, "error");
            console.error("Error al eliminar producto:", error);
        } finally {
            setIsConfirmProductDeleteOpen(false);
            setProductIdToDelete(null);
        }
    };

    const handleCancelProductDelete = () => {
        setIsConfirmProductDeleteOpen(false);
        setProductIdToDelete(null);
    };

    // --- MODIFICACIÓN CLAVE AQUÍ: handleProductFormSubmit ---
    const handleProductFormSubmit = async (
        productDataFromForm: Partial<ProductoDTO> & {
            selectedCategoryIds?: number[];
            newImageFiles?: File[];
        }
    ) => {
        try {
            // Paso 1: Procesar las imágenes existentes y nuevas
            const processedImages: ImagenRequestDTO[] = [];

            // Añadir imágenes existentes (si estamos editando y productDataFromForm.imagenes existen)
            if (productDataFromForm.imagenes && Array.isArray(productDataFromForm.imagenes)) {
                productDataFromForm.imagenes.forEach(img => {
                    processedImages.push({
                        id: img.id, // Mantener el ID para actualización
                        url: img.url,
                        activo: img.active ?? true, // Asegurar un valor booleano
                    });
                });
            }

            // Subir nuevas imágenes y obtener sus URLs (aquí necesitarías una lógica de subida real)
            const uploadedImageUrls: string[] = [];
            if (productDataFromForm.newImageFiles && productDataFromForm.newImageFiles.length > 0) {
                // Simulación de subida de imágenes. EN UN ENTORNO REAL, AQUÍ LLAMARÍAS A TU API
                // para subir los archivos y obtener las URLs de las imágenes subidas.
                for (const file of productDataFromForm.newImageFiles) {
                    // Por ejemplo: const imageUrl = await uploadImageToCloud(file);
                    // uploadedImageUrls.push(imageUrl);
                    uploadedImageUrls.push(`http://example.com/uploaded/${file.name}`); // Placeholder
                }
            }

            // Añadir las URLs de las imágenes recién subidas como nuevas ImagenRequestDTO
            uploadedImageUrls.forEach(url => {
                processedImages.push({
                    url: url,
                    activo: true, // Las nuevas imágenes suelen estar activas por defecto
                });
            });

            // Paso 2: Construir el ProductoRequestDTO final
            const requestDto: ProductoRequestDTO = {
                id: selectedProduct?.id, // Solo para actualizaciones
                denominacion: productDataFromForm.denominacion || '',
                precioOriginal: productDataFromForm.precioOriginal || 0,
                tienePromocion: productDataFromForm.tienePromocion ?? false,
                // CORRECCIÓN DEL TIPO: Castear a Sexo.
                sexo: (productDataFromForm.sexo as Sexo) ?? Sexo.UNISEX,
                activo: productDataFromForm.active ?? true,
                categoriaIds: productDataFromForm.selectedCategoryIds || [],
                imagenes: processedImages,
                productos_detalles: selectedProduct?.productos_detalles?.map(d => ({
                    id: d.id,
                    precioCompra: d.precioCompra,
                    stockActual: d.stockActual,
                    stockMaximo: d.stockMaximo,
                    color: d.color,
                    talle: d.talle,
                    activo: d.active ?? true,
                })) || []
            };

            console.log("Enviando ProductoRequestDTO al store:", requestDto);

            if (selectedProduct) {
                await updateProduct(requestDto);
                showSnackbar("Producto actualizado correctamente.", "success");
            } else {
                await addProduct(requestDto);
                showSnackbar("Producto agregado correctamente.", "success");
            }
            fetchProducts();
            setIsProductFormOpen(false);
        } catch (error: any) {
            showSnackbar(`Error al guardar el producto: ${error.message || "Error desconocido"}`, "error");
            console.error("Error al guardar producto:", error);
        }
    };


    // --- Manejadores para Detalles de Producto ---
    const handleAddProductDetailClick = (productId: number) => {
        setSelectedProductDetail(null); // Limpiar para el modo "Agregar"
        setCurrentProductIdForDetail(productId);
        setIsProductDetailFormOpen(true);
    };

    const handleEditProductDetailClick = (detail: ProductoDetalleDTO) => {
        setSelectedProductDetail(detail); // Establecer el detalle para el modo "Editar"
        setCurrentProductIdForDetail(detail.producto?.id as number); // Asegúrate de que el detalle tenga una referencia a su producto padre
        setIsProductDetailFormOpen(true);
    };

    const handleDeleteProductDetailClick = (detailId: number, parentProductId: number) => {
        setProductDetailIdToDelete(detailId);
        setParentProductIdForDetailDelete(parentProductId); // Necesitamos el ID del padre para refrescar
        setIsConfirmDetailDeleteOpen(true);
    };

    const handleConfirmProductDetailDelete = async () => {
        if (productDetailIdToDelete === null || parentProductIdForDetailDelete === null) return;

        try {
            await deleteProductDetail(productDetailIdToDelete);
            showSnackbar("Detalle de producto eliminado correctamente.", "success");
            fetchProductDetailsByProductId(parentProductIdForDetailDelete); // Refrescar los detalles del producto padre
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
                // Editar Detalle
                if (selectedProductDetail.id) {
                    await updateProductDetail({ ...selectedProductDetail, ...detailData } as ProductoDetalleDTO);
                    showSnackbar("Detalle de producto actualizado correctamente.", "success");
                }
            } else {
                // Agregar Detalle
                // Asegúrate de que el backend reciba el productId correctamente en el objeto detalle
                await addProductDetail({ ...detailData, producto: { id: currentProductIdForDetail } } as ProductoDetalleDTO);
                showSnackbar("Detalle de producto agregado correctamente.", "success");
            }
            if (currentProductIdForDetail) {
                fetchProductDetailsByProductId(currentProductIdForDetail); // Refrescar los detalles
            }
            setIsProductDetailFormOpen(false);
        } catch (error: any) {
            showSnackbar(`Error al guardar el detalle: ${error.message || "Error desconocido"}`, "error");
            console.error("Error al guardar detalle de producto:", error);
        } finally {
            setCurrentProductIdForDetail(null); // Limpiar después de usar
        }
    };


    if (loadingProducts) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando productos...</Typography>
            </Box>
        );
    }

    if (errorProducts) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error" variant="h6">Error: {errorProducts}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Administración de Productos
            </Typography>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddProductClick}
                sx={{ mb: 2 }}
            >
                Agregar Producto
            </Button>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="productos table">
                    <TableHead>
                        <TableRow>
                            <TableCell /> {/* Celda para el botón de expansión */}
                            <TableCell>ID</TableCell>
                            <TableCell>Denominación</TableCell>
                            <TableCell align="right">Precio Original</TableCell>
                            <TableCell align="right">Precio Final</TableCell>
                            <TableCell>Sexo</TableCell>
                            <TableCell>Categorías</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {originalProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
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
                                    onDeleteProductDetail={handleDeleteProductDetailClick} // AQUI LA CORRECCIÓN DE LA LLAMADA
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


            {/* Modal de Confirmación de Eliminación de Producto */}
            <Dialog
                open={isConfirmProductDeleteOpen}
                onClose={handleCancelProductDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación de Producto"}</DialogTitle>
                <DialogContent>
                    <Typography id="alert-dialog-description">
                        ¿Estás seguro de que deseas eliminar este producto? Esta acción es irreversible y eliminará todos sus detalles asociados.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelProductDelete}>Cancelar</Button>
                    <Button onClick={handleConfirmProductDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Confirmación de Eliminación de Detalle de Producto */}
            <Dialog
                open={isConfirmDetailDeleteOpen}
                onClose={handleCancelProductDetailDelete}
                aria-labelledby="alert-dialog-detail-title"
                aria-describedby="alert-dialog-detail-description"
            >
                <DialogTitle id="alert-dialog-detail-title">{"Confirmar Eliminación de Detalle"}</DialogTitle>
                <DialogContent>
                    <Typography id="alert-dialog-detail-description">
                        ¿Estás seguro de que deseas eliminar este detalle de producto?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelProductDetailDelete}>Cancelar</Button>
                    <Button onClick={handleConfirmProductDetailDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Snackbar para notificaciones */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminProductScreen;
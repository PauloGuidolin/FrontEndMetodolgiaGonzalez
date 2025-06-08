import { Sexo } from "../../types/ISexo";

// DTO para enviar información de una imagen dentro de ProductoRequestDTO
export interface ImagenRequestDTO {
    id?: number; // Opcional para imágenes existentes (en caso de actualización)
    url: string; // La URL de la imagen (de Cloudinary)
    activo?: boolean; // Para soft delete/activación de imágenes individuales
}

// DTO para enviar información de un detalle de producto dentro de ProductoRequestDTO
/**
 * @interface ProductoDetalleRequestDTO
 * @description DTO para enviar datos de detalle de producto al backend.
 * Utiliza IDs para las relaciones con Color y Talle.
 */
export interface ProductoDetalleRequestDTO {
    id?: number; // Opcional para detalles existentes (en caso de actualización)
    precioCompra: number;
    stockActual: number;
    stockMaximo: number;
    colorId: number; // Ahora se envía el ID del Color
    talleId: number; // Ahora se envía el ID del Talle
    productoId: number; // <--- ADD THIS LINE
    activo?: boolean; // Para soft delete/activación de detalles individuales
}

// DTO para enviar información de un descuento dentro de ProductoRequestDTO
// Solo necesitamos el ID para asociar un descuento existente
export interface DescuentoRequestDTO {
    id: number;
}


// DTO principal para la solicitud de creación/actualización de un producto
/**
 * @interface ProductoRequestDTO
 * @description DTO principal para la solicitud de creación/actualización de un producto.
 */
export interface ProductoRequestDTO {
    id?: number; // Solo presente para actualizaciones (el backend lo usa para buscar el producto a actualizar)
    denominacion: string;
    precioOriginal: number; // Mapea a 'precioVenta' en el backend
    tienePromocion: boolean;
    sexo: Sexo;
    activo: boolean; // El estado activo/inactivo se envía en la solicitud

    categoriaIds: number[]; // Solo IDs de categorías para ManyToMany
    subcategoriaIds: number[]; // <--- ¡AÑADE ESTA LÍNEA! Para las subcategorías
    imagenes: ImagenRequestDTO[]; // Lista de ImagenRequestDTOs (con URLs y IDs si existen)
    productos_detalles: ProductoDetalleRequestDTO[]; // Lista de ProductoDetalleRequestDTOs
    descuento?: DescuentoRequestDTO; // Objeto con el ID del descuento a asociar
}
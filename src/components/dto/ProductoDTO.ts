import { CategoriaDTO } from './CategoriaDTO';
import { ImagenDTO } from './ImagenDTO';
import { ProductoDetalleDTO } from './ProductoDetalleDTO';
import { DescuentoDTO } from './DescuentoDTO'; // Asume que tienes este DTO
import { Sexo } from '../../types/ISexo';

// Corresponde a la entidad Producto del backend para operaciones GET
export interface ProductoDTO {
    id?: number; // El ID es opcional si lo usas en el frontend para agregar, pero siempre viene en GET
    denominacion: string;
    precioOriginal: number; // Mapea a 'precioVenta' en el backend
    precioFinal?: number; // Campo calculado en el backend, opcional
    tienePromocion: boolean;
    sexo:Sexo; // Asegúrate que coincida con tu enum Sexo
    activo: boolean; // Estado activo/inactivo

    categorias?: CategoriaDTO[]; // Lista de DTOs de categoría
    imagenes?: ImagenDTO[]; // Lista de DTOs de imagen
    productos_detalles?: ProductoDetalleDTO[]; // Lista de DTOs de detalle de producto
    descuento?: DescuentoDTO; 
}
import { CategoriaDTO } from "./CategoriaDTO";
import { ImagenDTO } from "./ImagenDTO";
import { ProductoDetalleDTO } from "./ProductoDetalleDTO";


export interface ProductoDTO {
    id: number;
    denominacion: string;
    precioOriginal: number;
    precioFinal: number | null;
    categorias: CategoriaDTO[]; // Array de objetos CategoriaDTO
    sexo: string; // Mantendremos string en el frontend
    tienePromocion: boolean;
    imagenes: ImagenDTO[]; // Array de objetos ImagenDTO
    productos_detalles: ProductoDetalleDTO[]; // Nombre corregido a 'productos_detalles'
    descuentos: any[]; // Si no has definido DescuentoDTO, 'any[]' está bien por ahora
    // Añade otras propiedades que tu backend envíe
}
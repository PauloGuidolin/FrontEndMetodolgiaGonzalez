// /dto/ProductoDTO.ts
import { ImagenDTO } from './ImagenDTO';
import { CategoriaDTO } from './CategoriaDTO';
import { ProductoDetalleDTO } from './ProductoDetalleDTO';
import { DescuentoDTO } from './DescuentoDTO'; // Asegúrate de tenerlo importado si lo usas

export interface ProductoDTO {
    id: number;
    denominacion: string;
    precioOriginal: number; // Asegúrate de que sea 'number'
    precioFinal: number;   // Asegúrate de que sea 'number'
    tienePromocion: boolean;
    sexo: 'MASCULINO' | 'FEMENINO' | 'OTRO'; // O como lo hayas definido
    activo: boolean;
    categorias: CategoriaDTO[];
    imagenes: ImagenDTO[];
    productos_detalles: ProductoDetalleDTO[];
    descuento: DescuentoDTO | null; // Puede ser null si no hay descuento
}
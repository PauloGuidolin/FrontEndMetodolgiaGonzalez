// src/types/dtos/ProductoDTO.ts

import { CategoriaDTO } from "./CategoriaDTO";
import { ImagenDTO } from "./ImagenDTO";
import { ProductoDetalleDTO } from "./ProductoDetalleDTO";




export interface ProductoDTO {
    id: number;
    denominacion: string;
    precioOriginal: number;
    precioFinal: number; // Ya no es `null` si siempre se calcula
    categorias: CategoriaDTO[];
    sexo: string; // Usar el tipo Sexo definido arriba
    tienePromocion: boolean;
    imagenes: ImagenDTO[];
    productos_detalles: ProductoDetalleDTO[];
    
}
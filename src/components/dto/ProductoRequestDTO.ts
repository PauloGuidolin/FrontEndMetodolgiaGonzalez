import { Sexo } from "../../types/ISexo";

// src/components/dto/ImagenRequestDTO.ts
export interface ImagenRequestDTO {
    id?: number; // Optional for existing images
    url: string;
    activo: boolean;
}

// src/components/dto/ProductoDetalleRequestDTO.ts
export interface ProductoDetalleRequestDTO {
    id?: number; // Optional for existing details
    precioCompra: number;
    stockActual: number;
    stockMaximo: number;
    color: string; // 'ROJO', 'AZUL', etc.
    talle: string; // 'S', 'M', 'L', 'XL', etc.
    activo: boolean;
    // productoId?: number; // No es necesario enviar esto desde el front, el backend lo maneja
}


export interface ProductoRequestDTO {
    id?: number; // Solo si estás enviando un ID para actualización
    denominacion: string;
    precioOriginal: number;
    tienePromocion: boolean;
    sexo:Sexo
    activo: boolean;
    categoriaIds: number[]; // Array de IDs de categorías
    imagenes: ImagenRequestDTO[];
    productos_detalles: ProductoDetalleRequestDTO[];
}
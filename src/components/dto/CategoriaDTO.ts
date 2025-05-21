// src/types/dtos/CategoriaDTO.ts

export interface CategoriaDTO {
    id: number;
    denominacion: string;
    subcategorias: CategoriaDTO[]; // Recursivo para subcategorías
}
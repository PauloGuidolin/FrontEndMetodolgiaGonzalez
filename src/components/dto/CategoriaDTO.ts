// src/types/dtos/CategoriaDTO.ts
export interface CategoriaDTO {
    id: number; // Long en Java -> number en TS
    denominacion: string;
    subcategorias?: CategoriaDTO[]; // Opcional y recursivo
    active: boolean; // Asumido de Base
}
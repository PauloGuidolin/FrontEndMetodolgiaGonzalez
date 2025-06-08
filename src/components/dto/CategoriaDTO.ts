// src/types/dtos/CategoriaDTO.ts
export interface CategoriaDTO {
    id: number; // Long en Java -> number en TS
    denominacion: string;
    subcategorias?: CategoriaDTO[]; // Opcional y recursivo
    activo: boolean; // Asumido de Base
    categoriaPadre?: CategoriaDTO | null; // Puede ser null
}
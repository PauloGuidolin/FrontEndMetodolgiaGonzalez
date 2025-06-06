// src/types/dtos/ImagenDTO.ts

export interface ImagenDTO {
    id?: number;
    url: string; // Corresponde a `denominacion` en tu entidad `Imagen` de backend
    denominacion: string;
    active: boolean;
}
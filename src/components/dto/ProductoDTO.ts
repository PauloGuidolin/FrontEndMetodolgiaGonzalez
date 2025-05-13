import { Sexo } from "../../types/ISexo";

export interface ProductoDTO {
    // Mapea Long a number en TypeScript
    id: number;

    // Mapea String a string
    denominacion: string;

    // Mapea Double a number
    precioOriginal: number;

    // Mapea Double a number (precio con descuento aplicado)
    precioFinal: number;

    // Mapea List<String> a string[] (lista de nombres de categorías)
    categorias: string[];

    // Mapea el enum Sexo a string (asumiendo que se serializa como string)
    // Si necesitas el enum tipificado, importa Sexo y usa 'sexo: Sexo;'
    sexo?: Sexo;

    // Mapea boolean a boolean
    tienePromocion: boolean;

    // Mapea List<String> a string[] (asumiendo que es una lista de URLs de imágenes como strings)
    imagenes: string[];
}


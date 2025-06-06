import { ColorDTO } from "./ColorDTO";
import { TalleDTO } from "./TalleDTO";
import { ProductoDTO } from "./ProductoDTO";

export interface ProductoDetalleDTO {
    id?: number;
    precioCompra: number;
    stockActual: number;
    stockMaximo: number;
    activo: boolean;
    cantidad?: number; // Opcional, puede ser un duplicado de stockActual o usado en otros contextos

    // Aseguramos que estos campos sean OBLIGATORIOS al recibir el DTO si representan IDs de relación
    // Si tu backend SIEMPRE envía estos IDs directamente, quita el '?'
    colorId: number; // Hacemos obligatorio para el frontend (si el backend lo envía siempre)
    talleId: number; // Hacemos obligatorio para el frontend (si el backend lo envía siempre)
    productoId: number; // **ESTE ES EL CRÍTICO: Hazlo OBLIGATORIO**

    // Campos para recibir del backend (DTOs anidados para visualización) - Opcionales
    color?: ColorDTO;
    talle?: TalleDTO;
    producto?: ProductoDTO; // Si el backend envía el objeto completo (no solo el ID)
    productoDenominacion?: string; // Para mostrar el nombre del producto, puede ser calculado o enviado
}
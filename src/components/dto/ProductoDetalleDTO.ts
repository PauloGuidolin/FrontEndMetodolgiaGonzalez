// src/types/dtos/ProductoDetalleDTO.ts
// Asegúrate de que estos enums existan en tu proyecto frontend (ej. types/Color.ts, types/Talle.ts)

import { Color } from "../../types/IColor";
import { Talle } from "../../types/ITalle";


export interface ProductoDetalleDTO {
    id: number; // ID es `Long` en Java, así que `number` en TS
    precioCompra: number;
    stockActual: number;
    cantidad: number; // Revisa si este campo es realmente necesario para tu frontend
    stockMaximo: number;
    color: Color; // Usa el tipo Color que has definido (ej. enum o union string literal)
    talle: Talle; // Usa el tipo Talle que has definido (ej. enum o union string literal)
}
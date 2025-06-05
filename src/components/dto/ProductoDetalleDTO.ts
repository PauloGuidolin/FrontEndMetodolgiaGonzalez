import { Color } from "../../types/IColor";
import { Talle } from "../../types/ITalle";


export interface ProductoDetalleDTO {
    id?: number;
    precioCompra: number;
    stockActual: number;
    stockMaximo: number;
    color: Color; // Mapea a tu enum Color en el backend (ej. "ROJO", "AZUL")
    talle: Talle; // Mapea a tu enum Talle en el backend (ej. "S", "M", "L")
    cantidad?: number; // Usado en carritos, etc., no necesariamente en el CRUD
    active?: boolean; // Mapea a 'activo' en la entidad ProductoDetalle
    producto?: { id: number }; // Referencia simplificada al producto padre para evitar ciclos
    // Si necesitas más datos del producto padre aquí, es mejor fetcharlos por separado en el frontend.
}
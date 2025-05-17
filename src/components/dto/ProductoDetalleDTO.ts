import { Color } from "../../types/IColor";
import { Talle } from "../../types/ITalle";

export interface ProductoDetalleDTO {
  id: string; // ID del detalle
  color: Color; // <-- Usamos el Enum Color
  talle: Talle; // <-- Usamos el Enum Talle
  stockActual: number; // Stock para esta combinación de color/talla (basado en IProductoDetalle)
  precioCompra?: number;
}

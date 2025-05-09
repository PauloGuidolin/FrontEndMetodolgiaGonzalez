import { IBase } from './IBase';
import { IProducto } from './IProducto';
import { Color } from './IColor';
import { Talle } from './ITalle';

export interface IProductoDetalle extends IBase {
  producto?: IProducto;
  precioCompra?: number;
  stockActual?: number;
  cantidad?: number; // Aclarar su uso en el frontend
  stockMaximo?: number;
  color?: Color;
  talle?: Talle;
}
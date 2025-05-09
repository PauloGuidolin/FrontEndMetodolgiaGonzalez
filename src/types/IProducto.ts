import { IBase } from './IBase';
import { Sexo } from './ISexo';
import { ICategoria } from './ICategoria';
import { IImagen } from './IImagen';
import { IProductoDetalle } from './IProductoDetalle';
import { IDescuento } from './IDescuento';

export interface IProducto extends IBase {
  denominacion?: string;
  precioVenta?: number;
  sexo?: Sexo;
  tienePromocion?: boolean;
  categorias?: ICategoria[];
  imagenes?: IImagen[];
  productos_detalles?: IProductoDetalle[];
  descuentos?: IDescuento[];
}
import { IBase } from './IBase';
import { IOrdenCompra } from './IOrdenCompra';
import { IProductoDetalle } from './IProductoDetalle';

export interface IOrdenCompraDetalle extends IBase {
  ordenCompra?: IOrdenCompra;
  productoDetalle?: IProductoDetalle;
  cantidad?: number;
  subtotal?: number;
}
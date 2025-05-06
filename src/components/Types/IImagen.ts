import { IBase } from './IBase';
import { IProducto } from './IProducto';

export interface IImagen extends IBase {
  denominacion?: string;
  producto?: IProducto;
}
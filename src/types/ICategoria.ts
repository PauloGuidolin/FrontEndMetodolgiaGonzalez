
import { IBase } from './IBase';
import { IProducto } from './IProducto';

export interface ICategoria extends IBase {
  denominacion?: string;
  categoriaPadre?: ICategoria;
  subcategorias?: ICategoria[];
  productos?: IProducto[];
}
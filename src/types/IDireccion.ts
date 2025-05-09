import { IBase } from './IBase';
import { ICliente } from './ICliente';
import { ILocalidad } from './ILocalidad';

export interface IDireccion extends IBase {
  calle?: string;
  numero?: number;
  cp?: number;
  localidad?: ILocalidad;
  clientes?: ICliente[];
}
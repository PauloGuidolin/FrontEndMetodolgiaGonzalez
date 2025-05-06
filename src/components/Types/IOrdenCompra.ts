import { IBase } from './IBase';
import { IOrdenCompraDetalle } from './IOrdenCompraDetalle';

export interface IOrdenCompra extends IBase {
  total?: number;
  fechaCompra?: string; // LocalDateTime
  direccionEnvio?: string;
  detalles?: IOrdenCompraDetalle[];
}
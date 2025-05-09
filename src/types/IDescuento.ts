import { IBase } from './IBase';
import { IProducto } from './IProducto';

export interface IDescuento extends IBase {
  denominacion?: string;
  fechaDesde?: string; // LocalDate
  fechaHasta?: string; // LocalDate
  horaDesde?: string; // LocalTime
  horaHasta?: string; // LocalTime
  descripcionDescuento?: string;
  precioPromocional?: number;
  productos?: IProducto[];
}
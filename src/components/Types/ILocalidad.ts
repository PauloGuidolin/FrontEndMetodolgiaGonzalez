import { IBase } from './IBase';
import { IProvincia } from './IProvincia';

export interface ILocalidad extends IBase {
  nombre?: string;
  provincia?: IProvincia;
}
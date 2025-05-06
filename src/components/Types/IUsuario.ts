import { IBase } from './IBase';
import { Rol } from './IRol';
import { IImagen } from './IImagen';

export interface IUsuario extends IBase {
  auth0Id?: string;
  userName?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  dni?: number;
  rol?: Rol;
  imagenUser?: IImagen;
  password?: string; // Aunque en el frontend probablemente no lo manejes directamente
}
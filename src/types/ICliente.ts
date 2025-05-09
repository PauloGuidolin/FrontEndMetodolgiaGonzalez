import { IDireccion } from "./IDireccion";
import { IUsuario } from "./IUsuario";


export interface ICliente extends IUsuario {
  direcciones?: IDireccion[];
}
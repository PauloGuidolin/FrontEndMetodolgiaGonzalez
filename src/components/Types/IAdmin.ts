import { IUsuario } from "./IUsuario";


export interface IAdmin extends IUsuario {
  activo?: boolean;
}
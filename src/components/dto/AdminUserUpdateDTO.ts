import { Rol } from "../../types/IRol";

export interface AdminUserUpdateDTO {
    activo?: boolean; // Puede ser opcional
    rol?: Rol;       // Puede ser opcional
}
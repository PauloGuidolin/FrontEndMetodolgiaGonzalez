// src/types/dtos/UserDTO.ts

import { ImagenDTO } from "./ImagenDTO";
import { DireccionDTO } from "./DireccionDTO";
import { Sexo } from "../../types/ISexo";
import { Rol } from "../../types/IRol";
import { ProfileImage } from "../../types/ProfileImage";



export interface UserDTO {
    id: number;
    imagenUser?: ImagenDTO;
    username: string; // Corresponde a `userName` en la entidad Usuario
    firstname: string; // Corresponde a `nombre`
    lastname: string;  // Corresponde a `apellido`
    email: string;
    dni?: number | null;
    sexo?:Sexo;
    fechaNacimiento?: string | null; // `LocalDate` en backend -> `string` en frontend (YYYY-MM-DD)
    telefono?: string | null;
    role: Rol; // Corresponde a `rol`
    // profileImage?:ProfileImage; // Corresponde a `imagenUser`
    addresses?: DireccionDTO[] | null; // Corresponde a `direcciones`
    active: boolean;
}
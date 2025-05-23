import { LocalidadDTO } from "./location";

export interface DomicilioDTO {
    id?: number;
    calle: string;
    numero: number;
    piso?: string | null;
    departamento?: string | null;
    cp: number;
    localidad: LocalidadDTO | null; // <--- ¡CAMBIADO A UN OBJETO LocalidadDTO!
}
import { LocalidadDTO } from "./location";


export interface DireccionDTO {
    id?: number; // Long en Java -> number en TS
    calle: string;
    numero: number; // int en Java -> number en TS
    piso: string | null; // String en Java -> string | null en TS
    departamento: string | null; // String en Java -> string | null en TS
    cp: number; // int en Java -> number en TS
    localidad: LocalidadDTO | null; // Anidado
    active: boolean; // Asumido de Base
}
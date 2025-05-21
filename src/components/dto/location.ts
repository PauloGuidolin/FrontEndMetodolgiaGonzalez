

export interface ProvinciaDTO {
    id: number;
    nombre: string;
    // Agrega otros campos si tu entidad Provincia los tiene
}

export interface LocalidadDTO {
    id: number;
    nombre: string;
    provincia: ProvinciaDTO; // Asume que Localidad tiene un objeto Provincia anidado
    // Agrega otros campos si tu entidad Localidad los tiene
}
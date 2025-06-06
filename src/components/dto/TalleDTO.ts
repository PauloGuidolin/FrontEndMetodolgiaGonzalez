export interface TalleDTO {
    id: number; // El ID podría ser opcional para la creación, pero estará presente en la respuesta
    nombreTalle: string; // El nombre del talle (ej: "XS", "M", "TALLE_40")
    activo: boolean; // Indica si el talle está activo (para borrado lógico)
}
export interface ColorDTO {
    id: number; // El ID podría ser opcional para la creación, pero estará presente en la respuesta
    nombreColor: string; // El nombre del color (ej: "AZUL", "ROJO")
    activo: boolean; // Indica si el color está activo (para borrado lógico)
}


export interface DomicilioDTO {
    id?: number; // Opcional, ya que puede ser una nueva dirección sin ID
    calle: string;
    numero: number;
    piso?: string | null; // Puede ser opcional y nulo
    departamento?: string | null; // Puede ser opcional y nulo
    cp: number;
    localidadNombre: string;
    provinciaNombre: string;
}
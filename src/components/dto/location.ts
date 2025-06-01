
export interface ProvinciaDTO {
  id?: number;
  nombre: string;
  active: boolean;
}

// Coincide con LocalidadDTO del backend
export interface LocalidadDTO {
  id?: number;
  nombre: string;
  provincia?: ProvinciaDTO;
  active: boolean; // Anidado y opcional si la localidad puede no tener provincia
}

// Coincide con DireccionDTO del backend (antes DomicilioDTO en frontend)
// Es crucial que este DTO refleje 'piso' y 'departamento' como strings o null

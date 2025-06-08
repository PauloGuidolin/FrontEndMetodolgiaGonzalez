// src/types/dtos/DescuentoDTO.ts

export interface DescuentoDTO {
    id: number; // Long en Java -> number en TS
    denominacion: string;
    fechaDesde: string; // LocalDate en Java -> string (YYYY-MM-DD) en TS
    fechaHasta: string; // LocalDate en Java -> string (YYYY-MM-DD) en TS
    horaDesde: string; // LocalTime en Java -> string (HH:MM:SS) en TS
    horaHasta: string; // LocalTime en Java -> string (HH:MM:SS) en TS
    descripcionDescuento: string;
    precioPromocional: number; // Double en Java -> number en TS (factor)
    activo: boolean; // Asumido de Base
}
export interface CreateDescuentoDTO {
    porcentaje: number;
    fechaDesde: string;
    fechaHasta: string;
    activo?: boolean; // Puede ser opcional al crear
}
// src/types/dtos/DescuentoDTO.ts

export interface DescuentoDTO {
    id: number;
    denominacion: string;
    fechaDesde: string; // `LocalDate` en backend -> `string` en frontend (YYYY-MM-DD)
    fechaHasta: string; // `LocalDate` en backend -> `string` en frontend (YYYY-MM-DD)
    horaDesde: string; // `LocalTime` en backend -> `string` en frontend (HH:MM:SS)
    horaHasta: string; // `LocalTime` en backend -> `string` en frontend (HH:MM:SS)
    descripcionDescuento: string;
    precioPromocional: number; // Factor de descuento (ej. 0.15 para 15%)
}
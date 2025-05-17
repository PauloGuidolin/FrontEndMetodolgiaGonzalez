export interface DescuentoDTO {
    id: number;
    denominacion: string;
    fechaDesde: string; // O Date si los parseas
    fechaHasta: string; // O Date si los parseas
    horaDesde: string; // O Date/string
    horaHasta: string; // O Date/string
    descripcionDescuento: string;
    precioPromocional: number; // Asumiendo que es el factor de descuento (0.15 para 15%, 0.2 para 20%, etc.)
    // Añade aquí otras propiedades de Descuento si las necesitas en el frontend
}
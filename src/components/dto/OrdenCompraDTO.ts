import { CreateOrdenCompraDetalleDTO, OrdenCompraDetalleDTO } from './OrdenCompraDetalleDTO';
import { UserDTO } from './UserDTO';

export interface OrdenCompraDTO {
    id?: number; // ID opcional para cuando se recibe (ya existe)
    total?: number; // El backend lo calculará, pero lo podemos recibir
    fechaCompra?: string; // Esperamos un string ISO 8601 del backend debido a @JsonFormat
    direccionEnvio: string; // La dirección de envío principal para esta orden
    detalles: OrdenCompraDetalleDTO[]; // Array de los detalles recibidos
    usuario?: UserDTO; // Relacionar la orden con un usuario, opcional inicialmente
}

// Opcional: Interfaz para crear una orden (sin ID, total, fecha, que son generados por el backend)
export interface CreateOrdenCompraDTO {
    direccionEnvio: string;
    detalles: CreateOrdenCompraDetalleDTO[]; // Array de detalles a enviar para la creación
    usuarioId: number; // Para asociar la orden a un usuario existente
    // Considera si `telefono` o `direccionId` son realmente parte de este DTO
    // o si se manejan mediante la cadena `direccionEnvio` o DTOs separados.
    // Por simplicidad, los mantendremos si son relevantes para tu backend.
    telefono?: string;
}

import { UserDTO } from './UserDTO';
import { OrdenCompraDetalleDTO } from './OrdenCompraDetalleDTO';
import { CreateOrdenCompraDetalleDTO } from './MercadoPagoDTOs';
import { DireccionDTO } from './DireccionDTO';

export type EstadoOrdenCompra =
  | "PENDIENTE_PAGO"
  | "PAGADA"
  | "CANCELADA"
  | "EN_PREPARACION"
  | "EN_CAMINO"
  | "ENTREGADA";
// Coincide con OrdenCompraDTO del backend
export interface OrdenCompraDTO {
  id?: number;
  total: number; // BigDecimal en backend -> number en TS
  fechaCompra: string; // LocalDateTime en backend -> string (ISO 8601) en TS
  direccionEnvio?: string; // Opcional, podría ser redundante si usas `direccionId` o `nuevaDireccion`
  detalles: OrdenCompraDetalleDTO[];
  usuarioId: number; // Long en backend -> number en TS
  estadoOrden: EstadoOrdenCompra; // String en backend (enum) -> type en TS
  mercadopagoPreferenceId?: string; // Opcional, si aún no se ha generado
  mercadopagoPaymentId?: string; // Opcional, si aún no se ha completado el pago
  shippingOption: "delivery" | "pickup";
  shippingCost: number; // BigDecimal en backend -> number en TS
  buyerPhoneNumber: string;
  direccionId: number | null; // Long en backend -> number | null en TS
  nuevaDireccion: Partial<DireccionDTO> | null; // Coincide con DireccionDTO en el backend, ahora DomicilioDTO en frontend
  active: boolean;
}

// DTO para la creación de una nueva orden de compra, sin incluir campos de la respuesta del backend
// (como id, fechaCompra, total, subtotal de detalles, etc., que son generados por el backend)
export interface CreateOrdenCompraDTO {
  usuarioId: number;
  direccionEnvio: string; // Dirección completa formateada para el backend
  buyerPhoneNumber: string;
  shippingOption: "delivery" | "pickup";
  shippingCost: number;
  montoTotal: number;
  detalles: CreateOrdenCompraDetalleDTO[]; // Reutilizamos el DTO de Mercado Pago para los detalles
  direccionId: number | null;
  nuevaDireccion: Partial<DireccionDTO> | null;
  active: boolean;
}
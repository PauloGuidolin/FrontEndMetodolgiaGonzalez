// src/components/dto/OrdenCompraDTO.ts


import { CreateOrdenCompraDetalleDTO } from './MercadoPagoDTOs'; // Asegúrate de que esta ruta y DTO existan
import { DireccionDTO } from './DireccionDTO';
import { OrdenCompraDetalleDTO } from './OrdenCompraDetalleDTO';
import { UserInfoDTO } from './UserInfoDTO';


export type EstadoOrdenCompra =
  | "PENDIENTE_PAGO"
  | "PAGADA"
  | "CANCELADA"
  | "EN_PREPARACION"
  | "EN_CAMINO"
  | "ENTREGADA";

export interface OrdenCompraDTO {
  id: number;
  total: number;
  fechaCompra: string; // LocalDateTime a string (ISO 8601)
  direccionEnvio?: string;
  detalles: OrdenCompraDetalleDTO[];
  usuarioId: number;
  usuarioInfoDTO?: UserInfoDTO; // <<< ¡AGREGADO! Para el objeto de usuario anidado del backend
  estadoOrden: EstadoOrdenCompra;
  mercadopagoPreferenceId?: string;
  mercadopagoPaymentId?: string;
  shippingOption: "delivery" | "pickup";
  shippingCost: number;
  buyerPhoneNumber: string;
  direccionId: number | null;
  nuevaDireccion: DireccionDTO | null; // Puede ser un objeto Dirección completo, o null
}

export interface CreateOrdenCompraDTO {
  usuarioId: number;
  direccionEnvio?: string; // Considerar si es necesario o si ya lo cubren direccionId/nuevaDireccion
  buyerPhoneNumber: string;
  shippingOption: "delivery" | "pickup";
  shippingCost: number;
  montoTotal: number;
  detalles: CreateOrdenCompraDetalleDTO[];
  direccionId: number | null;
  nuevaDireccion: Partial<DireccionDTO> | null; // O DireccionDTO si siempre esperas todos los campos
  // active: boolean; // <<< ELIMINADO: El backend lo maneja
}


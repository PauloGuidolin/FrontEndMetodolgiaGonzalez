// src/components/dto/OrdenCompraDetalleDTO.ts

// Esta es la interfaz para cuando RECIBES un detalle de orden de compra desde el backend
// Es lo que ves cuando haces un GET a una OrdenCompra
// Coincide con OrdenCompraDetalleDTO del backend
export interface OrdenCompraDetalleDTO {
  id?: number;
  cantidad: number;
  precioUnitario: number; // BigDecimal en backend -> number en TS
  subtotal: number; // BigDecimal en backend -> number en TS
  ordenCompraId?: number; // Puede ser opcional si el detalle no está asociado aún
  productoDetalleId: number; // Long en backend -> number en TS
  productoDetalle: OrdenCompraDetalleProductoDetalleNestedDTO; // Anidado
  active: boolean;
}


export interface OrdenCompraDetalleProductoDetalleNestedDTO {
  id?: number;
  precioCompra: number; // BigDecimal en backend -> number en TS
  stockActual: number;
  stockMaximo: number;
  color: string;
  talle: string;
  productoDenominacion: string;
  active: boolean;
}
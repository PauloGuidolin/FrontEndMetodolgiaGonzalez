// src/components/dto/OrdenCompraDetalleDTO.ts

export interface OrdenCompraDetalleDTO {
  id?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  ordenCompraId?: number;
  productoDetalleId: number;
  productoDetalle: OrdenCompraDetalleProductoDetalleNestedDTO; // Esto es correcto y clave
  active: boolean;
}

export interface OrdenCompraDetalleProductoDetalleNestedDTO {
  id?: number;
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  color: string;
  talle: string;
  productoDenominacion: string; // Esto es correcto y clave
  active: boolean;
}
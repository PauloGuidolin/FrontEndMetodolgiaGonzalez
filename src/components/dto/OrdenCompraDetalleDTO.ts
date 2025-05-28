// src/components/dto/OrdenCompraDetalleDTO.ts

// Esta es la interfaz para cuando RECIBES un detalle de orden de compra desde el backend
// Es lo que ves cuando haces un GET a una OrdenCompra
export interface OrdenCompraDetalleDTO {
    id?: number;
    cantidad: number;
    subtotal?: number;
    ordenCompraId?: number;
    productoDetalleId?: number; // Este es el ID del ProductoDetalle
    productoDetalle?: { // El backend lo envía al consultar una OrdenCompra
        id?: number;
        precioCompra?: number;
        stockActual?: number;
        stockMaximo?: number;
        color?: string;
        talle?: string;
        productoDenominacion?: string;
    };
}

// Esta es la interfaz para cuando ENVÍAS un detalle de orden de compra al backend para CREAR/ACTUALIZAR
// Solo incluye los campos que el frontend proporciona
export interface CreateOrdenCompraDetalleDTO {
    // CAMBIO CLAVE AQUÍ: Usar 'productoDetalleId' en lugar de 'productoId'
    productoDetalleId: number; // EL ID del ProductoDetalle que el usuario seleccionó
    cantidad: number;
    // No incluyas 'subtotal' ni 'productoDetalle' aquí, el backend se encarga de eso
}
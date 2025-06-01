import { DireccionDTO } from "./DireccionDTO";
import { LocalidadDTO } from "./location";

// Asume que esta es la definición en tu archivo MercadoPagoDTOs.ts
export interface MercadoPagoItemRequestDTO {
    id: string;
    title: string;
    description: string;
    pictureUrl: string;
    categoryId: string;
    quantity: number;
    unitPrice: number; // <-- CAMBIADO A NUMBER
}

export interface MercadoPagoPreferenceRequestDTO {
    items: MercadoPagoItemRequestDTO[];
    external_reference: string;
    userId: number; // O string, según tu UserDTO
    payerName: string;
    payerLastName: string;
    payerEmail: string;
    buyerPhoneNumber: string;
    shippingOption: "delivery" | "pickup";
    shippingCost: number; // <-- CAMBIADO A NUMBER
    back_urls: {
        success: string;
        failure: string;
        pending: string;
    };
    auto_return: string;
    montoTotal: number; // <-- CAMBIADO A NUMBER
    direccionId: number | null;
    nuevaDireccion: Partial<DireccionDTO> | null; 
    detalles: CreateOrdenCompraDetalleDTO[];
    notification_url: string;
}

export interface CreateOrdenCompraDetalleDTO {
    productoDetalleId: number;
    cantidad: number;
    precioUnitario: number; // <-- CAMBIADO A NUMBER
}


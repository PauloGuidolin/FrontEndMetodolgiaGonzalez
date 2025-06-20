// src/services/productDetailService.ts

import { ProductoDetalleDTO } from "../components/dto/ProductoDetalleDTO";
// Asegúrate de que ProductoDetalleRequestDTO contenga los campos necesarios para crear/actualizar
// incluyendo el campo 'activo' si la administración lo va a controlar.
import { ProductoDetalleRequestDTO } from "../components/dto/ProductoRequestDTO"; // O la ruta correcta de tu DTO de solicitud

import { http } from "./httpService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

if (!API_BASE_URL) {
  console.error(
    "La variable de entorno VITE_API_BASE_URL no está definida. Configura tu archivo .env en la raíz del frontend."
  );
}

const PRODUCT_DETAIL_ENDPOINT = `${API_BASE_URL}/producto_detalle`;
const PRODUCT_DETAIL_DTO_ENDPOINT = `${API_BASE_URL}/producto_detalle/dto`;
// Añadimos el nuevo endpoint base para administración de detalles
const PRODUCT_DETAIL_ADMIN_ENDPOINT = `${API_BASE_URL}/producto_detalle/admin`;

export const productDetailService = {
  // --- Métodos para el CLIENTE (o vistas que solo muestran activos) ---

  getAll: async (): Promise<ProductoDetalleDTO[]> => {
    try {
      const response = await http.get<ProductoDetalleDTO[]>(
        `${PRODUCT_DETAIL_ENDPOINT}/dto`
      );
      return response || [];
    } catch (error) {
      console.error(
        "Error al obtener todos los detalles de producto (cliente):",
        error
      );
      throw error;
    }
  },

  getById: async (id: number | string): Promise<ProductoDetalleDTO> => {
    try {
      const response = await http.get<ProductoDetalleDTO>(
        `${PRODUCT_DETAIL_DTO_ENDPOINT}/${id}`
      );
      if (!response) {
        throw new Error(`Detalle de producto con ID ${id} no encontrado.`);
      }
      return response;
    } catch (error) {
      console.error(
        `Error al obtener el detalle de producto con ID ${id} (cliente):`,
        error
      );
      throw error;
    }
  },

  getAllByProductoId: async (
    productoId: number | string
  ): Promise<ProductoDetalleDTO[]> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/producto/${productoId}`;
    try {
      const response = await http.get<ProductoDetalleDTO[]>(url);
      return response || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error al obtener detalles de producto por ID de producto ${productoId} (cliente):`,
        error
      );
      throw error;
    }
  },

  getByProductoIdAndTalleAndColor: async (
    productoId: number | string,
    talleNombre: string,
    colorNombre: string
  ): Promise<ProductoDetalleDTO | null> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/buscar?productoId=${productoId}&talleNombre=${talleNombre}&colorNombre=${colorNombre}`;
    try {
      const response = await http.get<ProductoDetalleDTO>(url);
      return response || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return null;
      }
      console.error(
        `Error al obtener detalle de producto por ID de producto ${productoId}, talle ${talleNombre}, color ${colorNombre} (cliente):`,
        error
      );
      throw error;
    }
  },

  findAllByStockActualGreaterThan: async (
    stockMinimo: number | string
  ): Promise<ProductoDetalleDTO[]> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/stock-mayor-a/${stockMinimo}`;
    try {
      const response = await http.get<ProductoDetalleDTO[]>(url);
      return response || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error al obtener detalles de producto con stock mayor a ${stockMinimo} (cliente):`,
        error
      );
      throw error;
    }
  },

  filtrarPorOpciones: async (
    productoId?: number | string,
    colorNombre?: string,
    talleNombre?: string,
    stockMin?: number | string
  ): Promise<ProductoDetalleDTO[]> => {
    const queryParams = new URLSearchParams();
    if (productoId !== undefined && productoId !== null)
      queryParams.append("productoId", String(productoId));
    if (colorNombre !== undefined && colorNombre !== null)
      queryParams.append("colorNombre", colorNombre);
    if (talleNombre !== undefined && talleNombre !== null)
      queryParams.append("talleNombre", talleNombre);
    if (stockMin !== undefined && stockMin !== null)
      queryParams.append("stockMin", String(stockMin));

    const url = `${PRODUCT_DETAIL_ENDPOINT}/filtrar?${queryParams.toString()}`;
    try {
      const response = await http.get<ProductoDetalleDTO[]>(url);
      return response || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(`Error al filtrar detalles de producto (cliente):`, error);
      throw error;
    }
  },

  getAvailableTallesByProductoId: async (
    productoId: number | string
  ): Promise<string[]> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/talles/${productoId}`;
    try {
      const response = await http.get<string[]>(url);
      return response || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error al obtener talles disponibles para el ID de producto ${productoId} (cliente):`,
        error
      );
      throw error;
    }
  },

  getAvailableColoresByProductoId: async (
    productoId: number | string
  ): Promise<string[]> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/colores/${productoId}`;
    try {
      const response = await http.get<string[]>(url);
      return response || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error al obtener colores disponibles para el ID de producto ${productoId} (cliente):`,
        error
      );
      throw error;
    }
  },

  descontarStock: async (
    productoDetalleId: number | string,
    cantidad: number
  ): Promise<void> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/descontar-stock?productoDetalleId=${productoDetalleId}&cantidad=${cantidad}`;
    try {
      await http.post<void>(url, undefined);
    } catch (error) {
      console.error(
        `Error al descontar stock para ProductoDetalle ID ${productoDetalleId}:`,
        error
      );
      throw error;
    }
  },

  estaDisponible: async (
    productoId: number | string,
    talleNombre: string,
    colorNombre: string
  ): Promise<boolean> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/disponible?productoId=${productoId}&talleNombre=${talleNombre}&colorNombre=${colorNombre}`;
    try {
      const response = await http.get<boolean>(url);
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return false;
      }
      console.error(
        `Error al verificar la disponibilidad para el ID de producto ${productoId}, talle ${talleNombre}, color ${colorNombre}:`,
        error
      );
      throw error;
    }
  },

  create: async (
    productDetailData: Partial<ProductoDetalleRequestDTO>
  ): Promise<ProductoDetalleDTO> => {
    try {
      const response = await http.post<ProductoDetalleDTO>(
        PRODUCT_DETAIL_DTO_ENDPOINT,
        productDetailData
      );
      if (!response) {
        throw new Error(
          "No se recibió respuesta al crear el detalle de producto."
        );
      }
      return response;
    } catch (error) {
      console.error("Error al crear el detalle de producto:", error);
      throw error;
    }
  },

  update: async (
    id: number | string,
    productDetailData: ProductoDetalleRequestDTO
  ): Promise<ProductoDetalleDTO> => {
    if (!id) {
      throw new Error(
        "El ID del detalle de producto es necesario para actualizar."
      );
    }
    try {
      const response = await http.put<ProductoDetalleDTO>(
        `${PRODUCT_DETAIL_DTO_ENDPOINT}/${id}`,
        productDetailData
      );
      if (!response) {
        throw new Error(
          `No se recibió respuesta al actualizar el detalle de producto con ID ${id}.`
        );
      }
      return response;
    } catch (error) {
      console.error(
        `Error al actualizar el detalle de producto con ID ${id}:`,
        error
      );
      throw error;
    }
  },

  deactivate: async (id: number | string): Promise<void> => {
    // Este método ahora llama al endpoint DELETE que en el backend hace el soft delete
    try {
      await http.delete<void>(`${PRODUCT_DETAIL_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(
        `Error al desactivar (soft delete) el detalle de producto con ID ${id}:`,
        error
      );
      throw error;
    }
  }  // --- NUEVOS MÉTODOS PARA LA ADMINISTRACIÓN ---
  /**
   * @method getAllByProductoIdForAdmin
   * @description Obtiene todos los detalles de un producto (activos e inactivos) para la administración.
   * Corresponde al endpoint GET /producto_detalle/admin/producto/{productoId}.
   * @param {number | string} productoId El ID del producto principal.
   * @returns {Promise<ProductoDetalleDTO[]>} Una promesa que resuelve con la lista de detalles.
   * @throws {Error} Si la solicitud falla.
   */,

  getAllByProductoIdForAdmin: async (
    productoId: number | string
  ): Promise<ProductoDetalleDTO[]> => {
    const url = `${PRODUCT_DETAIL_ADMIN_ENDPOINT}/producto/${productoId}`;
    try {
      const response = await http.get<ProductoDetalleDTO[]>(url);
      return response || [];
    } catch (error) {
      console.error(
        `Error al obtener detalles de producto (ADMIN) por ID de producto ${productoId}:`,
        error
      );
      throw error;
    }
  }
  /**
   * @method activate
   * @description Activa un detalle de producto.
   * Corresponde al endpoint PUT /producto_detalle/admin/activate/{id}.
   * @param {number | string} id El ID del detalle a activar.
   * @returns {Promise<ProductoDetalleDTO>} Una promesa que resuelve con el detalle activado.
   * @throws {Error} Si la solicitud falla.
   */,

  activate: async (id: number | string): Promise<ProductoDetalleDTO> => {
    try {
      const response = await http.put<ProductoDetalleDTO>(
        `${PRODUCT_DETAIL_ADMIN_ENDPOINT}/activate/${id}`
      );
      if (!response) {
        throw new Error(
          `No se recibió respuesta al activar el detalle de producto con ID ${id}.`
        );
      }
      return response;
    } catch (error) {
      console.error(
        `Error al activar el detalle de producto con ID ${id}:`,
        error
      );
      throw error;
    }
  },
};

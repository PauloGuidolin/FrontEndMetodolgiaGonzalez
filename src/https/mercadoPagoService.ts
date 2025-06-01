// src/services/mercadoPagoService.ts


import { MercadoPagoPreferenceRequestDTO, MercadoPagoPreferenceResponseDTO } from "../components/dto/MercadoPagoDTOs";
import { http } from "./httpService"; // Asegúrate de que la ruta a tu httpService sea correcta

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida. Por favor, revisa tu archivo .env");
}

/**
 * Endpoint base para las operaciones de Mercado Pago en tu backend.
 * Coincide con @RequestMapping("/api/mercadopago") en tu MercadoPagoController.
 */
const MP_BASE_URL = `${API_BASE_URL}/api/mercadopago`;

/**
 * Servicio para interactuar con la API de Mercado Pago a través de tu backend.
 */
export const mercadoPagoService = {
  /**
   * Envía la solicitud de preferencia de pago al backend.
   * Coincide con el endpoint POST /api/mercadopago/create-preference.
   *
   * @param data Los datos de la preferencia que el backend necesita para crear la solicitud a Mercado Pago.
   * @returns Una promesa que resuelve con la respuesta del backend, que contiene el init_point de Mercado Pago.
   * @throws Un error si la solicitud falla (ej: problemas de red, errores del backend).
   */
  createPreference: async (
    data: MercadoPagoPreferenceRequestDTO
  ): Promise<MercadoPagoPreferenceResponseDTO> => {
    const url = `${MP_BASE_URL}/create-preference`;
    console.log("Enviando solicitud a backend MP:", url, data); // Para depuración
    try {
      // Usamos el método post de tu httpService
      const response = await http.post<MercadoPagoPreferenceResponseDTO>(url, data);
      console.log("Respuesta de backend MP:", response); // Para depuración
      return response;
    } catch (error: any) {
      console.error("Error al crear preferencia de Mercado Pago:", error);
      // Lanzamos el error para que el componente que llama lo pueda manejar
      throw error;
    }
  },

};
import { IDireccion } from "../types/IDireccion"; // Importamos la interfaz de Direccion
import { http } from "./httpService"; // Importamos el servicio HTTP base (ahora usa Axios)

// Obtenemos la URL base del servidor desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // Considera manejar esto de forma más robusta en un proyecto real
}

// Definimos el endpoint específico para direcciones
const ADDRESS_ENDPOINT = `${API_BASE_URL}/direcciones`; // Coincide con @RequestMapping("/direcciones")

/**
 * Servicio API para interactuar con los recursos de Direccion.
 * Estos endpoints probablemente requieren autenticación (ej. para gestionar las direcciones de un cliente).
 */
export const addressService = {
  /**
   * Obtiene todas las direcciones.
   * Coincide con GET /direcciones.
   * @returns Una Promesa que resuelve con un array de IDireccion.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IDireccion[]> => {
    const url = ADDRESS_ENDPOINT;
    // Este endpoint probablemente requiere autenticación (ADMIN)
    return http.get<IDireccion[]>(url);
  },

  /**
   * Obtiene una dirección por su ID.
   * Coincide con GET /direcciones/{id}.
   * @param id El ID de la dirección.
   * @returns Una Promesa que resuelve con un IDireccion.
   * @throws Un error si la solicitud falla o la dirección no se encuentra.
   */
  getById: async (id: number | string): Promise<IDireccion> => {
    const url = `${ADDRESS_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación (ej. para acceder a una dirección específica de un cliente)
    return http.get<IDireccion>(url);
  },

  /**
   * Obtiene todas las direcciones asociadas a una localidad.
   * Coincide con GET /direcciones/localidad/{idLocalidad}.
   * @param idLocalidad El ID de la localidad.
   * @returns Una Promesa que resuelve con un array de IDireccion.
   * @throws Un error si la solicitud falla.
   */
  getAllByLocalidadId: async (
    idLocalidad: number | string
  ): Promise<IDireccion[]> => {
    const url = `${ADDRESS_ENDPOINT}/localidad/${idLocalidad}`;
    // Este endpoint probablemente requiere autenticación
    try {
      const response = await http.get<IDireccion[]>(url);
      // Si el backend devuelve 200 con cuerpo null o lista vacía, devolvemos [].
      if (response === null) {
        return [];
      }
      return response;
    } catch (error) {
      // Si el backend devuelve 404 en caso de error, devolvemos [].
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error fetching addresses by localidad ID ${idLocalidad}:`,
        error
      );
      throw error; // Relanza otros errores
    }
  },

  /**
   * Obtiene todas las direcciones asociadas a un cliente.
   * Coincide con GET /direcciones/cliente/{idCliente}.
   * @param idCliente El ID del cliente.
   * @returns Una Promesa que resuelve con un array de IDireccion.
   * @throws Un error si la solicitud falla.
   */
  getAllByClienteId: async (
    idCliente: number | string
  ): Promise<IDireccion[]> => {
    const url = `${ADDRESS_ENDPOINT}/cliente/${idCliente}`;
    // Este endpoint probablemente requiere autenticación (el propio cliente o ADMIN)
    try {
      const response = await http.get<IDireccion[]>(url);
      // Si el backend devuelve 200 con cuerpo null o lista vacía, devolvemos [].
      if (response === null) {
        return [];
      }
      return response;
    } catch (error) {
      // Si el backend devuelve 404 en caso de error, devolvemos [].
      if (error instanceof Error && error.message.includes("Status: 404")) {
        return [];
      }
      console.error(
        `Error fetching addresses by cliente ID ${idCliente}:`,
        error
      );
      throw error; // Relanza otros errores
    }
  },

  // Métodos CRUD estándar (heredados de BaseController y expuestos por DireccionController)
  // Estos métodos probablemente requieren autenticación

  /**
   * Crea una nueva dirección.
   * Coincide con POST /direcciones.
   * @param addressData Los datos de la dirección a crear.
   * @returns Una Promesa que resuelve con la dirección creada.
   * @throws Un error si la solicitud falla.
   */
  create: async (addressData: Partial<IDireccion>): Promise<IDireccion> => {
    const url = ADDRESS_ENDPOINT;
    // Este endpoint probablemente requiere autenticación
    return http.post<IDireccion>(url, addressData);
  },

  /**
   * Actualiza una dirección existente.
   * Coincide con PUT /direcciones.
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo.
   * @param addressData Los datos de la dirección a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con la dirección actualizada.
   * @throws Un error si la solicitud falla.
   */
  update: async (addressData: IDireccion): Promise<IDireccion> => {
    // Esperamos el objeto completo con ID
    const url = ADDRESS_ENDPOINT;
    // Este endpoint probablemente requiere autenticación
    return http.put<IDireccion>(url, addressData);
  },

  /**
   * Elimina una dirección por su ID.
   * Coincide con DELETE /direcciones/{id}.
   * @param id El ID de la dirección a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
    const url = `${ADDRESS_ENDPOINT}/${id}`;
    // Este endpoint probablemente requiere autenticación
    return http.delete<void>(url);
  },
};

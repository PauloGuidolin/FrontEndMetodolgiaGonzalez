// src/services/productDetailService.ts (o donde tengas este archivo)


import { ProductoDetalleDTO } from '../components/dto/ProductoDetalleDTO';
import { Color } from '../types/IColor'; // Asumo que esta ruta sigue siendo correcta para Color
import { Talle } from '../types/ITalle'; // Asumo que esta ruta sigue siendo correcta para Talle
import { http } from './httpService'; // Importamos el servicio HTTP base

// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
// Usamos import.meta.env para Vite (ajusta si usas otra herramienta de build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida. Configura tu archivo .env en la raíz del frontend.");
  // En un proyecto real, considera una forma más robusta de manejar esto,
  // como lanzar un error para detener la aplicación si es crítica.
}

// Definimos el endpoint específico para detalles de producto
// Coincide con @RequestMapping("/producto_detalle") en ProductoDetalleController de tu backend
const PRODUCT_DETAIL_ENDPOINT = `${API_BASE_URL}/producto_detalle`;

/**
 * Servicio API para interactuar con los recursos de ProductoDetalle.
 * Nota: Los detalles de producto suelen obtenerse junto con la entidad Producto padre.
 * Interactuar directamente con ellos puede ser menos común, excepto para búsquedas específicas.
 * Algunos endpoints pueden ser públicos, otros pueden requerir autenticación de ADMIN.
 */
export const productDetailService = {

  /**
   * Obtiene todos los detalles de producto.
   * Coincide con el endpoint GET /producto_detalle (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de ProductoDetalleDTO.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<ProductoDetalleDTO[]> => {
    const url = PRODUCT_DETAIL_ENDPOINT;
    // Este endpoint podría ser público o requerir autenticación de ADMIN
    return http.get<ProductoDetalleDTO[]>(url);
  },

   /**
   * Obtiene un detalle de producto por su ID.
   * Coincide con el endpoint GET /producto_detalle/{id} (heredado de BaseController).
   * @param id El ID del detalle. Puede ser number o string.
   * @returns Una Promesa que resuelve con un ProductoDetalleDTO.
   * @throws Un error si la solicitud falla o el detalle no se encuentra.
   */
  getById: async (id: number | string): Promise<ProductoDetalleDTO> => {
    const url = `${PRODUCT_DETAIL_ENDPOINT}/${id}`;
    // Este endpoint probablemente es público
    return http.get<ProductoDetalleDTO>(url);
  },

  /**
   * Obtiene todos los detalles asociados a un producto.
   * Coincide con el endpoint GET /producto_detalle/producto/{productoId} en ProductoDetalleController.
   * @param productoId El ID del producto padre.
   * @returns Una Promesa que resuelve con un array de ProductoDetalleDTO.
   * @throws Un error si la solicitud falla.
   */
  getAllByProductoId: async (productoId: number | string): Promise<ProductoDetalleDTO[]> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/producto/${productoId}`;
       // Este endpoint probablemente es público
       try {
            const response = await http.get<ProductoDetalleDTO[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra detalles para el producto.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran detalles para el producto
            }
            console.error(`Error al obtener detalles de producto por ID de producto ${productoId}:`, error);
            throw error; // Relanza otros errores
        }
   },

   /**
   * Busca un detalle de producto por producto, talle y color.
   * Coincide con el endpoint GET /producto_detalle/buscar?productoId={productoId}&talle={talle}&color={color} en ProductoDetalleController.
   * @param productoId El ID del producto.
   * @param talle El talle.
   * @param color El color.
   * @returns Una Promesa que resuelve con un ProductoDetalleDTO o null.
   * @throws Un error si la solicitud falla.
   */
  getByProductoIdAndTalleAndColor: async (productoId: number | string, talle: Talle, color: Color): Promise<ProductoDetalleDTO | null> => {
       // Usamos query params para los parámetros
       const url = `${PRODUCT_DETAIL_ENDPOINT}/buscar?productoId=${productoId}&talle=${talle}&color=${color}`;
       // Este endpoint probablemente es público
        try {
          const response = await http.get<ProductoDetalleDTO>(url);
           // Tu backend devuelve un objeto ProductoDetalle o null, no 404 para no encontrado.
           // La lógica actual de httpService maneja 404 como error.
           // Si tu backend devuelve 200 con cuerpo null para no encontrado, http.get lo manejará bien.
           // Si devuelve 404, la lógica de httpService lanzará un error.
           // Ajusta el manejo si necesitas distinguir entre error de servidor y no encontrado.
           if (response === null) { // Si el backend devuelve 200 con cuerpo null
               return null;
           }
           return response;
      } catch (error) {
          // Tu backend puede devolver 404 en caso de error.
          if (error instanceof Error && error.message.includes('Status: 404')) {
              return null; // Si el backend devuelve 404 para no encontrado
          }
          console.error(`Error al obtener detalle de producto por ID de producto ${productoId}, talle ${talle}, color ${color}:`, error);
          throw error; // Relanza otros errores
      }
   },

   /**
   * Obtiene detalles de producto con stock mayor a un mínimo.
   * Coincide con el endpoint GET /producto_detalle/stock-mayor-a/{stockMinimo} en ProductoDetalleController.
   * @param stockMinimo El stock mínimo.
   * @returns Una Promesa que resuelve con un array de ProductoDetalleDTO.
   * @throws Un error si la solicitud falla.
   */
  findAllByStockActualGreaterThan: async (stockMinimo: number | string): Promise<ProductoDetalleDTO[]> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/stock-mayor-a/${stockMinimo}`;
       // Este endpoint podría requerir autenticación (ej. ADMIN)
       try {
            const response = await http.get<ProductoDetalleDTO[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra detalles.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran detalles
            }
            console.error(`Error al obtener detalles de producto con stock mayor a ${stockMinimo}:`, error);
            throw error; // Relanza otros errores
        }
   },

   /**
   * Filtra detalles de producto por varias opciones (producto, color, talle, stock mínimo).
   * Coincide con el endpoint GET /producto_detalle/filtrar?productoId={productoId}&color={color}&talle={talle}&stockMin={stockMin} en ProductoDetalleController.
   * @param productoId El ID del producto (opcional).
   * @param color El color (opcional).
   * @param talle El talle (opcional).
   * @param stockMin El stock mínimo (opcional).
   * @returns Una Promesa que resuelve con un array de ProductoDetalleDTO.
   * @throws Un error si la solicitud falla.
   */
  filtrarPorOpciones: async (
      productoId?: number | string,
      color?: Color,
      talle?: Talle,
      stockMin?: number | string
    ): Promise<ProductoDetalleDTO[]> => {
       // Construimos la URL con los query params presentes
       const queryParams = new URLSearchParams();
       if (productoId !== undefined && productoId !== null) queryParams.append('productoId', String(productoId));
       if (color !== undefined && color !== null) queryParams.append('color', color);
       if (talle !== undefined && talle !== null) queryParams.append('talle', talle);
       if (stockMin !== undefined && stockMin !== null) queryParams.append('stockMin', String(stockMin));

       const url = `${PRODUCT_DETAIL_ENDPOINT}/filtrar?${queryParams.toString()}`;
       // Este endpoint podría ser público o requerir autenticación
       try {
            const response = await http.get<ProductoDetalleDTO[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra detalles.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran detalles
            }
            console.error(`Error al filtrar detalles de producto:`, error);
            throw error; // Relanza otros errores
        }
   },

   /**
   * Obtiene los talles disponibles para un producto.
   * Coincide con el endpoint GET /producto_detalle/talles/{productoId} en ProductoDetalleController.
   * @param productoId El ID del producto.
   * @returns Una Promesa que resuelve con un array de Talle.
   * @throws Un error si la solicitud falla.
   */
  getAvailableTallesByProductoId: async (productoId: number | string): Promise<Talle[]> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/talles/${productoId}`;
       // Este endpoint probablemente es público
       try {
            const response = await http.get<Talle[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra talles.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran talles
            }
            console.error(`Error al obtener talles disponibles para el ID de producto ${productoId}:`, error);
            throw error; // Relanza otros errores
        }
   },

    /**
   * Obtiene los colores disponibles para un producto.
   * Coincide con el endpoint GET /producto_detalle/colores/{productoId} en ProductoDetalleController.
   * @param productoId El ID del producto.
   * @returns Una Promesa que resuelve con un array de Color.
   * @throws Un error si la solicitud falla.
   */
  getAvailableColoresByProductoId: async (productoId: number | string): Promise<Color[]> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/colores/${productoId}`;
       // Este endpoint probablemente es público
       try {
            const response = await http.get<Color[]>(url);
             // Tu backend podría devolver una lista vacía [] si no encuentra colores.
             // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
             if (response === null) { // Si el backend devuelve 200 con cuerpo null
                 return [];
             }
             return response;
        } catch (error) {
             // Tu backend puede devolver 404 en caso de error.
             if (error instanceof Error && error.message.includes('Status: 404')) {
                return []; // Retorna un array vacío si no se encuentran colores
            }
            console.error(`Error al obtener colores disponibles para el ID de producto ${productoId}:`, error);
            throw error; // Relanza otros errores
        }
   },

   /**
   * Descuenta stock de un detalle de producto.
   * Coincide con el endpoint POST /producto_detalle/descontar-stock?productoDetalleId={id}&cantidad={cantidad} en ProductoDetalleController.
   * @param productoDetalleId El ID del detalle de producto.
   * @param cantidad La cantidad a descontar.
   * @returns Una Promesa que resuelve cuando la operación es exitosa.
   * @throws Un error si la solicitud falla (ej. stock insuficiente - Status 400 o 500).
   */
  descontarStock: async (productoDetalleId: number | string, cantidad: number): Promise<void> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/descontar-stock?productoDetalleId=${productoDetalleId}&cantidad=${cantidad}`;
       // Este endpoint probablemente requiere autenticación (ej. al finalizar una compra)
       // Nota: Tu backend usa POST con query params, lo cual es menos común que usar PUT con body,
       // pero respetamos tu definición de endpoint.
       // El httpService base espera un body para POST, pasamos undefined ya que no hay body explícito.
       return http.post<void>(url, undefined);
   },

    /**
   * Verifica si un producto detalle está disponible (stock > 0).
   * Coincide con el endpoint GET /producto_detalle/disponible?productoId={id}&talle={talle}&color={color} en ProductoDetalleController.
   * @param productoId El ID del producto.
   * @param talle El talle.
   * @param color El color.
   * @returns Una Promesa que resuelve con un boolean.
   * @throws Un error si la solicitud falla.
   */
  estaDisponible: async (productoId: number | string, talle: Talle, color: Color): Promise<boolean> => {
       const url = `${PRODUCT_DETAIL_ENDPOINT}/disponible?productoId=${productoId}&talle=${talle}&color=${color}`;
       // Este endpoint probablemente es público
       try {
           const response = await http.get<boolean>(url);
            // Tu backend devuelve un boolean, no null o 404 para no encontrado (asumimos).
            // Si devuelve 404 en caso de error, la lógica de httpService lo manejará.
            if (response === null) { // Si el backend devuelve 200 con cuerpo null (inesperado para boolean)
                // Podrías querer lanzar un error o devolver false dependiendo de tu lógica
                return false; // Asumimos que null significa no disponible
            }
           return response;
       } catch (error) {
           // Tu backend puede devolver 404 en caso de error.
           if (error instanceof Error && error.message.includes('Status: 404')) {
              // Si 404 significa que el detalle no existe, entonces no está disponible.
              return false;
          }
           console.error(`Error al verificar la disponibilidad para el ID de producto ${productoId}, talle ${talle}, color ${color}:`, error);
           throw error; // Relanza otros errores
       }
   },


  // --- Métodos CRUD estándar (heredados de BaseController y expuestos por ProductoDetalleController) ---
  // Estos métodos probablemente requieren autenticación (ej. rol ADMIN)

  /**
   * Crea un nuevo detalle de producto.
   * Coincide con el endpoint POST /producto_detalle (heredado de BaseController).
   * @param productDetailData Los datos del detalle a crear.
   * @returns Una Promesa que resuelve con el detalle creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (productDetailData: Partial<ProductoDetalleDTO>): Promise<ProductoDetalleDTO> => {
      const url = PRODUCT_DETAIL_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<ProductoDetalleDTO>(url, productDetailData);
  },

  /**
   * Actualiza un detalle de producto existente.
   * Coincide con el endpoint PUT /producto_detalle (heredado de BaseController).
   * Nota: Tu PUT en BaseController espera el ID de la entidad en el cuerpo de la solicitud, no en la URL.
   * @param productDetailData Los datos del detalle a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el detalle actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (productDetailData: ProductoDetalleDTO): Promise<ProductoDetalleDTO> => { // Esperamos el objeto completo con ID
      const url = PRODUCT_DETAIL_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<ProductoDetalleDTO>(url, productDetailData);
  },

  /**
   * Elimina un detalle de producto por su ID.
   * Coincide con el endpoint DELETE /producto_detalle/{id} (heredado de BaseController).
   * @param id El ID del detalle a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${PRODUCT_DETAIL_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};
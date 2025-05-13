// Archivo: src/https/productApi.ts (Ajustado a tu estructura de carpetas)

import { ProductoDTO } from '../components/dto/ProductoDTO';
import { IProducto } from '../types/IProducto'; // Importamos la interfaz de Producto
import { http } from './httpService'; // Importamos el servicio HTTP base (ahora usa Axios)


// Obtenemos la URL base del servidor desde las variables de entorno (http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificamos si la URL base está configurada
if (!API_BASE_URL) {
  console.error("La variable de entorno VITE_API_BASE_URL no está definida.");
  // Considera una forma más robusta de manejar esto en un proyecto real
}

// Definimos el endpoint específico para productos
// Coincide con @RequestMapping("/productos") en ProductoController
const PRODUCT_ENDPOINT = `${API_BASE_URL}/productos`;

// Eliminamos la definición inline de ProductoDTO aquí.
// Ahora importamos ProductoDTO desde '../../dto/ProductoDTO'.


/**
 * Servicio API para interactuar con los recursos de Producto.
 * Algunos endpoints pueden ser públicos (ej. obtener todos, buscar por nombre),
 * otros pueden requerir autenticación de ADMIN (ej. crear/actualizar/eliminar).
 */
export const productService = {

  /**
   * Obtiene todos los productos del backend.
   * Coincide con GET /productos (heredado de BaseController).
   * @returns Una Promesa que resuelve con un array de IProducto.
   * @throws Un error si la solicitud falla.
   */
  getAll: async (): Promise<IProducto[]> => {
    const url = PRODUCT_ENDPOINT;
    // Este endpoint probablemente es público
    return http.get<IProducto[]>(url);
  },

   /**
   * Obtiene un producto por su ID.
   * Coincide con GET /productos/{id} (heredado de BaseController).
   * @param id El ID del producto.
   * @returns Una Promesa que resuelve con un IProducto.
   * @throws Un error si la solicitud falla o el producto no se encuentra.
   */
  getById: async (id: number | string): Promise<IProducto> => {
    const url = `${PRODUCT_ENDPOINT}/${id}`;
    // Este endpoint probablemente es público
    return http.get<IProducto>(url);
  },

  /**
   * Busca productos por palabra clave en la denominación.
   * Coincide con GET /productos/buscar?keyword={keyword} en ProductoController.
   * @param keyword La palabra clave a buscar.
   * @returns Una Promesa que resuelve con un array de IProducto.
   * @throws Un error si la solicitud falla.
   */
  buscarPorNombre: async (keyword: string): Promise<IProducto[]> => {
      const url = `${PRODUCT_ENDPOINT}/buscar?keyword=${encodeURIComponent(keyword)}`;
      // Este endpoint probablemente es público
      return http.get<IProducto[]>(url);
  },

  /**
   * Obtiene todos los productos en formato DTO (con precio final y URLs de imagen).
   * Coincide con GET /productos/dto en ProductoController.
   * @returns Una Promesa que resuelve con un array de ProductoDTO.
   * @throws Un error si la solicitud falla.
   */
  getAllDTO: async (): Promise<ProductoDTO[]> => {
      const url = `${PRODUCT_ENDPOINT}/dto`;
      // Este endpoint probablemente es público
      return http.get<ProductoDTO[]>(url);
  },

   /**
   * Obtiene un producto específico en formato DTO por su ID.
   * Coincide con GET /productos/dto/{id} en ProductoController.
   * @param id El ID del producto.
   * @returns Una Promesa que resuelve con un ProductoDTO o null si no se encuentra.
   * @throws Un error si la solicitud falla.
   */
  getDTOSById: async (id: number | string): Promise<ProductoDTO | null> => {
      const url = `${PRODUCT_ENDPOINT}/dto/${id}`;
      // Este endpoint probablemente es público
      try {
          return await http.get<ProductoDTO>(url);
      } catch (error) {
          // Tu backend devuelve 404 para "no encontrado" en este caso.
          if (error instanceof Error && error.message.includes('Status: 404')) {
              return null;
          }
          throw error; // Relanza otros errores
      }
   },

   /**
   * Obtiene productos con promoción en formato DTO.
   * Coincide con GET /productos/dto/promociones en ProductoController.
   * @returns Una Promesa que resuelve con un array de ProductoDTO.
   * @throws Un error si la solicitud falla.
   */
  getPromotionalDTOs: async (): Promise<ProductoDTO[]> => {
      const url = `${PRODUCT_ENDPOINT}/dto/promociones`;
      // Este endpoint probablemente es público
      return http.get<ProductoDTO[]>(url);
  },


  // Métodos CRUD estándar (heredados de BaseController y expuestos por ProductoController)
  /**
   * Crea un nuevo producto.
   * Coincide con POST /productos (heredado de BaseController).
   * @param productData Los datos del producto a crear.
   * @returns Una Promesa que resuelve con el producto creado.
   * @throws Un error si la solicitud falla.
   */
  create: async (productData: Partial<IProducto>): Promise<IProducto> => {
      const url = PRODUCT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.post<IProducto>(url, productData);
  },

  /**
   * Actualiza un producto existente.
   * Coincide con PUT /productos (heredado de BaseController).
   * Nota: Tu PUT en BaseController no usa ID en la URL, sino en el cuerpo.
   * @param productData Los datos del producto a actualizar (debe incluir el ID).
   * @returns Una Promesa que resuelve con el producto actualizado.
   * @throws Un error si la solicitud falla.
   */
  update: async (productData: IProducto): Promise<IProducto> => { // Esperamos el objeto completo con ID
      const url = PRODUCT_ENDPOINT;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.put<IProducto>(url, productData);
  },

  /**
   * Elimina un producto por su ID.
   * Coincide con DELETE /productos/{id} (heredado de BaseController).
   * @param id El ID del producto a eliminar.
   * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
   * @throws Un error si la solicitud falla.
   */
  delete: async (id: number | string): Promise<void> => {
      const url = `${PRODUCT_ENDPOINT}/${id}`;
      // Este endpoint probablemente requiere autenticación (ADMIN)
      return http.delete<void>(url);
  },
};

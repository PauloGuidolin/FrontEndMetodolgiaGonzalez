// Archivo: src/store/productStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IProducto } from '../types/IProducto'; // Importa la interfaz de Producto (aún necesaria si usas otras acciones CRUD)
import { ProductoDTO } from '../components/dto/ProductoDTO';
import { productService } from '../https/productApi';



// Definimos la interfaz para el estado de nuestro store de productos
interface ProductState {
  // CAMBIO AQUÍ: El estado 'products' ahora será ProductoDTO[]
  products: ProductoDTO[]; // Lista general de productos en formato DTO
  loading: boolean;
  error: string | null;

  // Estado para un producto individual seleccionado o buscado (puede ser IProducto o ProductoDTO)
  // Si tu getById del servicio devuelve IProducto, mantén IProducto aquí.
  // Si tu getDTOSById devuelve ProductoDTO, podrías añadir otro estado para el DTO seleccionado.
  selectedProduct: IProducto | null; // O ProductoDTO | null si usas getDTOSById
  loadingProduct: boolean;
  errorProduct: string | null;

  // Estado para productos obtenidos por búsqueda (si necesitas mantener esa lista separada)
  // Si buscarPorNombre devuelve IProducto[], mantén IProducto[] aquí.
  searchResults: IProducto[]; // O ProductoDTO[] si tu buscarPorNombre devolviera DTOs
  loadingSearch: boolean;
  errorSearch: string | null;
  // searchTerm: string; // Opcional: para rastrear el término de búsqueda

  // Estado para productos con promoción (ya era ProductoDTO[])
  promotionalProducts: ProductoDTO[]; // Tu endpoint devuelve DTOs aquí
  loadingPromotional: boolean;
  errorPromotional: string | null;


  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // CAMBIO AQUÍ: fetchProducts ahora poblará 'products' con ProductoDTO[]
  fetchProducts: () => Promise<void>;

  // Acción para obtener un producto individual por ID (si devuelve IProducto)
  fetchProductById: (id: number | string) => Promise<void>;

  // Si necesitas obtener un producto individual como DTO:
  // fetchProductDTOById: (id: number | string) => Promise<void>;

  // Acción para buscar productos por nombre (si devuelve IProducto[])
  searchProductsByName: (keyword: string) => Promise<void>;

  // Acción para obtener productos con promoción en formato DTO (ya existía)
  fetchPromotionalProducts: () => Promise<void>;

  // Acciones CRUD para gestionar productos (probablemente para ADMIN)
  // Estas acciones probablemente trabajan con la entidad IProducto completa
  addProduct: (productData: Partial<IProducto>) => Promise<IProducto>;
  updateProduct: (product: IProducto) => Promise<IProducto>;
  deleteProduct: (id: number | string) => Promise<void>;

  // Acción para limpiar el producto seleccionado
  clearSelectedProduct: () => void;

  // Acción para limpiar los resultados de búsqueda
  clearSearchResults: () => void;
}

// Creamos el store usando la función create de Zustand
export const useProductStore = create<ProductState>((set, get) => ({
  // Estado inicial para la lista general de productos
  // CAMBIO AQUÍ: Inicializamos como array vacío de ProductoDTO
  products: [],
  loading: false,
  error: null,

  // Estado inicial para producto individual
  selectedProduct: null, // O null de ProductoDTO si usas getDTOSById
  loadingProduct: false,
  errorProduct: null,

  // Estado inicial para resultados de búsqueda
  searchResults: [], // O array vacío de ProductoDTO
  loadingSearch: false,
  errorSearch: null,
  // searchTerm: '',

  // Estado inicial para productos promocionales (ya era correcto)
  promotionalProducts: [],
  loadingPromotional: false,
  errorPromotional: null,

  // Implementación de la acción fetchProducts
  fetchProducts: async () => {
    set({ loading: true, error: null });

    try {
      // CAMBIO AQUÍ: Llama a la función getAllDTO del servicio API (devuelve ProductoDTO[])
      const productsData = await productService.getAllDTO();
      // CAMBIO AQUÍ: Actualizamos el estado 'products' con los datos de ProductoDTO
      set({ products: productsData, loading: false });
    } catch (error) {
      console.error("Error fetching all products (DTOs) in store:", error);
      set({
        error: `Failed to load products: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchProductById (si devuelve IProducto)
  fetchProductById: async (id: number | string) => {
      set({ loadingProduct: true, errorProduct: null, selectedProduct: null });
      try {
          // Llama a la función getById del servicio API (devuelve IProducto)
          const productData = await productService.getById(id);
          set({ selectedProduct: productData, loadingProduct: false });
      } catch (error) {
          console.error(`Error fetching product with ID ${id} in store:`, error);
          set({
              errorProduct: `Failed to load product: ${error instanceof Error ? error.message : String(error)}`,
              loadingProduct: false,
              selectedProduct: null, // Asegura que selectedProduct sea null en caso de error
          });
      }
  },

  // Implementación de la acción fetchProductDTOById (si la añades)
  /*
  fetchProductDTOById: async (id: number | string) => {
       set({ loadingProduct: true, errorProduct: null, selectedProduct: null }); // Podrías usar otro estado si quieres
       try {
           const productData = await productService.getDTOSById(id);
           // Podrías guardar esto en selectedProduct o en otro estado como selectedProductDTO
           set({ selectedProduct: productData, loadingProduct: false }); // Si selectedProduct es ProductoDTO | null
       } catch (error) {
           console.error(`Error fetching product DTO with ID ${id} in store:`, error);
           set({
               errorProduct: `Failed to load product DTO: ${error instanceof Error ? error.message : String(error)}`,
               loadingProduct: false,
               selectedProduct: null,
           });
       }
  },
  */


  // Implementación de la acción searchProductsByName (si devuelve IProducto[])
  searchProductsByName: async (keyword: string) => {
      set({ loadingSearch: true, errorSearch: null /*, searchTerm: keyword*/ });
      try {
          // Llama a la función buscarPorNombre del servicio API (devuelve IProducto[])
          const searchResultsData = await productService.buscarPorNombre(keyword);
          set({ searchResults: searchResultsData, loadingSearch: false });
      } catch (error) {
          console.error(`Error searching products by name "${keyword}" in store:`, error);
           set({
              errorSearch: `Failed to search products: ${error instanceof Error ? error.message : String(error)}`,
              loadingSearch: false,
              searchResults: [], // Limpiar la lista en caso de error
          });
      }
  },

   // Implementación de la acción fetchPromotionalProducts (ya era correcta)
  fetchPromotionalProducts: async () => {
      set({ loadingPromotional: true, errorPromotional: null });
      try {
          // Llama a la función getPromotionalDTOs del servicio API (devuelve ProductoDTO[])
          const promotionalData = await productService.getPromotionalDTOs();
          set({ promotionalProducts: promotionalData, loadingPromotional: false });
      } catch (error) {
          console.error("Error fetching promotional products in store:", error);
           set({
              errorPromotional: `Failed to load promotional products: ${error instanceof Error ? error.message : String(error)}`,
              loadingPromotional: false,
              promotionalProducts: [], // Limpiar la lista en caso de error
          });
      }
  },


  // Implementación de las acciones CRUD (probablemente trabajan con IProducto)
  addProduct: async (productData: Partial<IProducto>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newProduct = await productService.create(productData);
          // Opcional: Si quieres añadir el nuevo producto a la lista 'products' (que ahora es DTO[]),
          // necesitarías convertir el IProducto recibido a ProductoDTO si tu backend no lo hace al crear.
          // set(state => ({ products: [...state.products, convertIProductoToProductoDTO(newProduct)] })); // Ejemplo de conversión
          // set({ loading: false });
          return newProduct; // Devuelve la entidad creada (IProducto)
      } catch (error) {
          console.error("Error adding product in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add product: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  updateProduct: async (product: IProducto) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedProduct = await productService.update(product);
           // Opcional: Si quieres actualizar el producto en la lista 'products' (DTO[]),
           // necesitarías convertir el IProducto recibido a ProductoDTO.
           // set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? convertIProductoToProductoDTO(updatedProduct) : p) })); // Ejemplo de conversión
           // set({ loading: false });
           return updatedProduct; // Devuelve la entidad actualizada (IProducto)
      } catch (error) {
          console.error("Error updating product in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update product: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  deleteProduct: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await productService.delete(id);
          // Opcional: Eliminar el producto de la lista 'products' (DTO[])
          // set(state => ({ products: state.products.filter(p => p.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting product with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete product: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },


  // Implementación de la acción clearSelectedProduct
  clearSelectedProduct: () => set({ selectedProduct: null, errorProduct: null, loadingProduct: false }),

  // Implementación de la acción clearSearchResults
  clearSearchResults: () => set({ searchResults: [], errorSearch: null, loadingSearch: false }),
}));

// Nota: Si necesitas convertir IProducto a ProductoDTO en el frontend,
// podrías crear una función de utilidad para ello.
// function convertIProductoToProductoDTO(producto: IProducto): ProductoDTO {
//     // Implementa la lógica de mapeo aquí
//     return {
//         id: producto.id,
//         denominacion: producto.denominacion,
//         precioOriginal: producto.precioVenta, // O alguna lógica para calcular el precio original
//         precioFinal: /* lógica para calcular precio con descuento */,
//         categorias: producto.categorias?.map(cat => cat.denominacion) || [],
//         sexo: producto.sexo,
//         tienePromocion: producto.tienePromocion,
//         imagenes: producto.imagenes?.map(img => img.denominacion) || [], // Asumiendo que denominacion es la URL
//     };
// }

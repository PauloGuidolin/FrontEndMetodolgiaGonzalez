// Archivo: src/store/categoryStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { ICategoria } from '../types/ICategoria'; // Importa la interfaz de Categoria (asegúrate de la ruta)
import { categoryService } from '../https/categoryApi';


// Definimos la interfaz para el estado de nuestro store de categorias
interface CategoryState {
  // Estado para la lista general de categorías
  categories: ICategoria[];
  loading: boolean;
  error: string | null;

  // Estado para categorías raíz (sin padre)
  rootCategories: ICategoria[];
  loadingRoot: boolean;
  errorRoot: string | null;

  // Estado para subcategorías de una categoría padre (podrías necesitar un estado para el ID padre actual)
  subcategories: ICategoria[];
  loadingSubcategories: boolean;
  errorSubcategories: string | null;
  // currentParentCategoryId: number | string | null; // Opcional: para rastrear de qué padre son las subcategorías

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las categorías
  fetchCategories: () => Promise<void>;

  // Acción para obtener categorías raíz
  fetchRootCategories: () => Promise<void>;

  // Acción para obtener subcategorías de una categoría padre
  fetchSubcategories: (idPadre: number | string) => Promise<void>;

  // Acciones CRUD para gestionar categorías
  addCategory: (categoryData: Partial<ICategoria>) => Promise<ICategoria>;
  updateCategory: (category: ICategoria) => Promise<ICategoria>;
  deleteCategory: (id: number | string) => Promise<void>;

  // Puedes añadir otras acciones si son necesarias (ej. setSelectedCategory, clearSelectedCategory)
  // selectedCategory: ICategoria | null;
  // setSelectedCategory: (category: ICategoria | null) => void;
}

// Creamos el store usando la función create de Zustand
export const useCategoryStore = create<CategoryState>((set, get) => ({
  // Estado inicial
  categories: [],
  loading: false,
  error: null,

  rootCategories: [],
  loadingRoot: false,
  errorRoot: null,

  subcategories: [],
  loadingSubcategories: false,
  errorSubcategories: null,
  // currentParentCategoryId: null,

  // Implementación de la acción fetchCategories
  fetchCategories: async () => {
    set({ loading: true, error: null });

    try {
      const categoriesData = await categoryService.getAll();
      set({ categories: categoriesData, loading: false });
    } catch (error) {
      console.error("Error fetching all categories in store:", error);
      set({
        error: `Failed to load categories: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchRootCategories
  fetchRootCategories: async () => {
    set({ loadingRoot: true, errorRoot: null });

    try {
      const rootCategoriesData = await categoryService.getRootCategories();
      set({ rootCategories: rootCategoriesData, loadingRoot: false });
    } catch (error) {
      console.error("Error fetching root categories in store:", error);
      set({
        errorRoot: `Failed to load root categories: ${error instanceof Error ? error.message : String(error)}`,
        loadingRoot: false,
      });
    }
  },

  // Implementación de la acción fetchSubcategories
  fetchSubcategories: async (idPadre: number | string) => {
      set({ loadingSubcategories: true, errorSubcategories: null /*, currentParentCategoryId: idPadre*/ });

      try {
          const subcategoriesData = await categoryService.getSubcategories(idPadre);
          set({ subcategories: subcategoriesData, loadingSubcategories: false });
      } catch (error) {
          console.error(`Error fetching subcategories for parent ID ${idPadre} in store:`, error);
          set({
              errorSubcategories: `Failed to load subcategories: ${error instanceof Error ? error.message : String(error)}`,
              loadingSubcategories: false,
              // Opcional: Limpiar la lista de subcategorías en caso de error
              // subcategories: [],
          });
      }
  },

  // Implementación de la acción addCategory
  addCategory: async (categoryData: Partial<ICategoria>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newCategory = await categoryService.create(categoryData);
          // Opcional: Actualizar listas relevantes en el store después de crear
          // set(state => ({ categories: [...state.categories, newCategory] }));
          // Si la nueva categoría es raíz, añadirla a rootCategories
          // if (!newCategory.categoriaPadre) { set(state => ({ rootCategories: [...state.rootCategories, newCategory] })); }
          // Si la nueva categoría es subcategoría del padre actual, añadirla a subcategories
          // if (newCategory.categoriaPadre?.id === get().currentParentCategoryId) { set(state => ({ subcategories: [...state.subcategories, newCategory] })); }
          // set({ loading: false });
          return newCategory; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding category in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add category: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateCategory
  updateCategory: async (category: ICategoria) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedCategory = await categoryService.update(category);
           // Opcional: Actualizar listas relevantes en el store después de actualizar
           // set(state => ({
           //     categories: state.categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat),
           //     rootCategories: state.rootCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat), // Actualiza en la lista raíz si está ahí
           //     subcategories: state.subcategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat), // Actualiza en la lista de subcategorías si está ahí
           // }));
           // set({ loading: false });
           return updatedCategory; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating category in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update category: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteCategory
  deleteCategory: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await categoryService.delete(id);
          // Opcional: Eliminar la categoría de las listas relevantes en el store después de eliminar
          // set(state => ({
          //     categories: state.categories.filter(cat => cat.id !== id),
          //     rootCategories: state.rootCategories.filter(cat => cat.id !== id),
          //     subcategories: state.subcategories.filter(cat => cat.id !== id),
          // }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting category with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete category: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción setSelectedCategory (si la añades)
  // setSelectedCategory: (category: ICategoria | null) => set({ selectedCategory: category }),
}));

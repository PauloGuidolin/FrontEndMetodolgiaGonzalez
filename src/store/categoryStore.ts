// src/store/categoryStore.ts

import { create } from 'zustand';
import { produce } from 'immer'; // Importa produce para manejo inmutable de estados
import { CategoriaDTO } from '../components/dto/CategoriaDTO';
import { categoryService } from '../https/categoryApi';

interface CategoryState {
    categories: CategoriaDTO[];
    loading: boolean;
    error: string | null;

    fetchedSubcategories: Map<number, CategoriaDTO[]>;
    loadingSubcategories: Set<number>;
    errorSubcategories: Map<number, string>;

    fetchRootCategories: () => Promise<void>;
    fetchSubcategories: (parentId: number) => Promise<void>;
    addCategory: (categoryData: Partial<CategoriaDTO>) => Promise<CategoriaDTO>;
    updateCategory: (category: CategoriaDTO) => Promise<CategoriaDTO>;
    deleteCategory: (id: number) => Promise<void>;
    toggleCategoryActive: (id: number, currentStatus: boolean) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    // Estado inicial
    categories: [],
    loading: false,
    error: null,

    fetchedSubcategories: new Map(),
    loadingSubcategories: new Set(),
    errorSubcategories: new Map(),

    // Implementación de la acción fetchRootCategories
    fetchRootCategories: async () => {
        set({ loading: true, error: null });
        try {
            const rootCategoriesData = await categoryService.getRootCategories();
            set({ categories: rootCategoriesData, loading: false });
        } catch (err: any) {
            console.error("Error fetching root categories in store:", err);
            set({
                error: `Failed to load root categories: ${err.response?.data?.message || err.message || String(err)}`,
                loading: false,
            });
        }
    },

    // Implementación de la acción fetchSubcategories
    fetchSubcategories: async (parentId: number) => {
        const currentLoading = get().loadingSubcategories;
        if (currentLoading.has(parentId)) {
            console.log(`Subcategories for parent ${parentId} are already loading. Skipping redundant fetch.`);
            return;
        }

        set(produce((state: CategoryState) => {
            state.loadingSubcategories.add(parentId);
            state.errorSubcategories.delete(parentId);
        }));

        try {
            const subcategoriesData = await categoryService.getSubcategories(parentId);
            set(produce((state: CategoryState) => {
                state.fetchedSubcategories.set(parentId, subcategoriesData);
                state.loadingSubcategories.delete(parentId);
            }));
        } catch (err: any) {
            console.error(`Error fetching subcategories for parent ID ${parentId} in store:`, err);
            set(produce((state: CategoryState) => {
                state.errorSubcategories.set(parentId, err.response?.data?.message || err.message || 'Error al cargar subcategorías');
                state.loadingSubcategories.delete(parentId);
            }));
        }
    },

    // Implementación de la acción addCategory
    addCategory: async (categoryData: Partial<CategoriaDTO>) => {
        try {
            const newCategory = await categoryService.create(categoryData);

            set(produce((state: CategoryState) => {
                // Si es una categoría raíz, la añadimos a la lista principal
                if (!newCategory.categoriaPadre) {
                    state.categories.push(newCategory);
                } else {
                    // Si es una subcategoría, la añadimos a las fetchedSubcategories de su padre
                    const parentId = newCategory.categoriaPadre.id!;
                    if (state.fetchedSubcategories.has(parentId)) {
                        const existingSubcategories = state.fetchedSubcategories.get(parentId) || [];
                        state.fetchedSubcategories.set(parentId, [...existingSubcategories, newCategory]);
                    }
                }
            }));

            // Después de la actualización optimista, dispara un re-fetch de la lista relevante
            if (newCategory.categoriaPadre?.id) {
                get().fetchSubcategories(newCategory.categoriaPadre.id);
            } else {
                get().fetchRootCategories();
            }

            return newCategory;
        } catch (error) {
            console.error("Error adding category in store:", error);
            throw error;
        }
    },

    // Implementación de la acción updateCategory
    updateCategory: async (category: CategoriaDTO) => {
        try {
            const updatedCategory = await categoryService.update(category);

            set(produce((state: CategoryState) => {
                // Actualiza en la lista principal de categorías
                state.categories = state.categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat);
                // Actualiza en las subcategorías si existe allí
                state.fetchedSubcategories.forEach((subList, parentId) => {
                    state.fetchedSubcategories.set(parentId, subList.map(sub => sub.id === updatedCategory.id ? updatedCategory : sub));
                });
            }));

            // Después de la actualización, fuerza un re-fetch de la lista relevante
            if (updatedCategory.categoriaPadre?.id) {
                get().fetchSubcategories(updatedCategory.categoriaPadre.id);
            } else if (category.categoriaPadre?.id) {
                get().fetchSubcategories(category.categoriaPadre.id);
                get().fetchRootCategories();
            } else {
                get().fetchRootCategories();
            }

            return updatedCategory;
        } catch (error) {
            console.error("Error updating category in store:", error);
            throw error;
        }
    },

    // Implementación de la acción deleteCategory (para el soft delete)
    deleteCategory: async (id: number) => {
        try {
            // El backend maneja 'eliminar' como un soft delete (cambiar 'activo' a false)
            await categoryService.delete(id);

            set(produce((state: CategoryState) => {
                // Actualiza el estado 'activo' a false en la categoría correspondiente
                state.categories = state.categories.map(cat =>
                    cat.id === id ? { ...cat, activo: false } : cat
                );
                state.fetchedSubcategories.forEach((subs, pId) => {
                    state.fetchedSubcategories.set(pId, subs.map(sub =>
                        sub.id === id ? { ...sub, activo: false } : sub
                    ));
                });
            }));

            // No es necesario un re-fetch completo si solo cambiamos el estado activo en el frontend
            // El soft delete mantiene la categoría en la lista, solo cambia su estado.
            // Si tu UI filtra por activo, entonces un re-fetch sí sería útil si listar() solo trae activos.
            // Si listar() trae todos (activos e inactivos), no necesitas re-fetch.
            // Para simplificar, dejaremos los re-fetches al final, asumiendo que tu UI podría necesitarlo.
            const categoryToToggle = get().categories.find(c => c.id === id) ||
                                     Array.from(get().fetchedSubcategories.values()).flat().find(c => c.id === id);

            if (categoryToToggle?.categoriaPadre?.id) {
                get().fetchSubcategories(categoryToToggle.categoriaPadre.id);
            } else {
                get().fetchRootCategories();
            }

        } catch (error) {
            console.error(`Error deleting (desactivating) category with ID ${id} in store:`, error);
            throw error;
        }
    },

    // --- Implementación de la acción toggleCategoryActive ---
    // Este método es ahora el ÚNICO responsable de cambiar el estado activo/inactivo
    toggleCategoryActive: async (id: number, currentStatus: boolean) => {
        set({ loading: true, error: null }); // Muestra un loader general
        try {
            if (currentStatus) {
                // Si la categoría está ACTIVA, queremos DESACTIVARLA (soft delete)
                await categoryService.delete(id); // Llama al DELETE del backend
                console.log(`Categoría ${id} desactivada correctamente.`);
            } else {
                // Si la categoría está INACTIVA, queremos ACTIVARLA
                await categoryService.activate(id); // Llama al NUEVO método ACTIVATE del backend
                console.log(`Categoría ${id} activada correctamente.`);
            }

            // Actualiza el estado en el store después de la operación exitosa
            set(produce((state: CategoryState) => {
                state.categories = state.categories.map(cat =>
                    cat.id === id ? { ...cat, activo: !currentStatus } : cat
                );
                state.fetchedSubcategories.forEach((subs, pId) => {
                    state.fetchedSubcategories.set(pId, subs.map(sub =>
                        sub.id === id ? { ...sub, activo: !currentStatus } : sub
                    ));
                });
                state.loading = false;
            }));

            // Dispara un re-fetch de la lista relevante para asegurar que la UI se actualice correctamente
            // (esto es útil si la visibilidad depende del estado 'activo' o si hay reordenamiento)
            const categoryAfterToggle = get().categories.find(c => c.id === id) ||
                                        Array.from(get().fetchedSubcategories.values()).flat().find(c => c.id === id);

            if (categoryAfterToggle?.categoriaPadre?.id) {
                get().fetchSubcategories(categoryAfterToggle.categoriaPadre.id);
            } else {
                get().fetchRootCategories();
            }

        } catch (error: any) {
            set({
                error: `Error al ${currentStatus ? 'desactivar' : 'activar'} la categoría: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
                loading: false,
            });
            console.error(`Error al ${currentStatus ? 'desactivar' : 'activar'} categoría ${id}:`, error);
            throw error;
        }
    },
}));
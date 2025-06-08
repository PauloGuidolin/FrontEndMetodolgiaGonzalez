// src/store/categoryStore.ts

import { create } from 'zustand';
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
        const currentLoading = new Set(get().loadingSubcategories);
        if (currentLoading.has(parentId)) {
            console.log(`Subcategories for parent ${parentId} are already loading. Skipping redundant fetch.`);
            return;
        }

        currentLoading.add(parentId);
        set(state => ({
            loadingSubcategories: currentLoading,
            errorSubcategories: (() => {
                const newErrorMap = new Map(state.errorSubcategories);
                newErrorMap.delete(parentId);
                return newErrorMap;
            })()
        }));

        try {
            const subcategoriesData = await categoryService.getSubcategories(parentId);
            set(state => ({
                // Replace the subcategory list for this parent in the map
                fetchedSubcategories: new Map(state.fetchedSubcategories).set(parentId, subcategoriesData),
                loadingSubcategories: (() => {
                    const updatedLoading = new Set(state.loadingSubcategories);
                    updatedLoading.delete(parentId);
                    return updatedLoading;
                })()
            }));
        } catch (err: any) {
            console.error(`Error fetching subcategories for parent ID ${parentId} in store:`, err);
            set(state => ({
                errorSubcategories: new Map(state.errorSubcategories).set(parentId, err.response?.data?.message || err.message || 'Error al cargar subcategorías'),
                loadingSubcategories: (() => {
                    const updatedLoading = new Set(state.loadingSubcategories);
                    updatedLoading.delete(parentId);
                    return updatedLoading;
                })()
            }));
        }
    },

    // Implementación de la acción addCategory
    addCategory: async (categoryData: Partial<CategoriaDTO>) => {
        try {
            const newCategory = await categoryService.create(categoryData);

            set(state => {
                const updatedCategories = [...state.categories];
                const updatedFetchedSubcategories = new Map(state.fetchedSubcategories);

                if (!newCategory.categoriaPadre) {
                    // It's a root category, add to the main 'categories' array
                    updatedCategories.push(newCategory);
                } else {
                    // It's a subcategory
                    const parentId = newCategory.categoriaPadre.id!;

                    // Optimistically add the new category to the parent's fetched subcategories list
                    // ONLY if that parent's subcategories are already loaded (i.e., exists in the map).
                    if (updatedFetchedSubcategories.has(parentId)) {
                        const existingSubcategories = updatedFetchedSubcategories.get(parentId) || [];
                        updatedFetchedSubcategories.set(parentId, [...existingSubcategories, newCategory]);
                    }
                    // If the parent's subcategories were NOT yet fetched,
                    // we don't add it here; it will be visible after expansion and subsequent fetch.
                }

                return {
                    categories: updatedCategories,
                    fetchedSubcategories: updatedFetchedSubcategories
                };
            });

            // After optimistic update, trigger a re-fetch of the relevant list
            // to ensure UI consistency and sync with the backend. This is crucial for immediate visibility.
            if (newCategory.categoriaPadre?.id) {
                // If it's a subcategory, re-fetch its parent's subcategories
                get().fetchSubcategories(newCategory.categoriaPadre.id);
            } else {
                // If it's a root category, re-fetch all root categories
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

            set(state => {
                // Update root categories
                const newCategories = state.categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat);
                let newFetchedSubcategories = new Map(state.fetchedSubcategories);

                let oldParentId: number | undefined;

                // 1. Remove from old parent's list if parent has changed or it was a subcategory
                for (const [parentId, subs] of newFetchedSubcategories.entries()) {
                    if (subs.some(sub => sub.id === updatedCategory.id)) {
                        oldParentId = parentId;
                        newFetchedSubcategories.set(parentId, subs.filter(sub => sub.id !== updatedCategory.id)); // Remove from old parent
                        break;
                    }
                }

                // 2. Add to new parent's list OR root list
                if (updatedCategory.categoriaPadre === null) {
                    // It's now a root category
                    if (!newCategories.some(cat => cat.id === updatedCategory.id)) {
                        newCategories.push(updatedCategory); // Ensure it's in the root list
                    }
                } else {
                    // It's now a subcategory
                    const newParentId = updatedCategory.categoriaPadre.id!;
                    if (newFetchedSubcategories.has(newParentId)) {
                        // If new parent's subcategories are loaded, add/update it there
                        const existingSubs = newFetchedSubcategories.get(newParentId) || [];
                        const updatedSubs = existingSubs.map(sub => sub.id === updatedCategory.id ? updatedCategory : sub);
                        if (!updatedSubs.some(sub => sub.id === updatedCategory.id)) { // If not found, add it
                            updatedSubs.push(updatedCategory);
                        }
                        newFetchedSubcategories.set(newParentId, updatedSubs);
                    }
                }

                return {
                    categories: newCategories,
                    fetchedSubcategories: newFetchedSubcategories
                };
            });

            // After optimistic update, force a re-fetch of the relevant list to guarantee UI consistency.
            // This is especially important if the parent changed or if the child count for a parent was affected.
            if (updatedCategory.categoriaPadre?.id) {
                // If it's a subcategory, re-fetch its new parent's subcategories
                get().fetchSubcategories(updatedCategory.categoriaPadre.id);
            } else if (category.categoriaPadre?.id) { // If it *was* a subcategory but became a root
                get().fetchSubcategories(category.categoriaPadre.id); // Re-fetch old parent's children to remove it
                get().fetchRootCategories(); // And re-fetch root categories
            } else { // It was a root category and remained a root category
                get().fetchRootCategories();
            }

            return updatedCategory;
        } catch (error) {
            console.error("Error updating category in store:", error);
            throw error;
        }
    },

    // Implementación de la acción deleteCategory
    deleteCategory: async (id: number) => {
        try {
            const currentState = get();
            // Try to find the category to determine its parent before deleting from backend
            const categoryToDelete = currentState.categories.find(cat => cat.id === id) ||
                                     Array.from(currentState.fetchedSubcategories.values()).flat().find(cat => cat.id === id);

            const parentId = categoryToDelete?.categoriaPadre?.id; // Store parent ID if it exists

            await categoryService.delete(id); // Perform backend deletion

            set(state => {
                const newCategories = state.categories.filter(cat => cat.id !== id);
                let newFetchedSubcategories = new Map(state.fetchedSubcategories);

                // Filter the deleted category from all loaded subcategory lists
                newFetchedSubcategories.forEach((subs, pId) => {
                    newFetchedSubcategories.set(pId, subs.filter(sub => sub.id !== id));
                });
                // If the deleted category itself was a parent, remove its entry (children) from the map
                newFetchedSubcategories.delete(id);

                return {
                    categories: newCategories,
                    fetchedSubcategories: newFetchedSubcategories
                };
            });

            // After optimistic deletion, re-fetch the relevant list to reflect changes accurately
            if (parentId) {
                get().fetchSubcategories(parentId); // Re-fetch the parent's list
            } else {
                get().fetchRootCategories(); // If it was a root, re-fetch root categories
            }

        } catch (error) {
            console.error(`Error deleting category with ID ${id} in store:`, error);
            throw error;
        }
    },

    // Implementación de la acción toggleCategoryActive
    toggleCategoryActive: async (id: number, currentStatus: boolean) => {
        try {
            const currentState = get();
            // Find the category to update from currently loaded root or subcategories
            const categoryToUpdate = currentState.categories.find(cat => cat.id === id) ||
                                     Array.from(currentState.fetchedSubcategories.values()).flat().find(cat => cat.id === id);

            if (!categoryToUpdate) {
                console.error('Category not found for toggling active status.');
                throw new Error('Category not found.');
            }

            // Prepare the object to send to the backend (only parent ID if exists)
            const parentIdForBackend = categoryToUpdate.categoriaPadre ? { id: categoryToUpdate.categoriaPadre.id } as CategoriaDTO : null;

            const updatedCategoryData: CategoriaDTO = {
                ...categoryToUpdate,
                activo: !currentStatus,
                categoriaPadre: parentIdForBackend // Send the parent ID to maintain relationship
            };

            const response = await categoryService.update(updatedCategoryData); // Perform backend update

            // Optimistically update the store state
            set(state => {
                const updatedCategories = state.categories.map(cat => cat.id === id ? response : cat);
                const updatedFetchedSubcategories = new Map(state.fetchedSubcategories);

                // Update in fetched subcategories lists as well
                for (const [parentId, subs] of updatedFetchedSubcategories.entries()) {
                    updatedFetchedSubcategories.set(parentId, subs.map(sub => sub.id === id ? response : sub));
                }

                return {
                    categories: updatedCategories,
                    fetchedSubcategories: updatedFetchedSubcategories
                };
            });

            // After optimistic update, re-fetch the relevant list to ensure accurate status and consistency
            if (response.categoriaPadre?.id) {
                get().fetchSubcategories(response.categoriaPadre.id); // Re-fetch the parent's list
            } else {
                get().fetchRootCategories(); // Re-fetch root categories
            }

        } catch (error) {
            console.error(`Error toggling active status for category ${id}:`, error);
            throw error;
        }
    },
}));
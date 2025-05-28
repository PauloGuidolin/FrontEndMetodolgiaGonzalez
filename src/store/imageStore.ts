// Archivo: src/store/imageStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { ImagenDTO } from '../components/dto/ImagenDTO'; // Importar ImagenDTO para consistencia
import { imageService } from '../https/imageApi';


// Definimos la interfaz para el estado de nuestro store de imagen
interface ImageState {
    // Estado para la lista general de imágenes
    images: ImagenDTO[]; // Usar ImagenDTO
    loading: boolean;
    error: string | null;

    // Estado para una imagen individual seleccionada o buscada
    selectedImage: ImagenDTO | null; // Usar ImagenDTO
    loadingImage: boolean;
    errorImage: string | null;

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todas las imágenes
    fetchImages: () => Promise<void>;

    // Acción para obtener una imagen individual por ID
    fetchImageById: (id: number | string) => Promise<void>;

    // Acciones CRUD para gestionar imágenes
    // Nota: La creación de imágenes a menudo implica subir archivos binarios,
    // lo cual requiere un manejo específico en el servicio API y posiblemente aquí.
    addImage: (imageData: Partial<ImagenDTO> | FormData) => Promise<ImagenDTO>; // Puede aceptar Partial<ImagenDTO> o FormData
    updateImage: (image: ImagenDTO) => Promise<ImagenDTO>; // Usar ImagenDTO
    deleteImage: (id: number | string) => Promise<void>;

    // Acción para limpiar la imagen seleccionada
    clearSelectedImage: () => void;
}

// Creamos el store usando la función create de Zustand
export const useImageStore = create<ImageState>((set, get) => ({
    // Estado inicial para la lista general de imágenes
    images: [],
    loading: false,
    error: null,

    // Estado inicial para imagen individual
    selectedImage: null,
    loadingImage: false,
    errorImage: null,

    // Implementación de la acción fetchImages
    fetchImages: async () => {
        set({ loading: true, error: null });

        try {
            const imagesData = await imageService.getAll();
            set({ images: imagesData, loading: false });
        } catch (error) {
            console.error("Error fetching all images in store:", error);
            set({
                error: `Failed to load images: ${error instanceof Error ? error.message : String(error)}`,
                loading: false,
            });
        }
    },

    // Implementación de la acción fetchImageById
    fetchImageById: async (id: number | string) => {
        set({ loadingImage: true, errorImage: null, selectedImage: null });
        try {
            const imageData = await imageService.getById(id);
            set({ selectedImage: imageData, loadingImage: false });
        } catch (error: any) { // Se tipa 'error' como 'any' para acceder a 'response' si es un error de Axios
            console.error(`Error fetching image with ID ${id} in store:`, error);
            const errorMessage =
                error.response?.data?.message || // Si es un error de Axios con mensaje del backend
                error.message ||
                `Failed to load image with ID ${id}.`;
            set({
                errorImage: errorMessage,
                loadingImage: false,
                selectedImage: null, // Asegura que selectedImage sea null en caso de error
            });
            // Opcional: Puedes volver a lanzar el error si necesitas que el componente que llama lo maneje también.
            // throw error;
        }
    },

    // Implementación de la acción addImage
    addImage: async (imageData: Partial<ImagenDTO> | FormData) => {
        // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
        // set({ loading: true, error: null });
        try {
            // El servicio imageService.create debe manejar si recibe Partial<ImagenDTO> o FormData
            const newImage = await imageService.create(imageData);
            // Opcional: Actualizar la lista de imágenes en el store después de crear
            // set(state => ({ images: [...state.images, newImage] }));
            // set({ loading: false });
            return newImage; // Devuelve la entidad creada
        } catch (error) {
            console.error("Error adding image in store:", error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to add image: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error para manejo en el componente/llamador
        }
    },

    // Implementación de la acción updateImage
    updateImage: async (image: ImagenDTO) => { // Usar ImagenDTO
        // Opcional: Estado de carga/error para CRUD
        // set({ loading: true, error: null });
        try {
            const updatedImage = await imageService.update(image);
            // Opcional: Actualizar la lista de imágenes en el store después de actualizar
            // set(state => ({ images: state.images.map(img => img.id === updatedImage.id ? updatedImage : img) }));
            // set({ loading: false });
            return updatedImage; // Devuelve la entidad actualizada
        } catch (error) {
            console.error("Error updating image in store:", error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to update image: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error
        }
    },

    // Implementación de la acción deleteImage
    deleteImage: async (id: number | string) => {
        // Opcional: Estado de carga/error para CRUD
        // set({ loading: true, error: null });
        try {
            await imageService.delete(id);
            // Opcional: Eliminar la imagen de la lista en el store después de eliminar
            // set(state => ({ images: state.images.filter(img => img.id !== id) }));
            // set({ loading: false });
        } catch (error) {
            console.error(`Error deleting image with ID ${id} in store:`, error);
            // Opcional: Establecer un error específico para operaciones CRUD
            // set({ error: `Failed to delete image: ${error instanceof Error ? error.message : String(error)}`, loading: false });
            throw error; // Relanza el error
        }
    },

    // Implementación de la acción clearSelectedImage
    clearSelectedImage: () => set({ selectedImage: null, errorImage: null, loadingImage: false }),
}));
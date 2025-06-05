import { create } from 'zustand'; // Importa la función create de Zustand
import { ImagenDTO } from '../components/dto/ImagenDTO'; // Importar ImagenDTO
import { imageService } from '../https/imageApi'; // Asegúrate de que esta ruta sea correcta para tu imageService

// Definimos la interfaz para el estado de nuestro store de imagen
interface ImageState {
    // Estado para la lista general de imágenes
    images: ImagenDTO[];
    loading: boolean;
    error: string | null;

    // Estado para una imagen individual seleccionada o buscada
    selectedImage: ImagenDTO | null;
    loadingImage: boolean;
    errorImage: string | null;

    // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

    // Acción para obtener todas las imágenes
    fetchImages: () => Promise<void>;

    // Acción para obtener una imagen individual por ID
    fetchImageById: (id: number | string) => Promise<void>;

    // --- NUEVA ACCIÓN: Para subir el archivo de imagen a Cloudinary ---
    uploadImageFile: (file: File) => Promise<string>; // Devuelve la URL de Cloudinary

    // --- ACCIÓN MODIFICADA: Para crear una entidad Imagen en la BD (con la URL ya obtenida) ---
    // Ahora espera un objeto DTO con la URL (denominacion)
    createImageEntity: (imageData: Partial<Omit<ImagenDTO, 'id'>>) => Promise<ImagenDTO>; 
    
    // --- ACCIÓN MODIFICADA: Para actualizar una entidad Imagen existente ---
    updateImage: (id: number | string, imageData: Partial<ImagenDTO>) => Promise<ImagenDTO>;
    
    // Acción para eliminar lógicamente una imagen
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
        } catch (error: any) { 
            console.error(`Error fetching image with ID ${id} in store:`, error);
            const errorMessage =
                error.response?.data?.message || 
                error.message ||
                `Failed to load image with ID ${id}.`;
            set({
                errorImage: errorMessage,
                loadingImage: false,
                selectedImage: null, 
            });
            throw error; // Relanzamos el error para manejo en el componente
        }
    },

    // --- Implementación de la NUEVA acción uploadImageFile ---
    uploadImageFile: async (file: File) => {
        set({ loading: true, error: null }); // Usamos el loading general para subidas
        try {
            const imageUrl = await imageService.upload(file); // Llama al método de subida de archivos del servicio
            set({ loading: false });
            return imageUrl; // Devuelve la URL obtenida de Cloudinary
        } catch (error) {
            console.error("Error uploading image file:", error);
            set({ 
                error: `Failed to upload image file: ${error instanceof Error ? error.message : String(error)}`, 
                loading: false 
            });
            throw error; // Relanza el error
        }
    },

    // --- Implementación de la acción createImageEntity (antes addImage) ---
    // Ahora espera solo los datos de la entidad, incluyendo la URL
    createImageEntity: async (imageData: Partial<Omit<ImagenDTO, 'id'>>) => {
        set({ loading: true, error: null });
        try {
            const newImage = await imageService.create(imageData);
            // Opcional: Actualizar la lista de imágenes en el store después de crear
            set(state => ({ images: [...state.images, newImage], loading: false }));
            return newImage; // Devuelve la entidad creada
        } catch (error) {
            console.error("Error creating image entity in store:", error);
            set({ 
                error: `Failed to create image entity: ${error instanceof Error ? error.message : String(error)}`, 
                loading: false 
            });
            throw error; // Relanza el error
        }
    },

    // --- Implementación de la acción updateImage ---
    updateImage: async (id: number | string, imageData: Partial<ImagenDTO>) => { 
        set({ loading: true, error: null });
        try {
            const updatedImage = await imageService.update(id, imageData); // Pasa el ID y los datos
            // Opcional: Actualizar la lista de imágenes en el store después de actualizar
            set(state => ({ 
                images: state.images.map(img => img.id === updatedImage.id ? updatedImage : img),
                loading: false
            }));
            return updatedImage; // Devuelve la entidad actualizada
        } catch (error) {
            console.error("Error updating image in store:", error);
            set({ 
                error: `Failed to update image: ${error instanceof Error ? error.message : String(error)}`, 
                loading: false 
            });
            throw error; // Relanza el error
        }
    },

    // Implementación de la acción deleteImage
    deleteImage: async (id: number | string) => {
        set({ loading: true, error: null });
        try {
            await imageService.delete(id);
            // Opcional: Eliminar la imagen de la lista en el store después de eliminar
            set(state => ({ images: state.images.filter(img => img.id !== id), loading: false }));
        } catch (error) {
            console.error(`Error deleting image with ID ${id} in store:`, error);
            set({ 
                error: `Failed to delete image: ${error instanceof Error ? error.message : String(error)}`, 
                loading: false 
            });
            throw error; // Relanza el error
        }
    },

    // Implementación de la acción clearSelectedImage
    clearSelectedImage: () => set({ selectedImage: null, errorImage: null, loadingImage: false }),
}));
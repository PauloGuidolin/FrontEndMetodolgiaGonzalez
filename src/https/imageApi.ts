import { ImagenDTO } from '../components/dto/ImagenDTO'; // Asegúrate de que esta ruta sea correcta
import { http } from './httpService'; // Importa tu servicio HTTP base (si tu archivo se llama httpService.ts)
// Si tu archivo de axios se llama 'api.ts' y exporta 'http', entonces sería:
// import { http } from './api';

// Define el endpoint específico para imágenes.
// Coincide con @RequestMapping("/imagen") en tu backend.
// No necesitamos API_BASE_URL aquí directamente porque 'http' ya lo tiene configurado.
const IMAGE_ENDPOINT = '/imagen'; 

/**
 * Servicio API para interactuar con los recursos de Imagen.
 */
export const imageService = {

    /**
     * Sube un archivo de imagen al backend (usando Cloudinary) y devuelve su URL.
     * Este método es específico para la carga del archivo en sí.
     * @param file El archivo de imagen (File) a subir.
     * @returns Una Promesa que resuelve con la URL de la imagen subida.
     * @throws Error si la subida falla.
     */
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file); // 'file' debe coincidir con @RequestParam("file") en el backend

        try {
            // Usamos http.post. Axios y tu interceptor ya se encargarán de Content-Type: multipart/form-data.
            // El backend responde con un JSON que contiene la URL.
            const response = await http.post<any>(`${IMAGE_ENDPOINT}/upload`, formData);
            return response.url; // Asume que el backend devuelve { url: "..." }
        } catch (error) {
            console.error('Error al subir imagen a Cloudinary:', error);
            throw error; // Propaga el error para que sea manejado por quien llama a este servicio
        }
    },

    /**
     * Obtiene todas las imágenes activas.
     * @returns Una Promesa que resuelve con un array de ImagenDTO.
     */
    getAll: async (): Promise<ImagenDTO[]> => {
        const url = IMAGE_ENDPOINT;
        return http.get<ImagenDTO[]>(url);
    },

    /**
     * Obtiene una imagen activa por su ID.
     * @param id El ID de la imagen.
     * @returns Una Promesa que resuelve con un ImagenDTO.
     */
    getById: async (id: number | string): Promise<ImagenDTO> => {
        const url = `${IMAGE_ENDPOINT}/${id}`;
        return http.get<ImagenDTO>(url);
    },

    /**
     * Crea una nueva entidad Imagen en la base de datos con una URL ya existente.
     * Este método se usaría DESPUÉS de haber subido la imagen con `imageService.upload`
     * y haber obtenido la URL.
     * @param imageData Los datos de la imagen a crear (debe contener la URL en `denominacion`).
     * @returns Una Promesa que resuelve con la imagen creada.
     */
    create: async (imageData: Partial<Omit<ImagenDTO, 'id'>>): Promise<ImagenDTO> => { // Usamos Omit<ImagenDTO, 'id'> para asegurar que no se pase un ID al crear
        const url = IMAGE_ENDPOINT;
        // Aquí imageData debería ser un objeto JSON (ej. { denominacion: "url-de-cloudinary" })
        return http.post<ImagenDTO>(url, imageData);
    },

    /**
     * Actualiza una imagen existente.
     * @param id El ID de la imagen a actualizar.
     * @param imageData Los datos de la imagen a actualizar (ej. `denominacion`).
     * @returns Una Promesa que resuelve con la imagen actualizada.
     */
    update: async (id: number | string, imageData: Partial<ImagenDTO>): Promise<ImagenDTO> => {
        // Asumiendo que tu BaseController actualiza el ID que viene en el path
        // Aunque tu BaseController.update espera la entidad completa en el body,
        // si solo actualizas un campo, puedes enviar un parcial.
        // Pero el PUT del BaseController espera `PUT /{id}` con la entidad en el body.
        // Para que coincida con tu BaseController, deberías enviar la entidad completa incluyendo el ID.
        // Si tu backend permite un PATCH o PUT parcial, el `http.put` lo manejaría.
        // Para coincidir exactamente con tu backend:
        const url = `${IMAGE_ENDPOINT}/${id}`; // Tu BaseController espera el ID en la URL para PUT.
        // El body debe contener el ID de la entidad para que BaseService.actualizar lo encuentre.
        // Si imageData ya trae el ID, perfecto. Si no, asegúrate de que lo tenga.
        const fullImageData: ImagenDTO = { ...imageData, id: Number(id) } as ImagenDTO; // Asegura que el ID esté en el body
        return http.put<ImagenDTO>(url, fullImageData);
    },

    /**
     * Elimina una imagen lógicamente por su ID (soft delete).
     * @param id El ID de la imagen a eliminar.
     * @returns Una Promesa que resuelve cuando la eliminación es exitosa.
     */
    delete: async (id: number | string): Promise<void> => {
        const url = `${IMAGE_ENDPOINT}/${id}`;
        return http.delete<void>(url);
    },

    /**
     * Activa una imagen inactiva por su ID.
     * @param id El ID de la imagen a activar.
     * @returns Una Promesa que resuelve con la imagen activada.
     */
    activate: async (id: number | string): Promise<ImagenDTO> => {
        const url = `${IMAGE_ENDPOINT}/activar/${id}`;
        return http.put<ImagenDTO>(url, {}); // PUT con body vacío si solo se necesita el ID del path
    },
};
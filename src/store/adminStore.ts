// Archivo: src/store/adminStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IAdmin } from '../types/IAdmin'; // Importa la interfaz de Admin (asegúrate de la ruta)
import { adminService } from '../https/adminApi';


// Definimos la interfaz para el estado de nuestro store de admin
interface AdminState {
  // Estado para la lista general de admins
  admins: IAdmin[];
  loading: boolean;
  error: string | null;

  // Estado para un admin individual seleccionado o buscado
  selectedAdmin: IAdmin | null;
  loadingAdmin: boolean;
  errorAdmin: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los admins
  fetchAdmins: () => Promise<void>;

  // Acciones para obtener un admin individual por diferentes criterios
  fetchAdminById: (id: number | string) => Promise<void>;
  fetchAdminByUserName: (userName: string) => Promise<void>;
  fetchAdminByImagenUserId: (idImagen: number | string) => Promise<void>;

  // Acciones CRUD para gestionar admins
  addAdmin: (adminData: Partial<IAdmin>) => Promise<IAdmin>;
  updateAdmin: (admin: IAdmin) => Promise<IAdmin>;
  deleteAdmin: (id: number | string) => Promise<void>;

  // Acción para limpiar el admin seleccionado
  clearSelectedAdmin: () => void;
}

// Creamos el store usando la función create de Zustand
export const useAdminStore = create<AdminState>((set, get) => ({
  // Estado inicial para la lista general de admins
  admins: [],
  loading: false,
  error: null,

  // Estado inicial para admin individual
  selectedAdmin: null,
  loadingAdmin: false,
  errorAdmin: null,

  // Implementación de la acción fetchAdmins
  fetchAdmins: async () => {
    set({ loading: true, error: null });

    try {
      const adminsData = await adminService.getAll();
      set({ admins: adminsData, loading: false });
    } catch (error) {
      console.error("Error fetching all admins in store:", error);
      set({
        error: `Failed to load admins: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchAdminById
  fetchAdminById: async (id: number | string) => {
      set({ loadingAdmin: true, errorAdmin: null, selectedAdmin: null });
      try {
          const adminData = await adminService.getById(id);
          set({ selectedAdmin: adminData, loadingAdmin: false });
      } catch (error) {
          console.error(`Error fetching admin with ID ${id} in store:`, error);
          set({
              errorAdmin: `Failed to load admin: ${error instanceof Error ? error.message : String(error)}`,
              loadingAdmin: false,
              selectedAdmin: null, // Asegura que selectedAdmin sea null en caso de error
          });
      }
  },

   // Implementación de la acción fetchAdminByUserName
  fetchAdminByUserName: async (userName: string) => {
      set({ loadingAdmin: true, errorAdmin: null, selectedAdmin: null });
      try {
          const adminData = await adminService.getByUserName(userName);
          set({ selectedAdmin: adminData, loadingAdmin: false });
      } catch (error) {
          console.error(`Error fetching admin with username ${userName} in store:`, error);
           set({
              errorAdmin: `Failed to load admin by username: ${error instanceof Error ? error.message : String(error)}`,
              loadingAdmin: false,
              selectedAdmin: null,
          });
      }
  },

   // Implementación de la acción fetchAdminByImagenUserId
  fetchAdminByImagenUserId: async (idImagen: number | string) => {
      set({ loadingAdmin: true, errorAdmin: null, selectedAdmin: null });
      try {
          const adminData = await adminService.getByImagenUserId(idImagen);
          set({ selectedAdmin: adminData, loadingAdmin: false });
      } catch (error) {
          console.error(`Error fetching admin with imagen user ID ${idImagen} in store:`, error);
           set({
              errorAdmin: `Failed to load admin by imagen user ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingAdmin: false,
              selectedAdmin: null,
          });
      }
  },


  // Implementación de la acción addAdmin
  addAdmin: async (adminData: Partial<IAdmin>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newAdmin = await adminService.create(adminData);
          // Opcional: Actualizar la lista de admins en el store después de crear
          // set(state => ({ admins: [...state.admins, newAdmin] }));
          // set({ loading: false });
          return newAdmin; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding admin in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add admin: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateAdmin
  updateAdmin: async (admin: IAdmin) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedAdmin = await adminService.update(admin);
           // Opcional: Actualizar la lista de admins en el store después de actualizar
           // set(state => ({ admins: state.admins.map(a => a.id === updatedAdmin.id ? updatedAdmin : a) }));
           // set({ loading: false });
           return updatedAdmin; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating admin in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update admin: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteAdmin
  deleteAdmin: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await adminService.delete(id);
          // Opcional: Eliminar el admin de la lista en el store después de eliminar
          // set(state => ({ admins: state.admins.filter(a => a.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting admin with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete admin: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedAdmin
  clearSelectedAdmin: () => set({ selectedAdmin: null, errorAdmin: null, loadingAdmin: false }),
}));

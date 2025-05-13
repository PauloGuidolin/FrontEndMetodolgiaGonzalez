// Archivo: src/store/userManagementStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IUsuario } from '../types/IUsuario'; // Importa la interfaz de Usuario (asegúrate de la ruta)
import { userManagementService } from '../https/userManagementApi';


// Definimos la interfaz para el estado de nuestro store de gestión de usuarios
interface UserManagementState {
  // Estado para la lista general de usuarios
  users: IUsuario[];
  loading: boolean;
  error: string | null;

  // Estado para un usuario individual seleccionado o buscado
  selectedUser: IUsuario | null;
  loadingUser: boolean;
  errorUser: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los usuarios
  fetchUsers: () => Promise<void>;

  // Acción para obtener un usuario individual por ID
  fetchUserById: (id: number | string) => Promise<void>;

  // Acciones CRUD para gestionar usuarios (probablemente para ADMIN)
  // Nota: La creación de usuarios regulares se maneja en authStore.ts
  updateUser: (user: IUsuario) => Promise<IUsuario>;
  deleteUser: (id: number | string) => Promise<void>;

  // Acción para limpiar el usuario seleccionado
  clearSelectedUser: () => void;
}

// Creamos el store usando la función create de Zustand
export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  // Estado inicial para la lista general de usuarios
  users: [],
  loading: false,
  error: null,

  // Estado inicial para usuario individual
  selectedUser: null,
  loadingUser: false,
  errorUser: null,

  // Implementación de la acción fetchUsers
  fetchUsers: async () => {
    set({ loading: true, error: null });

    try {
      const usersData = await userManagementService.getAll();
      set({ users: usersData, loading: false });
    } catch (error) {
      console.error("Error fetching all users in store:", error);
      set({
        error: `Failed to load users: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchUserById
  fetchUserById: async (id: number | string) => {
      set({ loadingUser: true, errorUser: null, selectedUser: null });
      try {
          const userData = await userManagementService.getById(id);
          set({ selectedUser: userData, loadingUser: false });
      } catch (error) {
          console.error(`Error fetching user with ID ${id} in store:`, error);
          set({
              errorUser: `Failed to load user: ${error instanceof Error ? error.message : String(error)}`,
              loadingUser: false,
              selectedUser: null, // Asegura que selectedUser sea null en caso de error
          });
      }
  },

  // Implementación de la acción updateUser
  updateUser: async (user: IUsuario) => {
       // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
       // set({ loading: true, error: null });
      try {
          const updatedUser = await userManagementService.update(user);
           // Opcional: Actualizar la lista de usuarios en el store después de actualizar
           // set(state => ({ users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u) }));
           // set({ loading: false });
           return updatedUser; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating user in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update user: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteUser
  deleteUser: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await userManagementService.delete(id);
          // Opcional: Eliminar el usuario de la lista en el store después de eliminar
          // set(state => ({ users: state.users.filter(u => u.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting user with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete user: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedUser
  clearSelectedUser: () => set({ selectedUser: null, errorUser: null, loadingUser: false }),
}));

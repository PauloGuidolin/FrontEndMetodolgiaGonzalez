// Archivo: src/store/clientStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { ICliente } from '../types/ICliente'; // Importa la interfaz de Cliente (asegúrate de la ruta)
import { clientService } from '../https/clientApi';


// Definimos la interfaz para el estado de nuestro store de cliente
interface ClientState {
  // Estado para la lista general de clientes (ej. para un panel de administración)
  clients: ICliente[];
  loading: boolean;
  error: string | null;

  // Estado para un cliente individual seleccionado o buscado (ej. perfil del usuario loggeado)
  selectedClient: ICliente | null;
  loadingClient: boolean;
  errorClient: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todos los clientes
  fetchClients: () => Promise<void>;

  // Acciones para obtener un cliente individual por diferentes criterios
  fetchClientById: (id: number | string) => Promise<void>;
  fetchClientByUsuarioId: (idUsuario: number | string) => Promise<void>;
  fetchClientByImagenPersonaId: (idImagen: number | string) => Promise<void>;

  // Acciones CRUD para gestionar clientes
  addClient: (clientData: Partial<ICliente>) => Promise<ICliente>;
  updateClient: (client: ICliente) => Promise<ICliente>;
  deleteClient: (id: number | string) => Promise<void>;

  // Acción para limpiar el cliente seleccionado
  clearSelectedClient: () => void;
}

// Creamos el store usando la función create de Zustand
export const useClientStore = create<ClientState>((set, get) => ({
  // Estado inicial para la lista general de clientes
  clients: [],
  loading: false,
  error: null,

  // Estado inicial para cliente individual
  selectedClient: null,
  loadingClient: false,
  errorClient: null,

  // Implementación de la acción fetchClients
  fetchClients: async () => {
    set({ loading: true, error: null });

    try {
      const clientsData = await clientService.getAll();
      set({ clients: clientsData, loading: false });
    } catch (error) {
      console.error("Error fetching all clients in store:", error);
      set({
        error: `Failed to load clients: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchClientById
  fetchClientById: async (id: number | string) => {
      set({ loadingClient: true, errorClient: null, selectedClient: null });
      try {
          const clientData = await clientService.getById(id);
          set({ selectedClient: clientData, loadingClient: false });
      } catch (error) {
          console.error(`Error fetching client with ID ${id} in store:`, error);
          set({
              errorClient: `Failed to load client: ${error instanceof Error ? error.message : String(error)}`,
              loadingClient: false,
              selectedClient: null, // Asegura que selectedClient sea null en caso de error
          });
      }
  },

   // Implementación de la acción fetchClientByUsuarioId
  fetchClientByUsuarioId: async (idUsuario: number | string) => {
      set({ loadingClient: true, errorClient: null, selectedClient: null });
      try {
          const clientData = await clientService.getByUsuarioId(idUsuario);
          set({ selectedClient: clientData, loadingClient: false });
      } catch (error) {
          console.error(`Error fetching client with user ID ${idUsuario} in store:`, error);
           set({
              errorClient: `Failed to load client by user ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingClient: false,
              selectedClient: null,
          });
      }
  },

   // Implementación de la acción fetchClientByImagenPersonaId
  fetchClientByImagenPersonaId: async (idImagen: number | string) => {
      set({ loadingClient: true, errorClient: null, selectedClient: null });
      try {
          const clientData = await clientService.getByImagenPersonaId(idImagen);
          set({ selectedClient: clientData, loadingClient: false });
      } catch (error) {
          console.error(`Error fetching client with imagen persona ID ${idImagen} in store:`, error);
           set({
              errorClient: `Failed to load client by imagen persona ID: ${error instanceof Error ? error.message : String(error)}`,
              loadingClient: false,
              selectedClient: null,
          });
      }
  },


  // Implementación de la acción addClient
  addClient: async (clientData: Partial<ICliente>) => {
      // Opcional: Puedes poner un estado de carga/error específico para operaciones CRUD
      // set({ loading: true, error: null });
      try {
          const newClient = await clientService.create(clientData);
          // Opcional: Actualizar la lista de clientes en el store después de crear
          // set(state => ({ clients: [...state.clients, newClient] }));
          // set({ loading: false });
          return newClient; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding client in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add client: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateClient
  updateClient: async (client: ICliente) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedClient = await clientService.update(client);
           // Opcional: Actualizar la lista de clientes en el store después de actualizar
           // set(state => ({ clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c) }));
           // set({ loading: false });
           return updatedClient; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating client in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update client: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteClient
  deleteClient: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await clientService.delete(id);
          // Opcional: Eliminar el cliente de la lista en el store después de eliminar
          // set(state => ({ clients: state.clients.filter(c => c.id !== id) }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting client with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete client: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción clearSelectedClient
  clearSelectedClient: () => set({ selectedClient: null, errorClient: null, loadingClient: false }),
}));

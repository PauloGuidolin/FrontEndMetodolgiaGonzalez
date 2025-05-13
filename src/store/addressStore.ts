// Archivo: src/store/addressStore.ts

import { create } from 'zustand'; // Importa la función create de Zustand
import { IDireccion } from '../types/IDireccion'; // Importa la interfaz de Direccion (asegúrate de la ruta)
import { addressService } from '../https/addressApi';


// Definimos la interfaz para el estado de nuestro store de direcciones
interface AddressState {
  // Estado para la lista general de direcciones (ej. para un panel de administración)
  addresses: IDireccion[];
  loading: boolean;
  error: string | null;

  // Estado para direcciones asociadas a un cliente específico (caso de uso común en frontend)
  clientAddresses: IDireccion[];
  loadingClientAddresses: boolean;
  errorClientAddresses: string | null;

  // Acciones (funciones para modificar el estado o realizar operaciones asíncronas)

  // Acción para obtener todas las direcciones (ej. para ADMIN)
  fetchAddresses: () => Promise<void>;

  // Acción para obtener direcciones de un cliente específico
  fetchAddressesByClientId: (clientId: number | string) => Promise<void>;

  // Acciones CRUD para gestionar direcciones

  // Acción para añadir una nueva dirección
  addAddress: (addressData: Partial<IDireccion>) => Promise<IDireccion>;

  // Acción para actualizar una dirección existente
  updateAddress: (address: IDireccion) => Promise<IDireccion>;

  // Acción para eliminar una dirección
  deleteAddress: (id: number | string) => Promise<void>;

  // Puedes añadir otras acciones si son necesarias (ej. setSelectedAddress, clearSelectedAddress)
  // selectedAddress: IDireccion | null;
  // setSelectedAddress: (address: IDireccion | null) => void;
}

// Creamos el store usando la función create de Zustand
export const useAddressStore = create<AddressState>((set, get) => ({
  // Estado inicial para la lista general de direcciones
  addresses: [],
  loading: false,
  error: null,

  // Estado inicial para direcciones de cliente específico
  clientAddresses: [],
  loadingClientAddresses: false,
  errorClientAddresses: null,

  // Estado inicial para dirección seleccionada (si la añades)
  // selectedAddress: null,

  // Implementación de la acción fetchAddresses (para todas las direcciones)
  fetchAddresses: async () => {
    set({ loading: true, error: null });

    try {
      const addressesData = await addressService.getAll();
      set({ addresses: addressesData, loading: false });
    } catch (error) {
      console.error("Error fetching all addresses in store:", error);
      set({
        error: `Failed to load addresses: ${error instanceof Error ? error.message : String(error)}`,
        loading: false,
      });
    }
  },

  // Implementación de la acción fetchAddressesByClientId
  fetchAddressesByClientId: async (clientId: number | string) => {
      set({ loadingClientAddresses: true, errorClientAddresses: null });
      try {
          const clientAddressesData = await addressService.getAllByClienteId(clientId);
          set({ clientAddresses: clientAddressesData, loadingClientAddresses: false });
      } catch (error) {
          console.error(`Error fetching addresses for client ${clientId} in store:`, error);
          set({
              errorClientAddresses: `Failed to load client addresses: ${error instanceof Error ? error.message : String(error)}`,
              loadingClientAddresses: false,
          });
          // Opcional: Limpiar la lista de direcciones del cliente en caso de error
          // set({ clientAddresses: [] });
      }
  },

  // Implementación de la acción addAddress
  addAddress: async (addressData: Partial<IDireccion>) => {
      // Opcional: Puedes poner un estado de carga específico para operaciones CRUD si lo necesitas
      // set({ loading: true, error: null });
      try {
          const newAddress = await addressService.create(addressData);
          // Opcional: Actualizar la lista de direcciones en el store después de crear
          // Esto puede ser complejo si necesitas añadirla a 'addresses' o 'clientAddresses'
          // dependiendo del contexto. Considera refetching las listas relevantes si es más simple.
          // Ejemplo simple (asumiendo que quieres añadirla a la lista general si no hay filtro activo):
          // const currentAddresses = get().addresses;
          // set({ addresses: [...currentAddresses, newAddress] });
          // set({ loading: false });
          return newAddress; // Devuelve la entidad creada
      } catch (error) {
          console.error("Error adding address in store:", error);
          // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to add address: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error para manejo en el componente/llamador
      }
  },

  // Implementación de la acción updateAddress
  updateAddress: async (address: IDireccion) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          const updatedAddress = await addressService.update(address);
           // Opcional: Actualizar la lista de direcciones en el store después de actualizar
           // const currentAddresses = get().addresses;
           // set({ addresses: currentAddresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr) });
           // set({ loading: false });
           return updatedAddress; // Devuelve la entidad actualizada
      } catch (error) {
          console.error("Error updating address in store:", error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to update address: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción deleteAddress
  deleteAddress: async (id: number | string) => {
       // Opcional: Estado de carga/error para CRUD
       // set({ loading: true, error: null });
      try {
          await addressService.delete(id);
          // Opcional: Eliminar la dirección de la lista en el store después de eliminar
          // set(state => ({
          //     addresses: state.addresses.filter(addr => addr.id !== id),
          //     clientAddresses: state.clientAddresses.filter(addr => addr.id !== id)
          // }));
          // set({ loading: false });
      } catch (error) {
          console.error(`Error deleting address with ID ${id} in store:`, error);
           // Opcional: Establecer un error específico para operaciones CRUD
          // set({ error: `Failed to delete address: ${error instanceof Error ? error.message : String(error)}`, loading: false });
          throw error; // Relanza el error
      }
  },

  // Implementación de la acción setSelectedAddress (si la añades)
  // setSelectedAddress: (address: IDireccion | null) => set({ selectedAddress: address }),
}));

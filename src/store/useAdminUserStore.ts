import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserDTO } from '../components/dto/UserDTO';
import { AdminUserUpdateDTO } from '../components/dto/AdminUserUpdateDTO';
import { adminUserService } from '../https/adminUserService';


interface AdminUserState {
    users: UserDTO[];
    isLoading: boolean;
    error: string | null;
    selectedUser: UserDTO | null; // Para cuando se selecciona un usuario en la tabla
    fetchUsers: () => Promise<void>;
    fetchUserById: (userId: number) => Promise<void>;
    updateUser: (userId: number, updateData: AdminUserUpdateDTO) => Promise<void>;
    deactivateUser: (userId: number) => Promise<void>;
    activateUser: (userId: number) => Promise<void>;
    deleteUserHard: (userId: number) => Promise<void>;
    clearSelectedUser: () => void;
    clearError: () => void;
}

export const useAdminUserStore = create<AdminUserState>()(
    devtools( // Habilita las devtools de Redux para inspeccionar el store
        persist( // Persiste el estado del store en localStorage (opcional, solo si necesitas que el estado se mantenga tras recargar)
            (set, get) => ({
                users: [],
                isLoading: false,
                error: null,
                selectedUser: null,

                fetchUsers: async () => {
                    set({ isLoading: true, error: null });
                    try {
                        const fetchedUsers = await adminUserService.getAllUsers();
                        set({ users: fetchedUsers, isLoading: false });
                    } catch (err: any) {
                        set({ error: err.message || 'Error al cargar usuarios.', isLoading: false });
                    }
                },

                fetchUserById: async (userId: number) => {
                    set({ isLoading: true, error: null });
                    try {
                        const user = await adminUserService.getUserById(userId);
                        set({ selectedUser: user, isLoading: false });
                    } catch (err: any) {
                        set({ error: err.message || 'Error al cargar usuario.', isLoading: false });
                        set({ selectedUser: null }); // Limpiar el usuario seleccionado si hay error
                    }
                },

                updateUser: async (userId: number, updateData: AdminUserUpdateDTO) => {
                    set({ isLoading: true, error: null });
                    try {
                        const updatedUser = await adminUserService.updateUserStatusAndRole(userId, updateData);
                        set((state) => ({
                            users: state.users.map((user) =>
                                user.id === userId ? updatedUser : user
                            ),
                            selectedUser: state.selectedUser?.id === userId ? updatedUser : state.selectedUser,
                            isLoading: false,
                        }));
                    } catch (err: any) {
                        set({ error: err.message || 'Error al actualizar usuario.', isLoading: false });
                        throw err; // Re-lanza el error para que los componentes puedan manejarlo
                    }
                },

                deactivateUser: async (userId: number) => {
                    set({ isLoading: true, error: null });
                    try {
                        await adminUserService.deactivateUser(userId);
                        // Actualizar el estado del usuario en el store a inactivo
                        set((state) => ({
                            users: state.users.map((user) =>
                                user.id === userId ? { ...user, activo: false } : user // Asumiendo que UserDTO tiene 'activo'
                            ),
                            selectedUser: state.selectedUser?.id === userId ? { ...state.selectedUser, activo: false } : state.selectedUser,
                            isLoading: false,
                        }));
                    } catch (err: any) {
                        set({ error: err.message || 'Error al desactivar usuario.', isLoading: false });
                        throw err;
                    }
                },

                activateUser: async (userId: number) => {
                    set({ isLoading: true, error: null });
                    try {
                        const activatedUser = await adminUserService.activateUser(userId);
                        // Actualizar el estado del usuario en el store a activo
                        set((state) => ({
                            users: state.users.map((user) =>
                                user.id === userId ? activatedUser : user
                            ),
                            selectedUser: state.selectedUser?.id === userId ? activatedUser : state.selectedUser,
                            isLoading: false,
                        }));
                    } catch (err: any) {
                        set({ error: err.message || 'Error al activar usuario.', isLoading: false });
                        throw err;
                    }
                },

                deleteUserHard: async (userId: number) => {
                    set({ isLoading: true, error: null });
                    try {
                        await adminUserService.hardDeleteUser(userId);
                        set((state) => ({
                            users: state.users.filter((user) => user.id !== userId),
                            selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser,
                            isLoading: false,
                        }));
                    } catch (err: any) {
                        set({ error: err.message || 'Error al eliminar usuario físicamente.', isLoading: false });
                        throw err;
                    }
                },

                clearSelectedUser: () => {
                    set({ selectedUser: null });
                },

                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: 'admin-user-storage', 
            }
        )
    )
);
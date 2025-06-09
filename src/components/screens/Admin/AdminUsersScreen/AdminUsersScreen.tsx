import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Importar SweetAlert2

import styles from './AdminUsersScreen.module.css';
import { useAdminUserStore } from '../../../../store/useAdminUserStore';
import { UserDTO } from '../../../dto/UserDTO';
import { Rol } from '../../../../types/IRol';
import AdminUserTable from '../../../ui/AdminUserTable/AdminUserTable';
import UserDetailModal from '../../../ui/Modal/UserDetailModal/UserDetailModal';
import { Header } from '../../../ui/Header/Header';
import { Footer } from '../../../ui/Footer/Footer';
import { AdminHeader } from '../../../ui/AdminHeader/AdminHeader';

const AdminUsersScreen: React.FC = () => {
    const {
        users,
        isLoading,
        error,
        fetchUsers,
        updateUser,
        deactivateUser,
        activateUser,
        deleteUserHard,
        selectedUser,
        fetchUserById,
        clearSelectedUser,
        clearError
    } = useAdminUserStore();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditUser = (user: UserDTO) => {
        fetchUserById(user.id);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (userId: number, currentStatus: boolean) => {
        const result = await Swal.fire({
            title: 'Confirmar acción',
            text: `¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#dc2626' : '#22c55e', // Rojo para desactivar, Verde para activar
            cancelButtonColor: '#6b7280',
            confirmButtonText: currentStatus ? 'Sí, desactivar' : 'Sí, activar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                if (currentStatus) {
                    await deactivateUser(userId);
                    Swal.fire('¡Desactivado!', 'El usuario ha sido desactivado.', 'success');
                } else {
                    await activateUser(userId);
                    Swal.fire('¡Activado!', 'El usuario ha sido activado.', 'success');
                }
            } catch (err) {
                Swal.fire('Error', `Error al cambiar el estado del usuario: ${error || 'Desconocido'}`, 'error');
            }
        }
    };

    const handleChangeRole = async (userId: number, newRole: Rol) => {
        const result = await Swal.fire({
            title: 'Confirmar cambio de rol',
            text: `¿Estás seguro de que quieres cambiar el rol de este usuario a "${newRole}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cambiar rol',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await updateUser(userId, { rol: newRole });
                Swal.fire('¡Rol Actualizado!', `El rol del usuario ha sido cambiado a "${newRole}".`, 'success');
            } catch (err) {
                Swal.fire('Error', `Error al cambiar el rol del usuario: ${error || 'Desconocido'}`, 'error');
            }
        }
    };

    const handleHardDelete = async (userId: number) => {
        const result = await Swal.fire({
            title: '¡ADVERTENCIA DE ELIMINACIÓN PERMANENTE!',
            html: '¿Estás **ABSOLUTAMENTE seguro** de que quieres **ELIMINAR FÍSICAMENTE** este usuario? <br/> Esta acción es **IRREVERSIBLE** y los datos se perderán para siempre.',
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, ELIMINAR',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: styles.swalCustomPopup // Opcional: para aplicar estilos CSS personalizados a la ventana de SweetAlert
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteUserHard(userId);
                Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado permanentemente.', 'success');
            } catch (err) {
                Swal.fire('Error', `Error al eliminar físicamente el usuario: ${error || 'Desconocido'}`, 'error');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        clearSelectedUser();
        clearError();
        fetchUsers();
    };

    return (
        <>
        <Header/>
        <AdminHeader/>
        <div className={styles.screenContainer}>
            <h1 className={styles.screenTitle}>Administración de Usuarios</h1>

            <AdminUserTable
                users={users}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditUser}
                onToggleActive={handleToggleActive}
                onChangeRole={handleChangeRole}
                onHardDelete={handleHardDelete}
            />

            <UserDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />
        </div>
        <Footer/>
        </>
    );
};

export default AdminUsersScreen;
import React, { useEffect, useState } from 'react';
import styles from './SalesPage.module.css'; // Opcional: para estilos generales de la página
import { useOrderStore } from '../../../../store/orderStore';
import { SalesTable } from '../../../ui/SalesTable/SalesTable';
import { SaleDetailModal } from '../../../ui/Modal/SaleDetailModal/SaleDetailModal';
import { Header } from '../../../ui/Header/Header';
import { AdminHeader } from '../../../ui/AdminHeader/AdminHeader';
import { Footer } from '../../../ui/Footer/Footer';

const SalesPage: React.FC = () => {
    const { orders, fetchOrders, loading, error, selectedOrder, fetchOrderById, clearSelectedOrder } = useOrderStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders(); // Cargar todas las órdenes al montar la página
    }, [fetchOrders]);

    const handleViewDetails = (orderId: number) => {
        fetchOrderById(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        clearSelectedOrder(); // Limpiar la orden seleccionada en el store al cerrar el modal
    };

    if (loading) {
        return <div className={styles.loadingContainer}>Cargando órdenes de venta...</div>;
    }

    if (error) {
        return <div className={styles.errorContainer}>Error: {error}</div>;
    }

    return (
        <> 
            <Header /> 
            <AdminHeader /> 
            <div className={styles.salesPageContainer}>
                <h1 className={styles.pageTitle}>Gestión de Órdenes de Venta</h1>
                <SalesTable orders={orders} onViewDetails={handleViewDetails} />

                {selectedOrder && (
                    <SaleDetailModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        order={selectedOrder}
                    />
                )}
            </div>
            <Footer />
        </>
    );
};

export default SalesPage;
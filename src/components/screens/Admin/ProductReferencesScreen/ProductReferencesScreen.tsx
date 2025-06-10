// src/components/screens/Admin/ProductReferencesScreen/ProductReferencesScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './ProductReferencesScreen.module.css';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Importaciones de Stores
import { useCategoryStore } from '../../../../store/categoryStore';
import { useTalleStore } from '../../../../store/talleStore'; 
import { useColorStore } from '../../../../store/colorStore';
import { useDiscountStore } from '../../../../store/discountStore'; 

// Importaciones de Componentes UI
import { Header } from '../../../ui/Header/Header';
import { Footer } from '../../../ui/Footer/Footer';
import { CategoryTable } from '../../../ui/CategoryTable/CategoryTable';
import { TalleTable } from '../../../ui/TalleTable/TalleTable';
import { ColorTable } from '../../../ui/ColorTable/ColorTable';
import { DiscountTable } from '../../../ui/DiscountTable/DiscountTable'; 

import { CategoryForm } from '../../../ui/Modal/CategoryForm/CategoryForm';
import { TalleForm } from '../../../ui/Modal/TalleForm/TalleForm';
import { ColorForm } from '../../../ui/Modal/ColorForm/ColorForm';
import { DiscountForm } from '../../../ui/Modal/DiscountForm/DiscountForm'; 

import { AdminHeader } from '../../../ui/AdminHeader/AdminHeader';
import { CategoriaDTO } from '../../../dto/CategoriaDTO';
import { TalleDTO } from '../../../dto/TalleDTO';
import { ColorDTO } from '../../../dto/ColorDTO';
import { DescuentoDTO } from '../../../dto/DescuentoDTO';

export const ProductReferencesScreen = () => {
    // Estados para los formularios de las referencias
    const [currentCategoria, setCurrentCategoria] = useState<Partial<CategoriaDTO>>({ denominacion: '', activo: true, categoriaPadre: null });
    const [currentTalle, setCurrentTalle] = useState<Partial<TalleDTO>>({ nombreTalle: '', activo: true });
    const [currentColor, setCurrentColor] = useState<Partial<ColorDTO>>({ nombreColor: '', activo: true });
    const [currentDiscount, setCurrentDiscount] = useState<Partial<DescuentoDTO>>({ 
        denominacion: '',
        fechaDesde: '',
        fechaHasta: '',
        horaDesde: '',
        horaHasta: '',
        descripcionDescuento: '',
        precioPromocional: 0, 
        activo: true,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('Gestionar');
    const [activeTab, setActiveTab] = useState('categories'); // Estado para la pestaña activa

    // --- Hooks para Categorías ---
    const {
        categories: rootCategories,
        loading: loadingCategorias,
        error: errorCategorias,
        fetchRootCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
        fetchedSubcategories
    } = useCategoryStore(
        useShallow((state) => ({
            categories: state.categories,
            loading: state.loading,
            error: state.error,
            fetchRootCategories: state.fetchRootCategories,
            addCategory: state.addCategory,
            updateCategory: state.updateCategory,
            deleteCategory: state.deleteCategory,
            toggleCategoryActive: state.toggleCategoryActive,
            fetchedSubcategories: state.fetchedSubcategories
        }))
    );

    // --- Hooks para Talles ---
    const {
        talles,
        loading: loadingTalles,
        error: errorTalles,
        fetchAllTalles, 
        createTalle,
        updateTalle,
        toggleTalleStatus, 
    } = useTalleStore(
        useShallow((state) => ({
            talles: state.talles,
            loading: state.loading,
            error: state.error,
            fetchAllTalles: state.fetchAllTallesForAdmin,
            createTalle: state.createTalle,
            updateTalle: state.updateTalle,
            toggleTalleStatus: state.toggleTalleStatus, 
        }))
    );

    // --- Hooks para Colores ---
    const {
        colors,
        loading: loadingColores,
        error: errorColores,
        fetchAllColors,
        createColor,
        updateColor,
        deactivateColor,
        activateColor,
    } = useColorStore(
        useShallow((state) => ({
            colors: state.colors,
            loading: state.loading,
            error: state.error,
            fetchAllColors: state.fetchAllColors,
            createColor: state.createColor,
            updateColor: state.updateColor,
            deactivateColor: state.deactivateColor,
            activateColor: state.activateColor,
        }))
    );

    // --- Hooks para Descuentos ---
    const {
        discounts,
        loading: loadingDescuentos,
        error: errorDescuentos,
        fetchDiscounts,
        addDiscount,
        updateDiscount,
        // deleteDiscount, // Si es eliminación lógica, no necesitas esto en el store
        toggleDiscountActive,
        clearSelectedDiscount, 
    } = useDiscountStore(
        useShallow((state) => ({
            discounts: state.discounts,
            loading: state.loading,
            error: state.error,
            fetchDiscounts: state.fetchDiscounts,
            addDiscount: state.addDiscount,
            updateDiscount: state.updateDiscount,
            // deleteDiscount: state.deleteDiscount, // Quitar si es eliminación lógica
            toggleDiscountActive: state.toggleDiscountActive,
            clearSelectedDiscount: state.clearSelectedDiscount,
        }))
    );

    // --- Lógica de Categorías ---
    const clearCategoriaForm = useCallback(() => {
        setCurrentCategoria({ denominacion: '', activo: true, categoriaPadre: null });
    }, []);

    const handleNewCategoriaClick = useCallback(() => {
        setCurrentCategoria({ denominacion: '', activo: true, categoriaPadre: null });
        setModalTitle('Crear Nueva Categoría Principal');
        setIsModalOpen(true);
    }, []);

    const handleEditCategoria = useCallback((categoria: CategoriaDTO) => {
        const allAvailableCategoriesInClient = [...rootCategories, ...Array.from(useCategoryStore.getState().fetchedSubcategories.values()).flat()];
        const parent = categoria.categoriaPadre ? allAvailableCategoriesInClient.find(cat => cat.id === categoria.categoriaPadre?.id) || null : null;

        setCurrentCategoria({
            ...categoria,
            categoriaPadre: parent
        });
        setModalTitle('Editar Categoría');
        setIsModalOpen(true);
    }, [rootCategories]);

    const handleCreateSubcategoria = useCallback((parentCategory: CategoriaDTO) => {
        setCurrentCategoria({
            denominacion: '',
            activo: true,
            categoriaPadre: parentCategory
        });
        setModalTitle(`Crear Subcategoría de "${parentCategory.denominacion}"`);
        setIsModalOpen(true);
    }, []);

    const handleCategoriaChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        let value: string | boolean | number | null;

        if (e.target instanceof HTMLInputElement) {
            if (e.target.type === 'checkbox') {
                value = e.target.checked;
            } else {
                value = e.target.value;
            }
        } else {
            value = e.target.value;
        }

        if (name === 'categoriaPadre') {
            const parentId = value ? Number(value) : null;
            const allAvailableCategoriesInClient = [...rootCategories, ...Array.from(useCategoryStore.getState().fetchedSubcategories.values()).flat()];
            setCurrentCategoria(prev => ({
                ...prev,
                categoriaPadre: parentId ? allAvailableCategoriesInClient.find(cat => cat.id === parentId) || null : null
            }));
        } else {
            setCurrentCategoria(prev => ({ ...prev, [name]: value }));
        }
    }, [rootCategories]);

    const handleSubmitCategoria = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCategoria.denominacion) {
            toast.error('La denominación de la categoría es requerida.');
            return;
        }

        const categoriaToSend: Partial<CategoriaDTO> = {
            id: currentCategoria.id,
            denominacion: currentCategoria.denominacion,
            activo: currentCategoria.activo ?? true,
            categoriaPadre: currentCategoria.categoriaPadre ? { id: currentCategoria.categoriaPadre.id } as CategoriaDTO : null,
        };

        try {
            if (categoriaToSend.id) {
                await updateCategory(categoriaToSend as CategoriaDTO);
                toast.success('Categoría actualizada con éxito!');
            } else {
                await addCategory(categoriaToSend);
                toast.success('Categoría creada con éxito!');
            }
            clearCategoriaForm();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error al guardar categoría:', error);
            toast.error(`Error al guardar categoría: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [currentCategoria, addCategory, updateCategory, clearCategoriaForm]);

    const handleToggleCategoriaActive = useCallback(async (id: number, currentStatus: boolean, denominacion: string) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const confirmResult = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `¿Quieres ${action} la categoría "${denominacion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#dc3545' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}!`,
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Operación cancelada.');
            return;
        }

        try {
            await toggleCategoryActive(id, currentStatus);
            toast.success(`Categoría ${action}da con éxito!`);
        } catch (error: any) {
            console.error(`Error al ${action} categoría:`, error);
            toast.error(`Error al ${action} categoría: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [toggleCategoryActive]);

    const handleDeleteCategoria = useCallback(async (categoria: CategoriaDTO) => {
        if (!categoria.id) {
            toast.error('No se puede eliminar una categoría sin ID.');
            return;
        }

        const confirmResult = await Swal.fire({
            title: `¿Estás ABSOLUTAMENTE seguro?`,
            text: `¡Esta acción eliminará la categoría "${categoria.denominacion}" y todas sus subcategorías (si las hay)! Esta acción es irreversible.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminarla!',
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Eliminación cancelada.');
            return;
        }

        try {
            await deleteCategory(categoria.id);
            toast.success('Categoría eliminada con éxito!');
        } catch (error: any) {
            console.error('Error al eliminar categoría:', error);
            toast.error(`Error al eliminar categoría: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [deleteCategory]);

    // --- Lógica de Talles ---
    const clearTalleForm = useCallback(() => {
        setCurrentTalle({ nombreTalle: '', activo: true });
    }, []);

    const handleNewTalleClick = useCallback(() => {
        setCurrentTalle({ nombreTalle: '', activo: true });
        setModalTitle('Crear Nuevo Talle');
        setIsModalOpen(true);
    }, []);

    const handleEditTalle = useCallback((talle: TalleDTO) => {
        setCurrentTalle(talle);
        setModalTitle('Editar Talle');
        setIsModalOpen(true);
    }, []);

    const handleTalleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        let value: string | boolean;

        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }
        setCurrentTalle(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmitTalle = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTalle.nombreTalle) {
            toast.error('El nombre del talle es requerido.');
            return;
        }

        const normalizedNewName = currentTalle.nombreTalle.trim().toUpperCase();

        const isDuplicate = talles.some(talle =>
            talle.nombreTalle.trim().toUpperCase() === normalizedNewName &&
            talle.id !== currentTalle.id
        );

        if (isDuplicate) {
            toast.error(`Ya existe un talle con el nombre "${currentTalle.nombreTalle}". Por favor, elija un nombre diferente.`);
            return;
        }

        const talleToSend: Partial<TalleDTO> = {
            id: currentTalle.id,
            nombreTalle: currentTalle.nombreTalle,
            activo: currentTalle.activo ?? true,
        };

        try {
            if (talleToSend.id) {
                await updateTalle(talleToSend as TalleDTO);
                toast.success('Talle actualizado con éxito!');
            } else {
                await createTalle(talleToSend as Omit<TalleDTO, 'id'>);
                toast.success('Talle creado con éxito!');
            }
            clearTalleForm();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error al guardar talle:', error);
            toast.error(`Error al guardar talle: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [currentTalle, createTalle, updateTalle, clearTalleForm, talles]);

    const handleToggleTalleActive = useCallback(async (id: number, currentStatus: boolean, nombreTalle: string) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const confirmResult = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `¿Quieres ${action} el talle "${nombreTalle}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#dc3545' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}!`,
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Operación cancelada.');
            return;
        }

        try {
            await toggleTalleStatus(id, currentStatus, nombreTalle); 
        } catch (error: any) {
            console.error(`Error al ${action} talle:`, error);
            toast.error(`Error al ${action} talle: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [toggleTalleStatus]); 

    const handleDeleteTalle = useCallback(async (talle: TalleDTO) => {
        if (!talle.id) {
            toast.error('No se puede eliminar un talle sin ID.');
            return;
        }

        const confirmResult = await Swal.fire({
            title: `¿Estás ABSOLUTAMENTE seguro?`,
            text: `¡Esta acción desactivará lógicamente el talle "${talle.nombreTalle}"!`, 
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡desactivarlo!', 
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Eliminación cancelada.');
            return;
        }

        try {
            await toggleTalleStatus(talle.id, true, talle.nombreTalle); // Desactivar el talle
            toast.success('Talle desactivado lógicamente con éxito!'); // Mensaje ajustado
        } catch (error: any) {
            console.error('Error al desactivar talle:', error);
            toast.error(`Error al desactivar talle: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [toggleTalleStatus]);

    // --- Lógica de Colores ---
    const clearColorForm = useCallback(() => {
        setCurrentColor({ nombreColor: '', activo: true });
    }, []);

    const handleNewColorClick = useCallback(() => {
        setCurrentColor({ nombreColor: '', activo: true });
        setModalTitle('Crear Nuevo Color');
        setIsModalOpen(true);
    }, []);

    const handleEditColor = useCallback((color: ColorDTO) => {
        setCurrentColor(color);
        setModalTitle('Editar Color');
        setIsModalOpen(true);
    }, []);

    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        let value: string | boolean;

        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }
        setCurrentColor(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmitColor = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentColor.nombreColor) {
            toast.error('El nombre del color es requerido.');
            return;
        }

        const normalizedNewName = currentColor.nombreColor.trim().toUpperCase();

        const isDuplicate = colors.some(color =>
            color.nombreColor.trim().toUpperCase() === normalizedNewName &&
            color.id !== currentColor.id
        );

        if (isDuplicate) {
            toast.error(`Ya existe un color con el nombre "${currentColor.nombreColor}". Por favor, elija un nombre diferente.`);
            return;
        }

        const colorToSend: Partial<ColorDTO> = {
            id: currentColor.id,
            nombreColor: currentColor.nombreColor,
            activo: currentColor.activo ?? true,
        };

        try {
            if (colorToSend.id) {
                await updateColor(colorToSend as ColorDTO);
                toast.success('Color actualizado con éxito!');
            } else {
                await createColor(colorToSend as Omit<ColorDTO, 'id'>);
                toast.success('Color creado con éxito!');
            }
            clearColorForm();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error al guardar color:', error);
            toast.error(`Error al guardar color: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [currentColor, createColor, updateColor, clearColorForm, colors]);

    const handleToggleColorActive = useCallback(async (id: number, currentStatus: boolean, nombreColor: string) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const confirmResult = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `¿Quieres ${action} el color "${nombreColor}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#dc3545' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}!`,
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Operación cancelada.');
            return;
        }

        try {
            if (currentStatus) {
                await deactivateColor(id);
            } else {
                await activateColor(id);
            }
            toast.success(`Color ${action}do con éxito!`);
        } catch (error: any) {
            console.error(`Error al ${action} color:`, error);
            toast.error(`Error al ${action} color: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [deactivateColor, activateColor]);

    const handleDeleteColor = useCallback(async (color: ColorDTO) => {
        if (!color.id) {
            toast.error('No se puede eliminar un color sin ID.');
            return;
        }

        const confirmResult = await Swal.fire({
            title: `¿Estás ABSOLUTAMENTE seguro?`,
            text: `¡Esta acción desactivará lógicamente el color "${color.nombreColor}"!`, // Texto ajustado
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡desactivarlo!', // Texto ajustado
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Eliminación cancelada.');
            return;
        }

        try {
            await deactivateColor(color.id); 
            toast.success('Color desactivado lógicamente con éxito!'); // Mensaje ajustado
        } catch (error: any) {
            console.error('Error al desactivar color:', error);
            toast.error(`Error al desactivar color: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [deactivateColor]);


    // --- Lógica de Descuentos ---
    const clearDiscountForm = useCallback(() => {
        setCurrentDiscount({
            denominacion: '',
            fechaDesde: '',
            fechaHasta: '',
            horaDesde: '',
            horaHasta: '',
            descripcionDescuento: '',
            precioPromocional: 0,
            activo: true,
        });
        clearSelectedDiscount(); 
    }, [clearSelectedDiscount]);

    const handleNewDiscountClick = useCallback(() => {
        setCurrentDiscount({
            denominacion: '',
            fechaDesde: '',
            fechaHasta: '',
            horaDesde: '',
            horaHasta: '',
            descripcionDescuento: '',
            precioPromocional: 0,
            activo: true,
        });
        setModalTitle('Crear Nuevo Descuento');
        setIsModalOpen(true);
    }, []);

    const handleEditDiscount = useCallback((discount: DescuentoDTO) => {
        setCurrentDiscount({
            ...discount,
            fechaDesde: discount.fechaDesde ? new Date(discount.fechaDesde).toISOString().split('T')[0] : '',
            fechaHasta: discount.fechaHasta ? new Date(discount.fechaHasta).toISOString().split('T')[0] : '',
            horaDesde: discount.horaDesde?.substring(0, 5) || '',
            horaHasta: discount.horaHasta?.substring(0, 5) || '',
        });
        setModalTitle('Editar Descuento');
        setIsModalOpen(true);
    }, []);

    const handleDiscountChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setCurrentDiscount((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'precioPromocional' ? parseFloat(value) : value),
        }));
    }, []);

    const handleSubmitDiscount = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentDiscount.denominacion || !currentDiscount.fechaDesde || !currentDiscount.fechaHasta || currentDiscount.precioPromocional === undefined) {
            toast.error('Todos los campos obligatorios del descuento deben ser completados.');
            return;
        }

        const fullDateDesde = new Date(`${currentDiscount.fechaDesde}T${currentDiscount.horaDesde || '00:00'}:00`);
        const fullDateHasta = new Date(`${currentDiscount.fechaHasta}T${currentDiscount.horaHasta || '23:59'}:59`);

        if (fullDateDesde > fullDateHasta) {
            toast.error('La fecha y hora "Desde" no puede ser posterior a la fecha y hora "Hasta".');
            return;
        }

        const discountToSend: Partial<DescuentoDTO> = {
            id: currentDiscount.id,
            denominacion: currentDiscount.denominacion,
            fechaDesde: currentDiscount.fechaDesde,
            fechaHasta: currentDiscount.fechaHasta,
            horaDesde: currentDiscount.horaDesde || '00:00:00', 
            horaHasta: currentDiscount.horaHasta || '23:59:59', 
            descripcionDescuento: currentDiscount.descripcionDescuento || '',
            precioPromocional: currentDiscount.precioPromocional,
            activo: currentDiscount.activo ?? true,
        };

        try {
            if (discountToSend.id) {
                await updateDiscount(discountToSend as DescuentoDTO);
                toast.success('Descuento actualizado con éxito!');
            } else {
                await addDiscount(discountToSend);
                toast.success('Descuento creado con éxito!');
            }
            clearDiscountForm();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error al guardar descuento:', error);
            toast.error(`Error al guardar descuento: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [currentDiscount, addDiscount, updateDiscount, clearDiscountForm]);

    const handleToggleDiscountActive = useCallback(async (id: number, currentStatus: boolean, denominacion: string) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const confirmResult = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `¿Quieres ${action} el descuento "${denominacion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#dc3545' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}!`,
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Operación cancelada.');
            return;
        }

        try {
            await toggleDiscountActive(id, currentStatus);
            toast.success(`Descuento ${action}do con éxito!`);
        } catch (error: any) {
            console.error(`Error al ${action} descuento:`, error);
            toast.error(`Error al ${action} descuento: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [toggleDiscountActive]);

    const handleDeleteDiscount = useCallback(async (discount: DescuentoDTO) => {
        if (!discount.id) {
            toast.error('No se puede operar con un descuento sin ID.');
            return;
        }

        const confirmResult = await Swal.fire({
            title: `¿Estás ABSOLUTAMENTE seguro?`,
            text: `¡Esta acción desactivará lógicamente el descuento "${discount.denominacion}"!`, 
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡desactivarlo!', 
            cancelButtonText: 'No, cancelar'
        });

        if (!confirmResult.isConfirmed) {
            toast.info('Operación cancelada.');
            return;
        }

        try {
            await toggleDiscountActive(discount.id, true); // Desactivar el descuento
            toast.success('Descuento desactivado lógicamente con éxito!'); 
        } catch (error: any) {
            console.error('Error al desactivar descuento:', error);
            toast.error(`Error al desactivar descuento: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
        }
    }, [toggleDiscountActive]);

    // --- Efectos para cargar datos iniciales ---
    useEffect(() => {
        if (rootCategories.length === 0 && !loadingCategorias && !errorCategorias) {
            console.log('ProductReferencesScreen: Calling fetchRootCategories for initial load.');
            fetchRootCategories();
        }
    }, [rootCategories.length, loadingCategorias, errorCategorias, fetchRootCategories]);

    useEffect(() => {
        // fetchAllTalles en useTalleStore ahora obtiene activos e inactivos
        if (talles.length === 0 && !loadingTalles && !errorTalles) {
            console.log('ProductReferencesScreen: Calling fetchAllTalles for initial load.');
            fetchAllTalles();
        }
    }, [talles.length, loadingTalles, errorTalles, fetchAllTalles]);

    useEffect(() => {
        if (colors.length === 0 && !loadingColores && !errorColores) {
            console.log('ProductReferencesScreen: Calling fetchAllColors for initial load.');
            fetchAllColors();
        }
    }, [colors.length, loadingColores, errorColores, fetchAllColors]);

    // Este useEffect asegura que se carguen todos los descuentos al inicio del componente
    useEffect(() => {
        if (discounts.length === 0 && !loadingDescuentos && !errorDescuentos) {
            console.log('ProductReferencesScreen: Calling fetchDiscounts for initial load.');
            fetchDiscounts();
        }
    }, [discounts.length, loadingDescuentos, errorDescuentos, fetchDiscounts]);


    const allCategoriesForForm = useMemo(() => {
        const currentFetchedSubcategories = Array.from(fetchedSubcategories.values()).flat();
        return [...rootCategories, ...currentFetchedSubcategories];
    }, [rootCategories, fetchedSubcategories]);


    // --- Cierre de modal genérico ---
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        if (activeTab === 'categories') {
            clearCategoriaForm();
        } else if (activeTab === 'talles') {
            clearTalleForm();
        } else if (activeTab === 'colors') {
            clearColorForm();
        } else if (activeTab === 'discounts') {
            clearDiscountForm();
        }
    }, [activeTab, clearCategoriaForm, clearTalleForm, clearColorForm, clearDiscountForm]);


    return (
        <>
            <Header />
            <AdminHeader/>
            <div className={styles.container}>
                <h1 className={styles.title}>Gestión de Referencias de Productos</h1>

                <div className={styles.tabContainer}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'categories' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            Categorías
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'talles' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('talles')}
                        >
                            Talles
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'colors' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('colors')}
                        >
                            Colores
                        </button>
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'discounts' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('discounts')}
                        >
                            Descuentos
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'categories' && (
                            <div className={styles.managementSection}>
                                <h3>Categorías</h3>
                                <button onClick={handleNewCategoriaClick} className={styles.primaryButton} style={{ marginBottom: '20px' }}>
                                    Crear Nueva Categoría Principal
                                </button>
                                <CategoryTable
                                    categories={rootCategories}
                                    loading={loadingCategorias}
                                    error={errorCategorias}
                                    onEditCategoria={handleEditCategoria}
                                    onToggleCategoriaActive={handleToggleCategoriaActive}
                                    onDeleteCategoria={handleDeleteCategoria}
                                    onCreateSubcategoria={handleCreateSubcategoria}
                                />
                            </div>
                        )}

                        {activeTab === 'talles' && (
                            <div className={styles.managementSection}>
                                <h3>Talles</h3>
                                <button onClick={handleNewTalleClick} className={styles.primaryButton} style={{ marginBottom: '20px' }}>
                                    Crear Nuevo Talle
                                </button>
                                <TalleTable
                                    talles={talles}
                                    loading={loadingTalles}
                                    error={errorTalles}
                                    onEditTalle={handleEditTalle}
                                    onToggleTalleActive={handleToggleTalleActive}
                                    onDeleteTalle={handleDeleteTalle}
                                />
                            </div>
                        )}

                        {activeTab === 'colors' && (
                            <div className={styles.managementSection}>
                                <h3>Colores</h3>
                                <button onClick={handleNewColorClick} className={styles.primaryButton} style={{ marginBottom: '20px' }}>
                                    Crear Nuevo Color
                                </button>
                                <ColorTable
                                    colors={colors}
                                    loading={loadingColores}
                                    error={errorColores}
                                    onEditColor={handleEditColor}
                                    onToggleColorActive={handleToggleColorActive}
                                    onDeleteColor={handleDeleteColor}
                                />
                            </div>
                        )}

                        {activeTab === 'discounts' && (
                            <div className={styles.managementSection}>
                                <h3>Descuentos</h3>
                                <button onClick={handleNewDiscountClick} className={styles.primaryButton} style={{ marginBottom: '20px' }}>
                                    Crear Nuevo Descuento
                                </button>
                                <DiscountTable
                                    discounts={discounts}
                                    loading={loadingDescuentos}
                                    error={errorDescuentos}
                                    onEditDiscount={handleEditDiscount}
                                    onToggleDiscountActive={handleToggleDiscountActive}
                                    onDeleteDiscount={handleDeleteDiscount}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{modalTitle}</h2>
                            <button className={styles.closeButton} onClick={handleCloseModal}>
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {activeTab === 'categories' && (
                                <CategoryForm
                                    currentCategoria={currentCategoria}
                                    onCategoriaChange={handleCategoriaChange}
                                    onSubmitCategoria={handleSubmitCategoria}
                                    onClearForm={handleCloseModal}
                                    availableCategories={allCategoriesForForm}
                                />
                            )}
                            {activeTab === 'talles' && (
                                <TalleForm
                                    currentTalle={currentTalle}
                                    onTalleChange={handleTalleChange}
                                    onSubmitTalle={handleSubmitTalle}
                                    onClearForm={handleCloseModal}
                                />
                            )}
                            {activeTab === 'colors' && (
                                <ColorForm
                                    currentColor={currentColor}
                                    onColorChange={handleColorChange}
                                    onSubmitColor={handleSubmitColor}
                                    onClearForm={handleCloseModal}
                                />
                            )}
                            {activeTab === 'discounts' && ( 
                                <DiscountForm
                                    currentDiscount={currentDiscount}
                                    onDiscountChange={handleDiscountChange}
                                    onSubmitDiscount={handleSubmitDiscount}
                                    onClearForm={handleCloseModal}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
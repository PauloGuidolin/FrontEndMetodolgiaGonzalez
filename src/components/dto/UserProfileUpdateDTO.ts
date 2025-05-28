// src/types/dtos/UserProfileUpdateDTO.ts

import { Sexo } from '../../types/ISexo';
import { DomicilioDTO } from './DomicilioDTO';
import { Rol } from '../../types/IRol'; // Asegúrate de que la ruta a IRol sea correcta y que tu Rol sea un tipo
import { ImagenDTO } from './ImagenDTO'; // Asegúrate de que la ruta a ImagenDTO sea correcta


export interface UserProfileUpdateDTO {
    // --- PROPIEDADES NECESARIAS PARA IDENTIFICAR EL USUARIO Y MANTENER CAMPOS CLAVE ---
    id: number; // ¡CORRECCIÓN CLAVE! Añade esto.
    username: string; // Incluir para no perderlo en un PUT completo
    email: string;    // Incluir para no perderlo en un PUT completo
    role: Rol;        // Incluir para no perderlo en un PUT completo (asegúrate de importar Rol)

    // --- PROPIEDADES QUE SE PUEDEN EDITAR (DEL FORMULARIO) ---
    // Decidimos hacerlas no opcionales para forzar que siempre se envíen, incluso si son null.
    // Esto es una estrategia más robusta para evitar que se vuelvan null en el backend.
    firstname: string | null;
    lastname: string | null;
    dni: number | null;
    sexo: Sexo | null;
    fechaNacimiento: string | null; // Formato "YYYY-MM-DD" o null
    telefono: string | null;

    // --- PROPIEDADES RELACIONADAS CON OTRAS ENTIDADES ---
    imagenUser: ImagenDTO | null; // Si se envía la imagen existente o null
    addresses: DomicilioDTO[] | null; // Un array de direcciones o null
}
// src/components/dto/UserProfileUpdateDTO.ts (o la ruta donde la tengas)

import { Sexo } from '../../types/ISexo';
import { DomicilioDTO } from './DomicilioDTO';


export interface UserProfileUpdateDTO {
    firstname?: string;
    lastname?: string;
    dni?: number | null; // Si el DNI puede ser null
    
    sexo?: Sexo | null; // <-- DEBE PERMITIR Sexo O null (y undefined si no siempre está presente)
    fechaNacimiento?: string | null; // Asumo 'YYYY-MM-DD' o null
    telefono?: string;
    addresses?: DomicilioDTO[]; // Asegúrate de que DomicilioDTO esté importado o definido
    // ... cualquier otra propiedad que puedas actualizar
}
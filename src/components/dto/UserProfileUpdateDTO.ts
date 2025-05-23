import { Sexo } from '../../types/ISexo'; // Asegúrate de que la ruta a ISexo sea correcta
import { DomicilioDTO } from './DomicilioDTO'; // Asegúrate de que la ruta a DomicilioDTO sea correcta

export interface UserProfileUpdateDTO {
    firstname?: string;
    lastname?: string;
    dni?: number | null; // El DNI puede ser un número o null
    sexo?: Sexo | null; // El sexo puede ser de tipo Sexo o null
    fechaNacimiento?: string | null; // La fecha de nacimiento puede ser un string (YYYY-MM-DD) o null
    telefono?: string;
    addresses?: DomicilioDTO[]; // El array de direcciones es opcional
    // Agrega aquí cualquier otra propiedad que pueda ser actualizada
}
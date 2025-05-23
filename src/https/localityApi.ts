// src/https/locationApi.ts
import axios from 'axios';
import { LocalidadDTO, ProvinciaDTO } from '../components/dto/location';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const locationService = {
    getAllProvincias: async (): Promise<ProvinciaDTO[]> => {
        try {
            const response = await axios.get<ProvinciaDTO[]>(`${API_BASE_URL}/provincias`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provinces:', error);
            throw error;
        }
    },

    getLocalidadesByProvinciaId: async (provinciaId: number): Promise<LocalidadDTO[]> => {
        try {
            const response = await axios.get<LocalidadDTO[]>(`${API_BASE_URL}/localidades/por-provincia/${provinciaId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching localities for province ${provinciaId}:`, error);
            throw error;
        }
    },
};


import axios from 'axios';
import { AuthResponseFrontend, LoginRequestFrontend, RegisterRequestFrontend } from '../types/auth';


const API_URL = 'http://localhost:8080/auth';

class AuthService {
    async login(credentials: LoginRequestFrontend): Promise<AuthResponseFrontend> {
        try {
            const response = await axios.post<AuthResponseFrontend>(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error: any) {
            console.error('Error during login:', error.response?.data || error.message);
            throw error;
        }
    }

    async register(userData: RegisterRequestFrontend): Promise<AuthResponseFrontend> {
        try {
            const response = await axios.post<AuthResponseFrontend>(`${API_URL}/register`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Error during registration:', error.response?.data || error.message);
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem('jwt_token');
    }
}

export const authService = new AuthService();
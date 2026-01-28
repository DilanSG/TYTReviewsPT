import axios from 'axios';
import type {
    Waitress,
    Review,
    LoginRequest,
    LoginResponse,
    ReviewSubmission,
    PaginatedResponse,
    Stats,
    Customer,
    EstadoSemana,
    Admin,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/*
 * Crear instancia de Axios con baseURL centralizada.
 * Mantiene headers comunes y evita duplicación de configuración.
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
 * Inyectar token si existe en localStorage.
 * Permite autenticar automáticamente peticiones protegidas.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/*
 * Manejar 401: limpiar sesión y redirigir a login.
 * Evita estados inconsistentes cuando el token expira.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

/*
 * API de autenticación.
 * Encapsula login, registro interno y gestión de usuarios.
 */
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        return data;
    },

    register: async (userData: any): Promise<any> => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },

    /*
     * Gestión de usuarios (solo admin).
     * CRUD completo para administrar usuarios con roles.
     */
    getAllUsers: async (): Promise<{ users: Admin[]; total: number }> => {
        const { data } = await api.get('/auth/users');
        return data;
    },

    getUserById: async (id: string): Promise<{ user: Admin }> => {
        const { data } = await api.get(`/auth/users/${id}`);
        return data;
    },

    createUser: async (userData: {
        username: string;
        email: string;
        password: string;
        role: 'admin' | 'manager' | 'usuario';
    }): Promise<{ message: string; user: Admin }> => {
        const { data } = await api.post('/auth/users', userData);
        return data;
    },

    updateUser: async (
        id: string,
        userData: {
            username?: string;
            email?: string;
            password?: string;
            role?: 'admin' | 'manager' | 'usuario';
            active?: boolean;
        }
    ): Promise<{ message: string; user: Admin }> => {
        const { data } = await api.put(`/auth/users/${id}`, userData);
        return data;
    },

    deactivateUser: async (id: string): Promise<{ message: string; user: Admin }> => {
        const { data } = await api.patch(`/auth/users/${id}/deactivate`);
        return data;
    },

    activateUser: async (id: string): Promise<{ message: string; user: Admin }> => {
        const { data } = await api.patch(`/auth/users/${id}/activate`);
        return data;
    },

    deleteUser: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.delete(`/auth/users/${id}`);
        return data;
    },
};

/*
 * API de personal.
 * Incluye endpoints públicos y administrativos.
 */
export const waitressAPI = {
    getAll: async (): Promise<Waitress[]> => {
        const { data } = await api.get<Waitress[]>('/waitresses');
        return data;
    },

    getAllAdmin: async (): Promise<Waitress[]> => {
        const { data } = await api.get<Waitress[]>('/waitresses/admin/all');
        return data;
    },

    getById: async (id: string): Promise<Waitress> => {
        const { data } = await api.get<Waitress>(`/waitresses/${id}`);
        return data;
    },

    create: async (waitressData: Partial<Waitress>): Promise<any> => {
        const { data } = await api.post('/waitresses', waitressData);
        return data;
    },

    update: async (id: string, waitressData: Partial<Waitress>): Promise<any> => {
        const { data } = await api.put(`/waitresses/${id}`, waitressData);
        return data;
    },

    delete: async (id: string): Promise<any> => {
        const { data } = await api.delete(`/waitresses/${id}`);
        return data;
    },

    getStats: async (id: string): Promise<any> => {
        const { data } = await api.get(`/waitresses/${id}/stats`);
        return data;
    },
};

/*
 * API de reseñas.
 * Centraliza envío y consulta paginada.
 */
export const reviewAPI = {
    submit: async (reviewData: ReviewSubmission): Promise<any> => {
        const { data } = await api.post('/reviews', reviewData);
        return data;
    },

    checkDuplicate: async (waitressId: string): Promise<{ duplicate: boolean; retryAfter?: number }> => {
        try {
            const { data } = await api.get(`/reviews/check-duplicate/${waitressId}`);
            return data;
        } catch (error: any) {
            if (error.response?.status === 429) {
                return {
                    duplicate: true,
                    retryAfter: error.response.data?.retryAfter || 0
                };
            }
            // En caso de error de red o servidor, permitir continuar
            console.error('Error en checkDuplicate, permitiendo acceso:', error);
            return { duplicate: false };
        }
    },

    getByWaitress: async (
        waitressId: string,
        page = 1,
        limit = 10
    ): Promise<PaginatedResponse<Review>> => {
        const { data } = await api.get<PaginatedResponse<Review>>(
            `/reviews/waitress/${waitressId}`,
            { params: { page, limit } }
        );
        return data;
    },

    getAll: async (
        page = 1,
        limit = 20,
        filters?: { rating?: number; waitressId?: string }
    ): Promise<PaginatedResponse<Review>> => {
        const { data } = await api.get<PaginatedResponse<Review>>('/reviews', {
            params: { page, limit, ...filters },
        });
        return data;
    },

    delete: async (id: string): Promise<any> => {
        const { data } = await api.delete(`/reviews/${id}`);
        return data;
    },

    getOverallStats: async (): Promise<Stats> => {
        const { data } = await api.get<Stats>('/reviews/stats/overall');
        return data;
    },
};

/*
 * API de clientes.
 * Gestiona creación y actualización de semanas.
 */
export const customerAPI = {
    getAll: async (): Promise<Customer[]> => {
        const { data } = await api.get<Customer[]>('/customers');
        return data;
    },

    create: async (payload: { name: string; document?: string; phone?: string; email?: string }): Promise<{ customer: Customer }> => {
        const { data } = await api.post('/customers', payload);
        return data;
    },

    update: async (
        customerId: string,
        payload: { name?: string; document?: string; phone?: string; email?: string }
    ): Promise<{ customer: Customer }> => {
        const { data } = await api.put(`/customers/${customerId}`, payload);
        return data;
    },

    delete: async (customerId: string): Promise<void> => {
        await api.delete(`/customers/${customerId}`);
    },

    updateWeek: async (customerId: string, weekIndex: number, state: EstadoSemana): Promise<{ customer: Customer }> => {
        const { data } = await api.patch(`/customers/${customerId}/weeks/${weekIndex}`, { state });
        return data;
    },
};

export default api;

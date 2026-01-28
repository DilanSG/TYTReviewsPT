export interface Waitress {
    _id: string;
    name: string;
    photoUrl?: string;
    employeeId: string;
    gender: 'mesero' | 'mesera';
    active: boolean;
    averageRating?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewRatings {
    atencion: number;
    limpieza: number;
    rapidez: number;
    conocimientoMenu: number;
    presentacion: number;
}

export interface CategoryComments {
    atencion?: string;
    limpieza?: string;
    rapidez?: string;
    conocimientoMenu?: string;
    presentacion?: string;
}

export type EstadoSemana = 'gris' | 'rojo' | 'verde';

export interface Customer {
    _id: string;
    name: string;
    document?: string;
    phone?: string;
    email?: string;
    weekStates: EstadoSemana[];
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    _id: string;
    waitress: string | Waitress;
    ratings: ReviewRatings;
    /*
     * Promedio calculado en backend con base en las categorías.
     * Se usa para mostrar métricas y ordenamientos.
     */
    rating: number;
    categoryComments?: CategoryComments;
    comment?: string;
    customerName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Admin {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'usuario';
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: Admin;
}

export interface ReviewSubmission {
    waitressId: string;
    ratings: ReviewRatings;
    categoryComments?: CategoryComments;
    comment?: string;
    customerName?: string;
}

export interface PaginatedResponse<T> {
    reviews?: T[];
    waitresses?: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

export interface Stats {
    totalReviews: number;
    totalWaitresses: number;
    averageRating: number;
    categoryAverages?: ReviewRatings;
    ratingDistribution: Record<number, number>;
    recentReviews?: Review[];
}

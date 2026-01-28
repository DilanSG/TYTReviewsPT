import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { reviewAPI } from '../services/api';
import type { Stats, Review, ReviewRatings } from '../types';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        averages: false,
        general: false,
        categories: false,
        reviews: false,
    });
    const [reviewSeleccionada, setReviewSeleccionada] = useState<Review | null>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await reviewAPI.getOverallStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-16 h-16"></div>
            </div>
        );
    }

    const categories = [
        { key: 'atencion', label: 'Atención', description: 'Amabilidad y servicio' },
        { key: 'limpieza', label: 'Limpieza', description: 'Orden de mesa' },
        { key: 'rapidez', label: 'Rapidez', description: 'Velocidad' },
        { key: 'conocimientoMenu', label: 'Conocimiento', description: 'De la carta' },
        { key: 'presentacion', label: 'Presentación', description: 'Personal' },
    ];

    return (
        <div className="min-h-screen py-4 md:py-8 px-3 md:px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-3 mb-6 md:mb-10">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-4xl font-display font-bold text-gradient-gold mb-0.5 md:mb-1 truncate">
                            PETRA BAR
                        </h1>
                        <p className="text-gray-400 text-xs md:text-base truncate">
                            <span className="hidden md:inline">Bienvenido, </span>
                            <span className="text-gold-400 font-semibold">{user?.username}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary p-2.5 md:px-4 md:py-2 flex items-center justify-center shrink-0"
                        title="Cerrar sesión"
                    >
                        <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden md:inline">Cerrar Sesión</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
                    <div className="luxury-card p-3 md:p-6 animate-fade-in flex items-center justify-between">
                        <div className="text-gray-400 text-xs md:text-sm font-display uppercase tracking-wider">
                            Total de Reseñas
                        </div>
                        <div className="text-2xl md:text-4xl font-bold text-gradient-gold">
                            {stats?.totalReviews || 0}
                        </div>
                    </div>

                    <div className="luxury-card p-3 md:p-6 animate-fade-in flex items-center justify-between" style={{ animationDelay: '0.1s' }}>
                        <div className="text-gray-400 text-xs md:text-sm font-display uppercase tracking-wider">
                            Mesero/as creados
                        </div>
                        <div className="text-2xl md:text-4xl font-bold text-gradient-gold">
                            {stats?.totalWaitresses || 0}
                        </div>
                    </div>

                    <div className="luxury-card p-3 md:p-6 animate-fade-in flex items-center justify-between" style={{ animationDelay: '0.2s' }}>
                        <div className="text-gray-400 text-xs md:text-sm font-display uppercase tracking-wider">
                            Calificación General
                        </div>
                        <div className="text-2xl md:text-4xl font-bold text-gradient-gold flex items-center gap-1 md:gap-2">
                            {stats?.averageRating?.toFixed(1) || '0.0'}
                            <span className="text-lg md:text-2xl">★</span>
                        </div>
                    </div>
                </div>

                {stats?.categoryAverages && (
                    <div className="luxury-card mb-4 md:mb-10">
                        <button
                            onClick={() => toggleSection('averages')}
                            className="w-full p-4 md:p-8 flex justify-between items-center md:cursor-default"
                        >
                            <h2 className="text-lg md:text-2xl font-display font-bold">Promedios por Categoría</h2>
                            <svg
                                className={`w-5 h-5 md:hidden transition-transform ${expandedSections.averages ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`${expandedSections.averages ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-8 md:pb-8`}>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                                {categories.map((category, index) => {
                                    const value = stats.categoryAverages?.[category.key as keyof typeof stats.categoryAverages] || 0;
                                    return (
                                        <div
                                            key={category.key}
                                            className="bg-night-700/30 rounded-lg p-3 md:p-5 border border-night-600 text-center"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="text-xs md:text-sm text-gray-400 mb-1 font-display">{category.label}</div>
                                            <div className="text-xs text-gray-500 mb-2 md:mb-3 hidden md:block">{category.description}</div>
                                            <div className="text-2xl md:text-3xl font-bold text-gold-400">{value.toFixed(1)}</div>
                                            <div className="text-xs text-gray-500 mt-1">★</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {stats?.ratingDistribution && (
                    <div className="luxury-card mb-4 md:mb-10">
                        <button
                            onClick={() => toggleSection('general')}
                            className="w-full p-4 md:p-8 flex justify-between items-center md:cursor-default"
                        >
                            <h2 className="text-lg md:text-2xl font-display font-bold">Distribución General</h2>
                            <svg
                                className={`w-5 h-5 md:hidden transition-transform ${expandedSections.general ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`${expandedSections.general ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-8 md:pb-8 space-y-3 md:space-y-4`}>
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = stats.ratingDistribution[rating] || 0;
                                const percentage = stats.totalReviews > 0
                                    ? (count / stats.totalReviews) * 100
                                    : 0;

                                return (
                                    <div key={rating} className="flex items-center gap-2 md:gap-4">
                                        <div className="w-10 md:w-16 text-right">
                                            <span className="text-gold-400 font-semibold font-display text-sm md:text-base">{rating} ★</span>
                                        </div>
                                        <div className="flex-1 bg-night-700 rounded-full h-6 md:h-8 overflow-hidden relative">
                                            <div
                                                className="bg-gradient-gold h-full rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-16 md:w-24 text-gray-400 text-xs md:text-sm">
                                            {count} ({percentage.toFixed(0)}%)
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {stats?.categoryAverages && (
                    <div className="luxury-card mb-4 md:mb-10">
                        <button
                            onClick={() => toggleSection('categories')}
                            className="w-full p-4 md:p-8 flex justify-between items-center md:cursor-default"
                        >
                            <h2 className="text-lg md:text-2xl font-display font-bold">Distribución por Categorías</h2>
                            <svg
                                className={`w-5 h-5 md:hidden transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`${expandedSections.categories ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-8 md:pb-8 space-y-4 md:space-y-6`}>
                            {categories.map((category) => {
                                const value = stats.categoryAverages?.[category.key as keyof typeof stats.categoryAverages] || 0;
                                const percentage = (value / 5) * 100;

                                return (
                                    <div key={category.key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="text-gray-200 font-display font-semibold text-sm md:text-base">{category.label}</span>
                                                <span className="text-gray-500 text-xs md:text-sm ml-2">({category.description})</span>
                                            </div>
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <span className="text-gold-400 font-bold font-display text-base md:text-lg">{value.toFixed(1)}</span>
                                                <span className="text-gold-500 text-sm md:text-base">★</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <div className="flex-1 bg-night-700 rounded-full h-4 md:h-6 overflow-hidden relative">
                                                <div
                                                    className="bg-gradient-gold h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-12 md:w-16 text-gray-400 text-xs md:text-sm text-right">
                                                {percentage.toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {stats?.recentReviews && stats.recentReviews.length > 0 && (
                    <div className="luxury-card mb-4 md:mb-10">
                        <button
                            onClick={() => toggleSection('reviews')}
                            className="w-full p-4 md:p-8 flex justify-between items-center md:cursor-default"
                        >
                            <h2 className="text-lg md:text-2xl font-display font-bold">Reseñas Recientes</h2>
                            <svg
                                className={`w-5 h-5 md:hidden transition-transform ${expandedSections.reviews ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`${expandedSections.reviews ? 'block' : 'hidden md:block'} px-4 pb-4 md:px-8 md:pb-8 space-y-3 md:space-y-4`}>
                            {stats.recentReviews.map((review: any) => (
                                <button
                                    key={review._id}
                                    onClick={() => setReviewSeleccionada(review)}
                                    className="bg-night-700/50 rounded-lg p-3 md:p-5 border border-night-600 hover:border-gold-400/30 transition-all duration-300 w-full text-left cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2 md:mb-3">
                                        <div>
                                            <span className="font-semibold text-gray-200 font-display text-sm md:text-base">
                                                {review.waitress?.name || 'Personal'}
                                            </span>
                                            {review.customerName && (
                                                <span className="text-gray-400 text-xs md:text-sm ml-2">
                                                    por {review.customerName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gold-400 font-bold font-display text-sm md:text-base">
                                                {review.rating?.toFixed(1)}
                                            </span>
                                            <span className="text-gold-500 text-sm md:text-base">★</span>
                                        </div>
                                    </div>

                                    {review.ratings && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-1 md:gap-2 mb-2 md:mb-3">
                                            {categories.map((cat) => (
                                                <div key={cat.key} className="text-xs">
                                                    <span className="text-gray-500">{cat.label}:</span>
                                                    <span className="text-gold-400 ml-1 font-semibold">
                                                        {review.ratings[cat.key]}★
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {review.comment && (
                                        <p className="text-gray-400 text-xs md:text-sm mb-2">{review.comment}</p>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">


                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="luxury-card-hover p-4 md:p-8 text-left group"
                    >
                        <div className="text-xl md:text-3xl mb-2 md:mb-4 font-display text-gold-400 tracking-wider">CLIENTES</div>
                        <h3 className="text-lg md:text-2xl font-display font-bold mb-1 md:mb-2 group-hover:text-gold-400 transition-colors">
                            Gestión de Clientes
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base">
                            Agregar y administrar clientes del bar
                        </p>
                    </button>
                    <button
                        onClick={() => navigate('/admin/waitresses')}
                        className="luxury-card-hover p-4 md:p-8 text-left group"
                    >
                        <div className="text-xl md:text-3xl mb-2 md:mb-4 font-display text-gold-400 tracking-wider">PERSONAL</div>
                        <h3 className="text-lg md:text-2xl font-display font-bold mb-1 md:mb-2 group-hover:text-gold-400 transition-colors">
                            Gestión de Personal
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base">
                            Agregar, editar o gestionar el equipo
                        </p>
                    </button>

                    <button
                        onClick={() => navigate('/admin/reviews')}
                        className="luxury-card-hover p-4 md:p-8 text-left group"
                    >
                        <div className="text-xl md:text-3xl mb-2 md:mb-4 font-display text-gold-400 tracking-wider">RESEÑAS</div>
                        <h3 className="text-lg md:text-2xl font-display font-bold mb-1 md:mb-2 group-hover:text-gold-400 transition-colors">
                            Ver Todas las Reseñas
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base">
                            Revisar y gestionar calificaciones
                        </p>
                    </button>

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="luxury-card-hover p-4 md:p-8 text-left group"
                        >
                            <div className="text-xl md:text-3xl mb-2 md:mb-4 font-display text-gold-400 tracking-wider">USUARIOS</div>
                            <h3 className="text-lg md:text-2xl font-display font-bold mb-1 md:mb-2 group-hover:text-gold-400 transition-colors">
                                Gestión de Usuarios
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base">
                                Administrar roles y permisos
                            </p>
                        </button>
                    )}
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="btn-ghost text-sm md:text-base"
                    >
                        Ver Sitio Público →
                    </button>
                </div>
            </div>

            {reviewSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setReviewSeleccionada(null)}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">
                                {typeof reviewSeleccionada.waitress === 'object' && reviewSeleccionada.waitress !== null
                                    ? reviewSeleccionada.waitress.name
                                    : 'Personal'}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base">
                                Detalle de calificaciones por categoría
                            </p>
                        </div>

                        <div className="bg-night-700/40 rounded-lg p-4 text-center mb-6 border border-night-600">
                            <div className="text-xs text-gray-400 mb-1">Promedio general</div>
                            <div className="text-4xl font-display font-bold text-gold-400">
                                {reviewSeleccionada.rating?.toFixed(1)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {reviewSeleccionada.ratings && categories.map((categoria) => (
                                <div
                                    key={categoria.key}
                                    className="bg-night-700/40 rounded-lg p-4 border border-night-600"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm md:text-base">
                                            {categoria.label}
                                        </span>
                                        <span className="text-gold-400 font-bold">
                                            {reviewSeleccionada.ratings[categoria.key as keyof ReviewRatings]}★
                                        </span>
                                    </div>
                                    {reviewSeleccionada.categoryComments?.[categoria.key as keyof ReviewRatings] && (
                                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-night-600">
                                            {reviewSeleccionada.categoryComments[categoria.key as keyof ReviewRatings]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {reviewSeleccionada.comment && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Comentario general</h3>
                                <div className="text-sm text-gray-300 bg-night-700/40 border border-night-600 rounded-lg p-4">
                                    {reviewSeleccionada.comment}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setReviewSeleccionada(null)}
                            className="btn-secondary w-full mt-6"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

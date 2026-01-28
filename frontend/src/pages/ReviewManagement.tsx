import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI, waitressAPI } from '../services/api';
import type { Review, Waitress, PaginatedResponse } from '../types';

const ReviewManagement: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [waitresses, setWaitresses] = useState<Waitress[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterRating, setFilterRating] = useState<number | undefined>();
    const [filterWaitress, setFilterWaitress] = useState<string | undefined>();
    const [reviewSeleccionada, setReviewSeleccionada] = useState<Review | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadWaitresses();
    }, []);

    useEffect(() => {
        loadReviews();
    }, [page, filterRating, filterWaitress]);

    const loadWaitresses = async () => {
        try {
            const data = await waitressAPI.getAll();
            setWaitresses(data);
        } catch (error) {
            console.error('Error loading waitresses:', error);
        }
    };

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data: PaginatedResponse<Review> = await reviewAPI.getAll(page, 20, {
                rating: filterRating,
                waitressId: filterWaitress,
            });
            setReviews(data.reviews || []);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

        try {
            await reviewAPI.delete(id);
            await loadReviews();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar reseña');
        }
    };

    const getWaitressName = (review: Review): string => {
        if (typeof review.waitress === 'object' && review.waitress !== null) {
            return review.waitress.name;
        }
        if (typeof review.waitress === 'string') {
            const waitress = waitresses.find((w) => w._id === review.waitress);
            return waitress?.name || 'Desconocida';
        }
        return 'Desconocida';
    };

    const categorias = [
        { key: 'atencion', label: 'Atención' },
        { key: 'limpieza', label: 'Limpieza' },
        { key: 'rapidez', label: 'Rapidez' },
        { key: 'conocimientoMenu', label: 'Conocimiento de la Carta' },
        { key: 'presentacion', label: 'Presentación' },
    ] as const;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn-ghost mb-4"
                    >
                        ← Volver al Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
                        Gestión de Reseñas
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base mt-2">
                        Revisa calificaciones, comentarios y detalles por categoría
                    </p>
                </div>

                <div className="luxury-card p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Filtrar por Mesera
                            </label>
                            <select
                                value={filterWaitress || ''}
                                onChange={(e) => {
                                    setFilterWaitress(e.target.value || undefined);
                                    setPage(1);
                                }}
                                className="input-field"
                            >
                                <option value="">Todas</option>
                                {waitresses.map((w) => (
                                    <option key={w._id} value={w._id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Filtrar por Calificación
                            </label>
                            <select
                                value={filterRating || ''}
                                onChange={(e) => {
                                    setFilterRating(e.target.value ? parseInt(e.target.value) : undefined);
                                    setPage(1);
                                }}
                                className="input-field"
                            >
                                <option value="">Todas</option>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <option key={rating} value={rating}>
                                        {rating} Estrellas
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner w-12 h-12"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="luxury-card p-12 text-center text-gray-400">
                        No se encontraron reseñas
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {reviews.map((review) => (
                                <button
                                    key={review._id}
                                    onClick={() => setReviewSeleccionada(review)}
                                    className="luxury-card-hover p-6 text-left transition-all"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-lg text-gray-200">
                                                    {getWaitressName(review)}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gold-400 font-bold text-lg">
                                                        {review.rating?.toFixed(1)}
                                                    </span>
                                                    <span className="text-gold-500 text-xl">★</span>
                                                </div>
                                            </div>
                                            {review.customerName && (
                                                <div className="text-sm text-gray-400 mb-2">
                                                    Por: {review.customerName}
                                                </div>
                                            )}
                                            {review.comment && (
                                                <p className="text-gray-300 text-sm md:text-base mb-3 line-clamp-2">
                                                    {review.comment}
                                                </p>
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
                                        </div>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDelete(review._id);
                                            }}
                                            className="btn-ghost text-xs text-neon-red hover:text-neon-red/80"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                                        {review.ratings && categorias.map((categoria) => (
                                            <span
                                                key={categoria.key}
                                                className="px-2 py-1 rounded-full bg-night-700/60 border border-night-600"
                                            >
                                                {categoria.label}: {review.ratings[categoria.key]}★
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary"
                                >
                                    ← Anterior
                                </button>
                                <div className="flex items-center gap-2 px-4">
                                    <span className="text-gray-400">
                                        Página {page} de {totalPages}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {reviewSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setReviewSeleccionada(null)}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-2xl">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">
                                {getWaitressName(reviewSeleccionada)}
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
                            {reviewSeleccionada.ratings && categorias.map((categoria) => (
                                <div
                                    key={categoria.key}
                                    className="bg-night-700/40 rounded-lg p-4 border border-night-600"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm md:text-base">
                                            {categoria.label}
                                        </span>
                                        <span className="text-gold-400 font-bold">
                                            {reviewSeleccionada.ratings[categoria.key]}★
                                        </span>
                                    </div>
                                    {reviewSeleccionada.categoryComments?.[categoria.key] && (
                                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-night-600">
                                            {reviewSeleccionada.categoryComments[categoria.key]}
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

export default ReviewManagement;

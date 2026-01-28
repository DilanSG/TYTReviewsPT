import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { waitressAPI, reviewAPI } from '../services/api';
import type { Waitress, ReviewRatings, CategoryComments } from '../types';
import RatingStars from '../components/RatingStars';

const ReviewForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [waitress, setWaitress] = useState<Waitress | null>(null);
    const [ratings, setRatings] = useState<ReviewRatings>({
        atencion: 0,
        limpieza: 0,
        rapidez: 0,
        conocimientoMenu: 0,
        presentacion: 0,
    });
    const [categoryComments, setCategoryComments] = useState<CategoryComments>({
        atencion: '',
        limpieza: '',
        rapidez: '',
        conocimientoMenu: '',
        presentacion: '',
    });
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
        show: false,
        message: ''
    });

    useEffect(() => {
        if (id) {
            loadWaitress();
        }
    }, [id]);

    const loadWaitress = async () => {
        try {
            const data = await waitressAPI.getById(id!);
            setWaitress(data);
        } catch (error) {
            console.error('Error loading waitress:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAverage = () => {
        const values = Object.values(ratings).filter(v => v > 0);
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    };

    const allRatingsComplete = () => {
        return Object.values(ratings).every(v => v > 0);
    };

    const handleRatingChange = (category: keyof ReviewRatings, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleCategoryCommentChange = (category: keyof CategoryComments, value: string) => {
        setCategoryComments(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!allRatingsComplete()) {
            alert('Por favor completa todas las calificaciones');
            return;
        }

        setSubmitting(true);

        try {
            await reviewAPI.submit({
                waitressId: id!,
                ratings,
                categoryComments,
                comment: comment.trim() || undefined,
                customerName: customerName.trim() || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2500);
        } catch (error: any) {
            /*
             * Manejo específico de reseña duplicada (429 Too Many Requests).
             * Muestra mensaje de próxima visita.
             */
            if (error.response?.status === 429) {
                setErrorModal({
                    show: true,
                    message: 'Ya has calificado a nuestro personal en esta visita.\n\nPodrás enviar una nueva reseña en tu próxima visita.'
                });
            } else {
                setErrorModal({
                    show: true,
                    message: error.response?.data?.message || 'Error al enviar reseña'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-16 h-16"></div>
            </div>
        );
    }

    if (!waitress) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl text-gray-400 mb-6">Personal no encontrado</h2>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="luxury-card p-12 text-center max-w-md animate-slide-up">
                    <div className="text-6xl mb-6 text-gold-400">✓</div>
                    <h2 className="text-3xl font-display font-bold text-gradient-gold mb-3">
                        ¡Gracias!
                    </h2>
                    <p className="text-gray-400">Tu opinión es muy importante para nosotros</p>
                </div>
            </div>
        );
    }

    const average = calculateAverage();

    const categories = [
        { 
            key: 'atencion' as keyof ReviewRatings, 
            label: 'Atención', 
            description: 'Amabilidad y servicio',
            commentLabel: '¿Cómo fue la atención que recibiste?',
            commentPlaceholder: 'Cuéntanos sobre la amabilidad y el trato del personal...'
        },
        { 
            key: 'limpieza' as keyof ReviewRatings, 
            label: 'Limpieza de Mesa', 
            description: 'Orden y presentación',
            commentLabel: '¿Qué tal encontraste la limpieza de tu mesa?',
            commentPlaceholder: 'Describe el estado de limpieza y orden de tu mesa...'
        },
        { 
            key: 'rapidez' as keyof ReviewRatings, 
            label: 'Rapidez', 
            description: 'Velocidad del servicio',
            commentLabel: '¿El servicio fue lo suficientemente rápido?',
            commentPlaceholder: 'Coméntanos sobre el tiempo de espera y la agilidad del servicio...'
        },
        { 
            key: 'conocimientoMenu' as keyof ReviewRatings, 
            label: 'Conocimiento de la Carta', 
            description: 'Recomendaciones',
            commentLabel: '¿Te ayudó el personal con recomendaciones?',
            commentPlaceholder: 'Comparte tu experiencia con las sugerencias y conocimiento de la carta...'
        },
        { 
            key: 'presentacion' as keyof ReviewRatings, 
            label: 'Presentación Personal', 
            description: 'Apariencia profesional',
            commentLabel: '¿Cómo te pareció la presentación del personal?',
            commentPlaceholder: 'Cuéntanos sobre la apariencia y profesionalismo del equipo...'
        },
    ];

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="btn-ghost mb-8 flex items-center gap-2"
                >
                    ← Volver
                </button>

                <div className="luxury-card p-8 mb-8 text-center animate-slide-up">
                    <div className="flex flex-col items-center space-y-4">
                        {waitress.photoUrl ? (
                            <img
                                src={waitress.photoUrl}
                                alt={waitress.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-night-600 shadow-luxury"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-gold flex items-center justify-center text-night-900 text-3xl font-bold border-4 border-night-600 shadow-luxury font-display">
                                {waitress.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">
                                {waitress.name}
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <span className="text-gold-400 font-semibold">
                                    {waitress.averageRating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-night-500">•</span>
                                <span>{waitress.reviewCount || 0} reseñas</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="luxury-card p-8 space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold mb-2">
                            Califica la atención
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Evalúa cada aspecto del servicio
                        </p>
                    </div>

                    {average > 0 && (
                        <div className="bg-night-700/50 rounded-lg p-6 text-center border border-gold-400/20">
                            <div className="text-sm text-gray-400 mb-2">Promedio General</div>
                            <div className="text-5xl font-display font-bold text-gradient-gold">
                                {average.toFixed(1)}
                            </div>
                            <div className="flex justify-center mt-3">
                                <RatingStars rating={average} readonly size="sm" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {categories.map((category, index) => (
                            <div
                                key={category.key}
                                className="bg-night-700/30 rounded-lg p-6 border border-night-600 hover:border-gold-400/30 transition-all"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display font-semibold text-gray-200 mb-1">
                                            {category.label}
                                        </h3>
                                        <p className="text-sm text-gray-500">{category.description}</p>
                                    </div>
                                    <div className="flex justify-center sm:justify-end">
                                        <RatingStars
                                            rating={ratings[category.key]}
                                            onRatingChange={(value) => handleRatingChange(category.key, value)}
                                            size="md"
                                        />
                                    </div>
                                </div>
                                
                                {ratings[category.key] > 0 && (
                                    <div className="mt-4 animate-fade-in">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {category.commentLabel}
                                        </label>
                                        <textarea
                                            value={categoryComments[category.key] || ''}
                                            onChange={(e) => handleCategoryCommentChange(category.key, e.target.value)}
                                            placeholder={category.commentPlaceholder}
                                            className="input-luxury min-h-[80px] resize-none text-sm"
                                            maxLength={300}
                                        />
                                        <div className="text-right text-xs text-gray-500 mt-1">
                                            {(categoryComments[category.key] || '').length}/300
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="divider-luxury"></div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Tu nombre (opcional)
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Anónimo"
                            className="input-luxury"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Comentario (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Cuéntanos sobre tu experiencia..."
                            className="input-luxury min-h-[120px] resize-none"
                            maxLength={500}
                        />
                        <div className="text-right text-xs text-gray-500 mt-2">
                            {comment.length}/500
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !allRatingsComplete()}
                        className="btn-primary w-full text-lg py-4 font-display"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="spinner w-5 h-5"></div>
                                Enviando...
                            </span>
                        ) : (
                            'Enviar Calificación'
                        )}
                    </button>

                    {!allRatingsComplete() && (
                        <p className="text-center text-sm text-gray-500">
                            Completa todas las categorías para enviar tu reseña
                        </p>
                    )}
                </form>
            </div>

            {errorModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setErrorModal({ show: false, message: '' })}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-md animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-redGlow/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-neon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gradient-gold mb-3">
                                Error
                            </h2>
                            <p className="text-gray-300 whitespace-pre-line">
                                {errorModal.message}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setErrorModal({ show: false, message: '' });
                                navigate('/');
                            }}
                            className="btn-secondary w-full"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewForm;

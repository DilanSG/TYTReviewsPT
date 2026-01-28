import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitressAPI, reviewAPI } from '../services/api';
import type { Waitress } from '../types';
import WaitressCard from '../components/WaitressCard';

const PublicReview: React.FC = () => {
    const [waitresses, setWaitresses] = useState<Waitress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [blockModal, setBlockModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadWaitresses();
    }, []);

    const loadWaitresses = async () => {
        try {
            const data = await waitressAPI.getAll();
            setWaitresses(data);
        } catch (error) {
            console.error('Error loading waitresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWaitressClick = async (waitress: Waitress) => {
        try {
            const result = await reviewAPI.checkDuplicate(waitress._id);
            
            if (result.duplicate) {
                setBlockModal(true);
            } else {
                navigate(`/review/${waitress._id}`);
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
            // No navegar en caso de error - mantener al usuario en la lista
        }
    };

    const filteredWaitresses = waitresses.filter((w) =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-16 h-16"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 md:py-12 px-3 md:px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8 md:mb-16 animate-slide-up">
                    <div className="mb-4 md:mb-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-1 md:mb-2 tracking-tight px-4">
                            <span className="text-gradient-gold text-glow">PETRA BAR</span>
                        </h1>
                        <p className="text-gold-400/60 text-xs md:text-sm font-display tracking-[0.2em] md:tracking-[0.3em] uppercase">
                            Galerías • Bogotá
                        </p>
                    </div>

                    <div className="mb-6 md:mb-8 px-4">
                        <p className="text-base md:text-xl lg:text-2xl text-gray-300 font-light">
                            Califica la atención de nuestro equipo
                        </p>
                    </div>

                    <div className="max-w-md mx-auto px-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-luxury w-full text-center text-sm md:text-base py-3 md:py-4"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filteredWaitresses.length === 0 ? (
                    <div className="text-center py-12 md:py-16 px-4">
                        <div className="luxury-card p-8 md:p-12 inline-block">
                            <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-gray-400 text-base md:text-lg">
                                {searchTerm
                                    ? 'No se encontraron resultados'
                                    : 'No hay personal disponible'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="btn-secondary mt-4 text-sm"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {searchTerm && (
                            <div className="text-center mb-4 md:mb-6 px-4">
                                <p className="text-sm md:text-base text-gray-400">
                                    {filteredWaitresses.length} {filteredWaitresses.length === 1 ? 'resultado' : 'resultados'}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-12 px-4">
                            {filteredWaitresses.map((waitress, index) => (
                                <div
                                    key={waitress._id}
                                    className="animate-fade-in w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <WaitressCard
                                        waitress={waitress}
                                        onClick={() => handleWaitressClick(waitress)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="text-center mt-12 md:mt-16 pt-6 md:pt-8 border-t border-night-600 px-4">
                    <div className="space-y-3 md:space-y-4">
                        <p className="text-xs md:text-sm text-gray-500">
                            Tu opinión nos ayuda a mejorar
                        </p>
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="btn-ghost text-xs md:text-sm tracking-wider uppercase"
                        >
                            Acceso Administrativo
                        </button>
                    </div>
                </div>
            </div>

            {blockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setBlockModal(false)}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-md animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-400/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gradient-gold mb-3">
                                Ya Calificaste
                            </h2>
                            <p className="text-gray-300 mb-2">
                                Ya has calificado a nuestro personal en esta visita.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Podrás enviar una nueva reseña en tu próxima visita.
                            </p>
                        </div>

                        <button
                            onClick={() => setBlockModal(false)}
                            className="btn-secondary w-full"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicReview;

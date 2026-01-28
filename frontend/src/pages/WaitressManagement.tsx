import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitressAPI } from '../services/api';
import type { Waitress, Stats, ReviewRatings } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const WaitressManagement: React.FC = () => {
    const [waitresses, setWaitresses] = useState<Waitress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWaitress, setEditingWaitress] = useState<Waitress | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'mesera' as 'mesero' | 'mesera',
        photoUrl: '',
        active: true,
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
        show: false,
        id: '',
        name: '',
    });
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [selectedWaitress, setSelectedWaitress] = useState<Waitress | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [waitressStats, setWaitressStats] = useState<Stats | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadWaitresses();
    }, []);

    const loadWaitresses = async () => {
        try {
            const data = await waitressAPI.getAllAdmin();
            setWaitresses(data);
        } catch (error) {
            console.error('Error loading waitresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (waitress?: Waitress) => {
        if (waitress) {
            setEditingWaitress(waitress);
            setFormData({
                name: waitress.name,
                gender: waitress.gender,
                photoUrl: waitress.photoUrl || '',
                active: waitress.active,
            });
            setPhotoPreview(waitress.photoUrl || '');
        } else {
            setEditingWaitress(null);
            setFormData({ name: '', gender: 'mesera', photoUrl: '', active: true });
            setPhotoPreview('');
        }
        setPhotoFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingWaitress(null);
        setFormData({ name: '', gender: 'mesera', photoUrl: '', active: true });
        setPhotoFile(null);
        setPhotoPreview('');
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const submitData: any = {
                name: formData.name,
                gender: formData.gender,
                active: formData.active,
            };

            /*
             * Si hay foto seleccionada, se envía como base64.
             * Si no, se mantiene la URL existente cuando aplica.
             */
            if (photoFile) {
                submitData.photoUrl = photoPreview;
            } else if (formData.photoUrl) {
                submitData.photoUrl = formData.photoUrl;
            }

            if (editingWaitress) {
                await waitressAPI.update(editingWaitress._id, submitData);
            } else {
                await waitressAPI.create(submitData);
            }
            await loadWaitresses();
            handleCloseModal();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar');
        }
    };

    const handleToggleActive = async (waitress: Waitress) => {
        try {
            await waitressAPI.update(waitress._id, { active: !waitress.active });
            await loadWaitresses();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar estado');
        }
    };

    const handleDeleteClick = (waitress: Waitress) => {
        setDeleteConfirm({
            show: true,
            id: waitress._id,
            name: waitress.name,
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await waitressAPI.delete(deleteConfirm.id);
            await loadWaitresses();
            setDeleteConfirm({ show: false, id: '', name: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar');
        }
    };

    const categories: { key: keyof ReviewRatings; label: string; description: string }[] = [
        { key: 'atencion', label: 'Atención', description: 'Amabilidad y servicio' },
        { key: 'limpieza', label: 'Limpieza', description: 'Orden de mesa' },
        { key: 'rapidez', label: 'Rapidez', description: 'Velocidad' },
        { key: 'conocimientoMenu', label: 'Conocimiento', description: 'De la carta' },
        { key: 'presentacion', label: 'Presentación', description: 'Personal' },
    ];

    const abrirStats = async (waitress: Waitress) => {
        setSelectedWaitress(waitress);
        setStatsModalOpen(true);
        setStatsLoading(true);
        try {
            const data = await waitressAPI.getStats(waitress._id);
            setWaitressStats(data);
        } catch (error) {
            console.error('Error loading waitress stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const cerrarStats = () => {
        setStatsModalOpen(false);
        setSelectedWaitress(null);
        setWaitressStats(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-16 h-16"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-center md:text-left">
                    <div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="btn-ghost mb-3"
                        >
                            ← Volver al Inicio
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">
                            Gestión de Meseros 
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base mt-2">
                            Administra el equipo, estados y métricas de servicio
                        </p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="btn-primary">
                        + Agregar Mesero/a
                    </button>
                </div>

                <div className="luxury-card overflow-hidden hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-night-800/50 border-b border-night-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Personal
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Género
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Calificación
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Reseñas
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 font-display">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-night-600">
                                {waitresses.map((waitress) => (
                                    <tr
                                        key={waitress._id}
                                        onClick={() => abrirStats(waitress)}
                                        className="hover:bg-night-700/30 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {waitress.photoUrl ? (
                                                    <img
                                                        src={waitress.photoUrl}
                                                        alt={waitress.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-night-600"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-night-900 text-sm font-bold font-display border-2 border-night-600">
                                                        {waitress.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-200">
                                                    {waitress.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-gold capitalize">
                                                {waitress.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gold-400 font-semibold">
                                                {waitress.averageRating?.toFixed(1) || '0.0'} ★
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {waitress.reviewCount || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleToggleActive(waitress);
                                                }}
                                                className={`badge cursor-pointer transition-all ${waitress.active
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'
                                                    }`}
                                            >
                                                {waitress.active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOpenModal(waitress);
                                                    }}
                                                    className="btn-ghost text-xs py-1 px-3"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteClick(waitress);
                                                    }}
                                                    className="btn-ghost text-xs py-1 px-3 text-neon-red hover:text-neon-red/80"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {waitresses.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No hay personal registrado
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                    {waitresses.map((waitress) => (
                        <div
                            key={waitress._id}
                            className="luxury-card p-5 cursor-pointer"
                            onClick={() => abrirStats(waitress)}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                {waitress.photoUrl ? (
                                    <img
                                        src={waitress.photoUrl}
                                        alt={waitress.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-night-600"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-night-900 text-sm font-bold font-display border-2 border-night-600">
                                        {waitress.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-display font-semibold text-gray-100">
                                        {waitress.name}
                                    </h3>
                                    <p className="text-xs text-gray-400">{waitress.reviewCount || 0} Reseñas</p>
                                </div>
                                <span className="badge badge-gold capitalize">
                                    {waitress.gender}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="text-gold-400 font-semibold">
                                    {waitress.averageRating?.toFixed(1) || '0.0'} ★
                                </span>
                        
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleActive(waitress);
                                    }}
                                    className={`badge cursor-pointer transition-all ${waitress.active
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}
                                >
                                    {waitress.active ? 'Activo' : 'Inactivo'}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleOpenModal(waitress);
                                    }}
                                    className="btn-ghost text-xs flex-1"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteClick(waitress);
                                    }}
                                    className="btn-ghost text-xs flex-1 text-neon-red hover:text-neon-red/80"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="luxury-card p-8 max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto">
                            <h2 className="text-3xl font-display font-bold mb-6 text-gradient-gold">
                                {editingWaitress ? 'Editar Personal' : 'Agregar Personal'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Foto
                                    </label>
                                    <div className="flex justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            id="photo-upload"
                                        />
                                        <label
                                            htmlFor="photo-upload"
                                            className="cursor-pointer group"
                                        >
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-32 h-32 rounded-full object-cover border-2 border-gold-400/30 group-hover:border-gold-400/60 transition-all"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-night-700 border-2 border-night-600 group-hover:border-gold-400/40 flex items-center justify-center text-gray-500 transition-all">
                                                    <span className="text-sm text-center px-4">Click para subir</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="input-luxury"
                                        required
                                        placeholder="Ej: María García"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Género *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'mesera' })}
                                            className={`py-3 px-4 rounded-lg font-medium transition-all ${formData.gender === 'mesera'
                                                ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-night-900'
                                                : 'luxury-card hover:border-gold-400/30'
                                                }`}
                                        >
                                            ⦿ Mesera
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'mesero' })}
                                            className={`py-3 px-4 rounded-lg font-medium transition-all ${formData.gender === 'mesero'
                                                ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-night-900'
                                                : 'luxury-card hover:border-gold-400/30'
                                                }`}
                                        >
                                            ⦿ Mesero
                                        </button>
                                    </div>
                                </div>

                                {editingWaitress && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Estado
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, active: true })}
                                                className={`py-3 px-4 rounded-lg font-medium transition-all ${formData.active
                                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                                                    : 'luxury-card hover:border-green-500/30'
                                                    }`}
                                            >
                                                ✓ Activo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, active: false })}
                                                className={`py-3 px-4 rounded-lg font-medium transition-all ${!formData.active
                                                    ? 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
                                                    : 'luxury-card hover:border-gray-500/30'
                                                    }`}
                                            >
                                                ✕ Inactivo
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingWaitress ? 'Guardar Cambios' : 'Agregar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={deleteConfirm.show}
                    title="Eliminar Personal"
                    message={`¿Estás seguro de que deseas eliminar a ${deleteConfirm.name}? Esta acción no se puede deshacer y se eliminarán todas sus reseñas.`}
                    confirmText="Sí, Eliminar"
                    cancelText="Cancelar"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                    type="danger"
                />
            </div>

            {statsModalOpen && selectedWaitress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={cerrarStats}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">
                                {selectedWaitress.name}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base">
                                Métricas detalladas por categoría
                            </p>
                        </div>

                        {statsLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="spinner w-12 h-12"></div>
                            </div>
                        ) : !waitressStats || waitressStats.totalReviews === 0 ? (
                            <div className="luxury-card p-6 text-center text-gray-400">
                                No hay reseñas registradas para este personal
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-night-700/40 rounded-lg p-4 text-center border border-night-600">
                                        <div className="text-xs text-gray-400 mb-1">Reseñas</div>
                                        <div className="text-2xl font-display font-bold text-gold-400">
                                            {waitressStats.totalReviews}
                                        </div>
                                    </div>
                                    <div className="bg-night-700/40 rounded-lg p-4 text-center border border-night-600">
                                        <div className="text-xs text-gray-400 mb-1">Promedio General</div>
                                        <div className="text-2xl font-display font-bold text-gold-400">
                                            {waitressStats.averageRating?.toFixed(1)} ★
                                        </div>
                                    </div>
                                    <div className="bg-night-700/40 rounded-lg p-4 text-center border border-night-600">
                                        <div className="text-xs text-gray-400 mb-1">Nivel</div>
                                        <div className="text-2xl font-display font-bold text-gold-400">
                                            {Math.round(waitressStats.averageRating || 0)} ★
                                        </div>
                                    </div>
                                </div>

                                {waitressStats.categoryAverages && (
                                    <div>
                                        <h3 className="text-lg font-display font-bold mb-3">Promedios por Categoría</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {categories.map((category) => {
                                                const value = waitressStats.categoryAverages?.[category.key] || 0;
                                                return (
                                                    <div
                                                        key={category.key}
                                                        className="bg-night-700/30 rounded-lg p-3 md:p-4 border border-night-600 text-center"
                                                    >
                                                        <div className="text-xs text-gray-400 mb-1 font-display">
                                                            {category.label}
                                                        </div>
                                                        <div className="text-2xl font-bold text-gold-400">
                                                            {value.toFixed(1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">★</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-display font-bold mb-3">Distribución General</h3>
                                    <div className="space-y-3">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = waitressStats.ratingDistribution?.[rating] || 0;
                                            const percentage = waitressStats.totalReviews > 0
                                                ? (count / waitressStats.totalReviews) * 100
                                                : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-3">
                                                    <div className="w-10 text-right">
                                                        <span className="text-gold-400 font-semibold font-display text-sm">
                                                            {rating} ★
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 bg-night-700 rounded-full h-5 overflow-hidden relative">
                                                        <div
                                                            className="bg-gradient-gold h-full rounded-full transition-all duration-700 ease-out"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="w-16 text-gray-400 text-xs text-right">
                                                        {count} ({percentage.toFixed(0)}%)
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {waitressStats.categoryAverages && (
                                    <div>
                                        <h3 className="text-lg font-display font-bold mb-3">Distribución por Categorías</h3>
                                        <div className="space-y-4">
                                            {categories.map((category) => {
                                                const value = waitressStats.categoryAverages?.[category.key] || 0;
                                                const percentage = (value / 5) * 100;
                                                return (
                                                    <div key={category.key}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <span className="text-gray-200 font-display font-semibold text-sm">
                                                                    {category.label}
                                                                </span>
                                                                <span className="text-gray-500 text-xs ml-2">
                                                                    ({category.description})
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-gold-400 font-bold font-display text-sm">
                                                                    {value.toFixed(1)}
                                                                </span>
                                                                <span className="text-gold-500 text-sm">★</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-night-700 rounded-full h-4 overflow-hidden relative">
                                                                <div
                                                                    className="bg-gradient-gold h-full rounded-full transition-all duration-700 ease-out"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="w-12 text-gray-400 text-xs text-right">
                                                                {percentage.toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={cerrarStats}
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

export default WaitressManagement;

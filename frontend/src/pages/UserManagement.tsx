import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import type { Admin } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Admin | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'manager' as 'admin' | 'manager' | 'usuario',
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{
        show: boolean;
        id: string;
        username: string;
        type: 'soft' | 'hard';
    }>({
        show: false,
        id: '',
        username: '',
        type: 'soft',
    });
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await authAPI.getAllUsers();
            
            /*
             * Ordenar usuarios por rol: admin primero, luego manager, luego usuario.
             * Mantiene orden alfabético dentro de cada grupo de rol.
             */
            const roleOrder = { admin: 1, manager: 2, usuario: 3 };
            const sortedUsers = data.users.sort((a, b) => {
                const roleCompare = roleOrder[a.role] - roleOrder[b.role];
                if (roleCompare !== 0) return roleCompare;
                return a.username.localeCompare(b.username);
            });
            
            setUsers(sortedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user?: Admin) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'manager',
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'manager',
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                /*
                 * Al editar, solo enviar password si se proporcionó uno nuevo.
                 * Permite actualizar otros campos sin cambiar contraseña.
                 */
                const updateData: any = {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await authAPI.updateUser(editingUser._id, updateData);
            } else {
                /*
                 * Al crear, todos los campos son requeridos.
                 * Valida presencia de contraseña.
                 */
                if (!formData.password) {
                    setError('La contraseña es requerida');
                    return;
                }
                await authAPI.createUser(formData);
            }
            await loadUsers();
            handleCloseModal();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleToggleActive = async (user: Admin) => {
        try {
            if (user.active) {
                await authAPI.deactivateUser(user._id);
            } else {
                await authAPI.activateUser(user._id);
            }
            await loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar estado');
        }
    };

    const handleDeleteClick = (user: Admin, type: 'soft' | 'hard') => {
        setDeleteConfirm({
            show: true,
            id: user._id,
            username: user.username,
            type,
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            if (deleteConfirm.type === 'soft') {
                await authAPI.deactivateUser(deleteConfirm.id);
            } else {
                await authAPI.deleteUser(deleteConfirm.id);
            }
            await loadUsers();
            setDeleteConfirm({ show: false, id: '', username: '', type: 'soft' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-gold-400/20 text-gold-400 border-gold-500/30';
            case 'manager':
                return 'bg-blue-400/20 text-blue-400 border-blue-500/30';
            case 'usuario':
                return 'bg-gray-400/20 text-gray-400 border-gray-500/30';
            default:
                return 'badge-gold';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'manager':
                return 'Manager';
            case 'usuario':
                return 'Usuario';
            default:
                return role;
        }
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
                            ← Volver al Dashboard
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base mt-2">
                            Administra roles, permisos y accesos del sistema
                        </p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="btn-primary">
                        + Crear Usuario
                    </button>
                </div>

                {/* Vista Desktop */}
                <div className="luxury-card overflow-hidden hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-night-800/50 border-b border-night-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 font-display">
                                        Rol
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
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-night-700/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-night-900 text-sm font-bold font-display">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-200">
                                                        {user.username}
                                                    </span>
                                                    {user._id === currentUser?._id && (
                                                        <span className="text-xs text-gold-400 ml-2">
                                                            (Tú)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(user)}
                                                disabled={user._id === currentUser?._id}
                                                className={`badge cursor-pointer transition-all ${
                                                    user.active
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'
                                                } ${
                                                    user._id === currentUser?._id
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                }`}
                                            >
                                                {user.active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="btn-ghost text-xs py-1 px-3"
                                                >
                                                    Editar
                                                </button>
                                                {user._id !== currentUser?._id && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(user, 'soft')
                                                            }
                                                            className="btn-ghost text-xs py-1 px-3 text-yellow-400 hover:text-yellow-300"
                                                        >
                                                            Desactivar
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(user, 'hard')
                                                            }
                                                            className="btn-ghost text-xs py-1 px-3 text-neon-red hover:text-neon-red/80"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No hay usuarios registrados
                        </div>
                    )}
                </div>

                {/* Vista Mobile */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {users.map((user) => (
                        <div key={user._id} className="luxury-card p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-night-900 text-lg font-bold font-display">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-display font-semibold text-gray-100 truncate">
                                        {user.username}
                                        {user._id === currentUser?._id && (
                                            <span className="text-xs text-gold-400 ml-2">(Tú)</span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                <button
                                    onClick={() => handleToggleActive(user)}
                                    disabled={user._id === currentUser?._id}
                                    className={`badge cursor-pointer transition-all ${
                                        user.active
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    } ${
                                        user._id === currentUser?._id
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                >
                                    {user.active ? 'Activo' : 'Inactivo'}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(user)}
                                    className="btn-ghost text-xs flex-1"
                                >
                                    Editar
                                </button>
                                {user._id !== currentUser?._id && (
                                    <>
                                        <button
                                            onClick={() => handleDeleteClick(user, 'soft')}
                                            className="btn-ghost text-xs flex-1 text-yellow-400 hover:text-yellow-300"
                                        >
                                            Desactivar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user, 'hard')}
                                            className="btn-ghost text-xs flex-1 text-neon-red hover:text-neon-red/80"
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal de Crear/Editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="luxury-card p-8 max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto">
                            <h2 className="text-3xl font-display font-bold mb-6 text-gradient-gold">
                                {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                            </h2>

                            {error && (
                                <div className="bg-neon-redGlow border border-neon-red/30 text-neon-red px-4 py-3 rounded-lg text-sm mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nombre de Usuario *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        className="input-luxury"
                                        required
                                        placeholder="usuario123"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="input-luxury"
                                        required
                                        placeholder="usuario@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        className="input-luxury"
                                        required={!editingUser}
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    {!editingUser && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mínimo 6 caracteres
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Rol *
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, role: 'admin' })
                                            }
                                            className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${
                                                formData.role === 'admin'
                                                    ? 'bg-gold-400/20 text-gold-400 border-2 border-gold-500/50'
                                                    : 'luxury-card hover:border-gold-400/30'
                                            }`}
                                        >
                                            <div className="font-bold">⦿ Admin</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Control total del sistema, incluye gestión de usuarios
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, role: 'manager' })
                                            }
                                            className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${
                                                formData.role === 'manager'
                                                    ? 'bg-blue-400/20 text-blue-400 border-2 border-blue-500/50'
                                                    : 'luxury-card hover:border-blue-400/30'
                                            }`}
                                        >
                                            <div className="font-bold">⦿ Manager</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Gestión de personal, reseñas y clientes
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, role: 'usuario' })
                                            }
                                            className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${
                                                formData.role === 'usuario'
                                                    ? 'bg-gray-400/20 text-gray-400 border-2 border-gray-500/50'
                                                    : 'luxury-card hover:border-gray-400/30'
                                            }`}
                                        >
                                            <div className="font-bold">⦿ Usuario</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Rol reservado para futuras implementaciones
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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

                {/* Modal de Confirmación */}
                <ConfirmModal
                    isOpen={deleteConfirm.show}
                    title={
                        deleteConfirm.type === 'soft'
                            ? 'Desactivar Usuario'
                            : 'Eliminar Usuario Permanentemente'
                    }
                    message={
                        deleteConfirm.type === 'soft'
                            ? `¿Estás seguro de que deseas desactivar a ${deleteConfirm.username}? El usuario no podrá iniciar sesión hasta que sea reactivado.`
                            : `¿Estás seguro de que deseas eliminar permanentemente a ${deleteConfirm.username}? Esta acción no se puede deshacer y se perderán todos los datos del usuario.`
                    }
                    confirmText={deleteConfirm.type === 'soft' ? 'Desactivar' : 'Eliminar Permanentemente'}
                    cancelText="Cancelar"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() =>
                        setDeleteConfirm({ show: false, id: '', username: '', type: 'soft' })
                    }
                    type="danger"
                />
            </div>
        </div>
    );
};

export default UserManagement;

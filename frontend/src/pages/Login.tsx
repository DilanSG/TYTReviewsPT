import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);

        try {
            await login({ username, password });
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 animate-slide-up">
                    <h1 className="text-5xl font-display font-bold mb-3">
                        <span className="text-gradient-gold text-glow">PETRA BAR</span>
                    </h1>
                    <p className="text-gray-400 font-display tracking-wider uppercase text-sm">
                        Panel Administrativo
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="luxury-card p-8 space-y-6 animate-fade-in"
                >
                    <h2 className="text-2xl font-display font-bold text-center mb-6">
                        Iniciar Sesión
                    </h2>

                    {error && (
                        <div className="bg-neon-redGlow border border-neon-red/30 text-neon-red px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-luxury"
                            placeholder="Ingrese su usuario"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-luxury"
                            placeholder="Ingrese su contraseña"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full text-lg py-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="spinner w-5 h-5"></div>
                                Iniciando sesión...
                            </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="btn-ghost text-sm"
                    >
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

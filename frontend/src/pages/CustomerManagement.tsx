import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import type { Customer, EstadoSemana } from '../types';

const CustomerManagement: React.FC = () => {
    const [clientes, setClientes] = useState<Customer[]>([]);
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null);
    const [semanaSeleccionada, setSemanaSeleccionada] = useState<number | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [buscadorAbierto, setBuscadorAbierto] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
    const [clienteEditandoId, setClienteEditandoId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>(
        {
            show: false,
            id: '',
            name: '',
        }
    );
    const navigate = useNavigate();

    const mesesCortos = useMemo(
        () => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        []
    );

    /*
     * Genera las 52 semanas del año tomando como inicio el 1 de enero.
     * Cada semana es un bloque fijo de 7 días para evitar desfases de mes.
     */
    const semanasAnio = useMemo(() => {
        const year = new Date().getFullYear();
        const inicio = new Date(year, 0, 1);
        inicio.setHours(0, 0, 0, 0);

        return Array.from({ length: 52 }, (_, index) => {
            const start = new Date(inicio);
            start.setDate(inicio.getDate() + index * 7);

            let friday: Date | null = null;
            let saturday: Date | null = null;
            for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
                const current = new Date(start);
                current.setDate(start.getDate() + dayOffset);
                const day = current.getDay();
                if (day === 5) friday = current;
                if (day === 6) saturday = current;
            }

            return {
                week: index + 1,
                monthIndex: start.getMonth(),
                start,
                friday,
                saturday,
            };
        });
    }, []);

    const hoy = useMemo(() => new Date(), []);
    const mesActual = hoy.getMonth();
    const semanaActual = useMemo(() => {
        const inicio = new Date(hoy.getFullYear(), 0, 1);
        inicio.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((hoy.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000));
        return Math.min(52, Math.max(1, Math.floor(diffDays / 7) + 1));
    }, [hoy]);

    const obtenerPosicionSemana = (indice: number) => {
        const columna = Math.floor(indice / 4);
        const fila = indice % 4;
        return { columna, fila };
    };

    const formatearFechaCorta = (date: Date | null) => {
        if (!date) return '-';
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        return `${dia}/${mes}`;
    };

    const clienteSeleccionado = clientes.find((cliente) => cliente._id === clienteSeleccionadoId) || null;
    const clientesFiltrados = useMemo(() => {
        const term = terminoBusqueda.trim().toLowerCase();
        if (!term) return clientes;
        return clientes.filter((cliente) =>
            cliente.name.toLowerCase().includes(term) ||
            cliente.document?.toLowerCase().includes(term)
        );
    }, [clientes, terminoBusqueda]);
    const indiceSeleccionado = clientesFiltrados.findIndex((cliente) => cliente._id === clienteSeleccionadoId);
    const grupoSeleccionado = indiceSeleccionado >= 0 ? Math.floor(indiceSeleccionado / 3) : null;

    useEffect(() => {
        cargarClientes();
    }, []);

    const claseColor = (estado: EstadoSemana) => {
        if (estado === 'verde') return 'bg-green-500/80 border-green-400/60';
        if (estado === 'rojo') return 'bg-red-500/80 border-red-400/60';
        return 'bg-gray-600/70 border-gray-500/60';
    };

    /*
     * Carga la lista de clientes desde el backend.
     * Se usa al iniciar la vista y después de cambios relevantes.
     */
    const cargarClientes = async () => {
        try {
            const data = await customerAPI.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    /*
     * Crea o actualiza un cliente según el modo activo.
     * Reutiliza el mismo formulario para evitar duplicación de UI.
     */
    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) {
            alert('El nombre del cliente es obligatorio');
            return;
        }

        try {
            if (clienteEditandoId) {
                const response = await customerAPI.update(clienteEditandoId, {
                    name: nombreLimpio,
                    document: documento.trim() || undefined,
                    phone: telefono.trim() || undefined,
                    email: correo.trim() || undefined,
                });
                setClientes((prev) =>
                    prev.map((cliente) =>
                        cliente._id === response.customer._id ? response.customer : cliente
                    )
                );
            } else {
                const response = await customerAPI.create({
                    name: nombreLimpio,
                    document: documento.trim() || undefined,
                    phone: telefono.trim() || undefined,
                    email: correo.trim() || undefined,
                });
                setClientes((prev) => [response.customer, ...prev]);
            }
            setNombre('');
            setDocumento('');
            setTelefono('');
            setCorreo('');
            setClienteEditandoId(null);
            setModalClienteAbierto(false);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar cliente');
        }
    };

    const seleccionarCliente = (clienteId: string) => {
        setClienteSeleccionadoId((prev) => (prev === clienteId ? null : clienteId));
        setSemanaSeleccionada(null);
        setModalAbierto(false);
    };

    const iniciarEdicion = (cliente: Customer) => {
        setClienteEditandoId(cliente._id);
        setNombre(cliente.name);
        setDocumento(cliente.document || '');
        setTelefono(cliente.phone || '');
        setCorreo(cliente.email || '');
        setModalClienteAbierto(true);
    };

    const cancelarEdicion = () => {
        setClienteEditandoId(null);
        setNombre('');
        setDocumento('');
        setTelefono('');
        setCorreo('');
        setModalClienteAbierto(false);
    };

    /*
     * Elimina un cliente y sincroniza la lista en memoria.
     * Si estaba seleccionado o en edición, se limpian estados locales.
     */
    const eliminarCliente = async (clienteId: string) => {
        try {
            await customerAPI.delete(clienteId);
            setClientes((prev) => prev.filter((cliente) => cliente._id !== clienteId));
            setClienteSeleccionadoId((prev) => (prev === clienteId ? null : prev));
            if (clienteEditandoId === clienteId) {
                cancelarEdicion();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar cliente');
        }
    };

    const handleDeleteClick = (cliente: Customer) => {
        setDeleteConfirm({ show: true, id: cliente._id, name: cliente.name });
    };

    const handleDeleteConfirm = async () => {
        await eliminarCliente(deleteConfirm.id);
        setDeleteConfirm({ show: false, id: '', name: '' });
    };

    const abrirModalSemana = (indiceSemana: number) => {
        setSemanaSeleccionada(indiceSemana);
        setModalAbierto(true);
    };

    /*
     * Actualiza el estado de una semana y sincroniza con backend.
     * Refresca el cliente en memoria con la respuesta actualizada.
     */
    const aplicarEstado = async (estado: EstadoSemana) => {
        if (!clienteSeleccionado || semanaSeleccionada === null) return;

        try {
            const response = await customerAPI.updateWeek(
                clienteSeleccionado._id,
                semanaSeleccionada,
                estado
            );
            setClientes((prev) =>
                prev.map((cliente) =>
                    cliente._id === response.customer._id ? response.customer : cliente
                )
            );
            setModalAbierto(false);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar semana');
        }
    };

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
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold">
                        Gestión de Clientes
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base mt-2">
                        Controla datos de contacto y estados semanales
                    </p>
                </div>

                <div className="luxury-card p-6 mb-8 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h2 className="text-xl font-display font-bold text-center md:text-left">
                            Clientes del bar
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={() => setBuscadorAbierto((prev) => !prev)}
                                className="btn-secondary"
                            >
                                Buscar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    cancelarEdicion();
                                    setModalClienteAbierto(true);
                                }}
                                className="btn-primary"
                            >
                                Agregar Cliente
                            </button>
                        </div>
                    </div>
                    {buscadorAbierto && (
                        <div className="mt-4">
                            <input
                                type="text"
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                                className="input-luxury"
                                placeholder="Buscar por nombre o documento"
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="luxury-card p-10 text-center text-gray-400">
                        Cargando clientes...
                    </div>
                ) : clientes.length === 0 ? (
                    <div className="luxury-card p-10 text-center text-gray-400">
                        Aún no hay clientes registrados
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                        {clientesFiltrados.map((cliente, index) => {
                            const mostrarPanelDesktop =
                                clienteSeleccionado &&
                                grupoSeleccionado !== null &&
                                grupoSeleccionado === Math.floor(index / 3) &&
                                (index % 3 === 2 || index === clientes.length - 1);

                            return (
                                <React.Fragment key={cliente._id}>
                                    <button
                                        onClick={() => seleccionarCliente(cliente._id)}
                                        className={`luxury-card-hover p-5 text-left transition-all ${
                                            clienteSeleccionadoId === cliente._id ? 'border-gold-400/50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-display font-semibold text-gray-100">
                                                    {cliente.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {cliente.document ? `Documento: ${cliente.document}` : 'Documento no registrado'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        iniciarEdicion(cliente);
                                                    }}
                                                    className="btn-ghost text-xs"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteClick(cliente);
                                                    }}
                                                    className="btn-ghost text-xs text-neon-red hover:text-neon-red/80"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>

                                        {clienteSeleccionadoId === cliente._id && (
                                            <div className="mt-4 md:hidden">
                                                <div className="text-center mb-4">
                                                    <h4 className="text-lg font-display font-bold text-gradient-gold">
                                                        {cliente.name}
                                                    </h4>
                                                    <div className="text-gray-400 text-xs space-y-1">
                                                        <p>{cliente.document ? `Documento: ${cliente.document}` : 'Documento no registrado'}</p>
                                                        {cliente.phone && <p>Tel: {cliente.phone}</p>}
                                                        {cliente.email && <p>{cliente.email}</p>}
                                                        <p>Selecciona una semana para registrar el estado</p>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <div
                                                        className="grid gap-2 min-w-[760px]"
                                                        style={{
                                                            gridTemplateColumns: 'repeat(13, minmax(48px, 1fr))',
                                                            gridTemplateRows: 'repeat(4, minmax(48px, 1fr))',
                                                        }}
                                                    >
                                                        {semanasAnio.map((info, indiceSemana) => {
                                                            const { columna, fila } = obtenerPosicionSemana(indiceSemana);
                                                            return (
                                                                <button
                                                                    key={`sem-${indiceSemana}`}
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        abrirModalSemana(indiceSemana);
                                                                    }}
                                                                    className={`aspect-square w-full rounded-sm border ${claseColor(
                                                                        cliente.weekStates[indiceSemana]
                                                                    )} ${
                                                                        info.week === semanaActual ? 'ring-2 ring-gold-400/80' : ''
                                                                    } relative flex items-center justify-center`}
                                                                    title={`Semana ${info.week} • ${mesesCortos[info.monthIndex]}`}
                                                                    style={{
                                                                        gridColumn: columna + 1,
                                                                        gridRow: fila + 1,
                                                                        borderRight:
                                                                            columna < 12 ? '1px solid rgba(71,85,105,0.6)' : undefined,
                                                                        paddingRight: columna < 12 ? '4px' : undefined,
                                                                    }}
                                                                >
                                                                    <span className="absolute top-1 left-1 text-[9px] text-gray-200">
                                                                        {info.week}
                                                                    </span>
                                                                    <span
                                                                        className={`absolute bottom-1 right-1 text-[9px] ${
                                                                            info.monthIndex === mesActual
                                                                                ? 'text-gold-300'
                                                                                : 'text-gray-400'
                                                                        }`}
                                                                    >
                                                                        {mesesCortos[info.monthIndex]}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>

                                    {mostrarPanelDesktop && clienteSeleccionado && (
                                        <div className="hidden md:block md:col-span-2 lg:col-span-3">
                                            <div className="luxury-card p-6 md:p-8 max-w-4xl mx-auto">
                                                <div className="text-center mb-6">
                                                    <h2 className="text-2xl font-display font-bold text-gradient-gold">
                                                        {clienteSeleccionado.name}
                                                    </h2>
                                                    <div className="text-gray-400 text-sm md:text-base space-y-1">
                                                        <p>{clienteSeleccionado.document ? `Documento: ${clienteSeleccionado.document}` : 'Documento no registrado'}</p>
                                                        {clienteSeleccionado.phone && <p>Tel: {clienteSeleccionado.phone}</p>}
                                                        {clienteSeleccionado.email && <p>{clienteSeleccionado.email}</p>}
                                                        <p>Selecciona una semana para registrar el estado</p>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <div
                                                        className="grid gap-2 md:gap-3 min-w-[760px]"
                                                        style={{
                                                            gridTemplateColumns: 'repeat(13, minmax(48px, 1fr))',
                                                            gridTemplateRows: 'repeat(4, minmax(48px, 1fr))',
                                                        }}
                                                    >
                                                        {semanasAnio.map((info, indiceSemana) => {
                                                            const { columna, fila } = obtenerPosicionSemana(indiceSemana);
                                                            return (
                                                                <button
                                                                    key={`sem-${indiceSemana}`}
                                                                    type="button"
                                                                    onClick={() => abrirModalSemana(indiceSemana)}
                                                                    className={`aspect-square w-full rounded-sm md:rounded-md border ${claseColor(
                                                                        clienteSeleccionado.weekStates[indiceSemana]
                                                                    )} ${
                                                                        info.week === semanaActual ? 'ring-2 ring-gold-400/80' : ''
                                                                    } hover:scale-105 transition-transform relative flex items-center justify-center`}
                                                                    title={`Semana ${info.week} • ${mesesCortos[info.monthIndex]}`}
                                                                    style={{
                                                                        gridColumn: columna + 1,
                                                                        gridRow: fila + 1,
                                                                        borderRight:
                                                                            columna < 12 ? '1px solid rgba(71,85,105,0.6)' : undefined,
                                                                        paddingRight: columna < 12 ? '4px' : undefined,
                                                                    }}
                                                                >
                                                                    <span className="absolute top-1 left-1 text-[9px] md:text-[10px] text-gray-200">
                                                                        {info.week}
                                                                    </span>
                                                                    <span
                                                                        className={`absolute bottom-1 right-1 text-[9px] md:text-[10px] ${
                                                                            info.monthIndex === mesActual
                                                                                ? 'text-gold-300'
                                                                                : 'text-gray-400'
                                                                        }`}
                                                                    >
                                                                        {mesesCortos[info.monthIndex]}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>

            {modalAbierto && clienteSeleccionado && semanaSeleccionada !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setModalAbierto(false)}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-md">
                        <h3 className="text-xl font-display font-bold mb-4 text-center">
                            Semana {semanaSeleccionada + 1}
                        </h3>
                        <p className="text-gray-400 text-sm text-center mb-2">
                            Selecciona el estado para esta semana
                        </p>
                        <p className="text-xs text-gray-500 text-center mb-6">
                            Viernes {formatearFechaCorta(semanasAnio[semanaSeleccionada]?.friday)} · Sábado {formatearFechaCorta(semanasAnio[semanaSeleccionada]?.saturday)}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => aplicarEstado('gris')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-500/50 hover:border-gray-400 transition-all"
                            >
                                <span className="w-6 h-6 rounded-full bg-gray-500"></span>
                                <span className="text-sm text-gray-300">Gris</span>
                            </button>
                            <button
                                onClick={() => aplicarEstado('rojo')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-red-500/50 hover:border-red-400 transition-all"
                            >
                                <span className="w-6 h-6 rounded-full bg-red-500"></span>
                                <span className="text-sm text-gray-300">Rojo</span>
                            </button>
                            <button
                                onClick={() => aplicarEstado('verde')}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-green-500/50 hover:border-green-400 transition-all"
                            >
                                <span className="w-6 h-6 rounded-full bg-green-500"></span>
                                <span className="text-sm text-gray-300">Verde</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setModalAbierto(false)}
                            className="btn-secondary w-full mt-6"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {modalClienteAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={cancelarEdicion}
                    ></div>
                    <div className="luxury-card p-6 md:p-8 relative z-10 w-full max-w-lg">
                        <h3 className="text-2xl font-display font-bold mb-6 text-center">
                            {clienteEditandoId ? 'Editar cliente' : 'Nuevo cliente'}
                        </h3>
                        <form onSubmit={manejarSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="input-luxury"
                                placeholder="Nombre completo"
                                maxLength={100}
                            />
                            <input
                                type="text"
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value)}
                                className="input-luxury"
                                placeholder="Documento (opcional)"
                                maxLength={50}
                            />
                            <input
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="input-luxury"
                                placeholder="Teléfono (opcional)"
                                maxLength={30}
                            />
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                className="input-luxury"
                                placeholder="Correo (opcional)"
                                maxLength={120}
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn-primary flex-1">
                                    {clienteEditandoId ? 'Guardar cambios' : 'Crear cliente'}
                                </button>
                                <button type="button" onClick={cancelarEdicion} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirm.show}
                title="Eliminar cliente"
                message={`¿Estás seguro de que deseas eliminar a ${deleteConfirm.name}? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                type="danger"
            />
        </div>
    );
};

export default CustomerManagement;

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PlusIcon, PencilIcon, TrashIcon, XIcon, MapIcon, EyeIcon, TruckIcon, AcademicCapIcon, LocationIcon, FlagIcon } from '@/components/icons';
import api from '@/lib/api';
import type { Route, Vehicle, User } from '@/types';
import dynamic from 'next/dynamic';

// Cargar MapPicker dinámicamente sin SSR
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Cargando mapa...</div>
});

const RouteMapViewer = dynamic(() => import('@/components/RouteMapViewer'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Cargando mapa de ruta...</div>
});

interface RouteFormData {
    nombre: string;
    descripcion: string;
    horaInicio: string;
    horaFin: string;
    vehiculoId: string;
    // Inicio
    inicioLat: number;
    inicioLng: number;
    inicioNombre: string;
    // Destino
    destinoLat: number;
    destinoLng: number;
    destinoNombre: string;
}

const INITIAL_FORM_DATA: RouteFormData = {
    nombre: '',
    descripcion: '',
    horaInicio: '',
    horaFin: '',
    vehiculoId: '',
    inicioLat: 0,
    inicioLng: 0,
    inicioNombre: '',
    destinoLat: 0,
    destinoLng: 0,
    destinoNombre: '',
};

export default function RoutesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [formData, setFormData] = useState<RouteFormData>(INITIAL_FORM_DATA);

    // Control de modales de mapa
    const [pickerType, setPickerType] = useState<'inicio' | 'destino' | null>(null);
    const [viewRoute, setViewRoute] = useState<any | null>(null);
    const routeMapRef = useRef<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [routesRes, vehiclesRes] = await Promise.all([
                api.get('/routes'),
                api.get('/vehicles'),
            ]);
            setRoutes(routesRes.data);
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.inicioLat || !formData.inicioLng) {
            alert('Por favor selecciona un Punto de Inicio en el mapa');
            return;
        }
        if (!formData.destinoLat || !formData.destinoLng) {
            alert('Por favor selecciona un Punto de Destino en el mapa');
            return;
        }

        try {
            // Limpiar datos antes de enviar
            const payload = { ...formData };
            if (!payload.vehiculoId) {
                delete (payload as any).vehiculoId;
            }

            if (editingRoute) {
                await api.patch(`/routes/${editingRoute.id}`, payload);
            } else {
                await api.post('/routes', payload);
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Error saving route:', error);
            alert(error.response?.data?.message || 'Error al guardar ruta');
        }
    };

    const handleEdit = (route: any) => {
        setEditingRoute(route);
        setFormData({
            nombre: route.nombre || '',
            descripcion: route.descripcion || '',
            horaInicio: route.horaInicio || '',
            horaFin: route.horaFin || '',
            vehiculoId: route.vehiculoId || '',
            inicioLat: route.inicioLat || 0,
            inicioLng: route.inicioLng || 0,
            inicioNombre: route.inicioNombre || '',
            destinoLat: route.destinoLat || 0,
            destinoLng: route.destinoLng || 0,
            destinoNombre: route.destinoNombre || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;
        try {
            await api.delete(`/routes/${id}`);
            loadData();
        } catch (error: any) {
            console.error('Error deleting route:', error);
            alert(error.response?.data?.message || 'Error al eliminar ruta');
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setEditingRoute(null);
        setPickerType(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        if (pickerType === 'inicio') {
            setFormData(prev => ({
                ...prev,
                inicioLat: lat,
                inicioLng: lng,
                // Si no tiene nombre, sugerir uno genérico o dejar vacío
                inicioNombre: prev.inicioNombre || 'Punto de Inicio'
            }));
        } else if (pickerType === 'destino') {
            setFormData(prev => ({
                ...prev,
                destinoLat: lat,
                destinoLng: lng,
                destinoNombre: prev.destinoNombre || 'Punto de Destino'
            }));
        }
        setPickerType(null); // Cerrar selector
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#1e3a8a' }}></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} onLogout={handleLogout} />

            <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Rutas</h1>
                            <p className="text-gray-600 mt-1">Gestión de rutas inteligente</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Nueva Ruta</span>
                        </button>
                    </div>

                    {/* Routes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {routes.map((route: any) => (
                            <div key={route.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{route.nombre}</h3>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${route.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {route.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{route.descripcion}</p>

                                <div className="space-y-3 mb-4 border-t border-b border-gray-100 py-3">
                                    <div className="flex items-start">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-xs text-gray-500">Inicio</p>
                                            <p className="text-sm font-medium text-gray-900">{route.inicioNombre || 'Sin definir'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-xs text-gray-500">Destino</p>
                                            <p className="text-sm font-medium text-gray-900">{route.destinoNombre || 'Sin definir'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <TruckIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                        {route.vehiculo ? route.vehiculo.placa : 'Sin vehículo'}
                                    </span>
                                    <span>{route.horaInicio} - {route.horaFin}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                                    <button
                                        onClick={() => setViewRoute(route)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                        title="Ver Mapa"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(route)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(route.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Route Modal */}
            {viewRoute && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{viewRoute.nombre}</h3>
                                <p className="text-sm text-gray-500">{viewRoute.inicioNombre} ➔ {viewRoute.destinoNombre}</p>
                            </div>
                            <button onClick={() => { setViewRoute(null); routeMapRef.current = null; }} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <XIcon className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 p-4 bg-gray-100 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                                <RouteMapViewer
                                    start={{
                                        lat: viewRoute.inicioLat,
                                        lng: viewRoute.inicioLng,
                                        label: viewRoute.inicioNombre
                                    }}
                                    end={{
                                        lat: viewRoute.destinoLat,
                                        lng: viewRoute.destinoLng,
                                        label: viewRoute.destinoNombre
                                    }}
                                    stops={viewRoute.estudiantes?.map((s: any) => ({
                                        lat: s.latitud,
                                        lng: s.longitud,
                                        label: `${s.nombre} ${s.apellido}`,
                                        type: 'student'
                                    }))}
                                    routeGeometry={viewRoute.puntos}
                                    onMapReady={(map: any) => { routeMapRef.current = map; }}
                                />
                            </div>

                            {/* Student List Sidebar */}
                            <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto max-h-[400px] md:max-h-full">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <AcademicCapIcon className="w-5 h-5 text-gray-500" />
                                    <span>Estudiantes ({viewRoute.estudiantes?.length || 0})</span>
                                </h4>
                                {viewRoute.estudiantes && viewRoute.estudiantes.length > 0 ? (
                                    <ul className="space-y-2">
                                        {viewRoute.estudiantes.map((student: any) => (
                                            <li
                                                key={student.id}
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-yellow-50 transition text-sm cursor-pointer"
                                                onClick={() => {
                                                    if (routeMapRef.current && student.latitud && student.longitud) {
                                                        routeMapRef.current.flyTo([student.latitud, student.longitud], 16, { duration: 1 });
                                                    }
                                                }}
                                            >
                                                <div className="font-semibold text-gray-800">{student.nombre} {student.apellido}</div>
                                                <div className="text-gray-500 text-xs mt-1">{student.direccion}</div>
                                                {student.grado && <div className="text-blue-600 text-xs mt-1 font-medium">{student.grado}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No hay estudiantes asignados.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[1010] overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingRoute ? 'Editar Ruta' : 'Nueva Ruta'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Ruta *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Ej: Ruta Norte - Mañana"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                                        <textarea
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                            rows={2}
                                            placeholder="Descripción detallada de la ruta..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.horaInicio}
                                            onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.horaFin}
                                            onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo Asignado</label>
                                        <select
                                            value={formData.vehiculoId}
                                            onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        >
                                            <option value="">Seleccionar vehículo (opcional)</option>
                                            {vehicles.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.placa} - {v.marca} {v.modelo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Puntos de Ruta */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Puntos de Ruta</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Punto de Inicio */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center mb-3">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <h4 className="font-medium text-gray-900">Punto de Inicio</h4>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-xs text-gray-500 block mb-1">Nombre del lugar</label>
                                                <input
                                                    type="text"
                                                    value={formData.inicioNombre}
                                                    onChange={(e) => setFormData({ ...formData, inicioNombre: e.target.value })}
                                                    placeholder="Ej: Garage Central"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setPickerType('inicio')}
                                                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg border-2 border-dashed text-sm font-medium transition ${formData.inicioLat
                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                                    }`}
                                            >
                                                <MapIcon className="w-4 h-4" />
                                                <span>
                                                    {formData.inicioLat
                                                        ? `Ubicación seleccionada (${formData.inicioLat.toFixed(4)}, ${formData.inicioLng.toFixed(4)})`
                                                        : 'Seleccionar en mapa'}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Punto de Destino */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center mb-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <h4 className="font-medium text-gray-900">Punto de Destino</h4>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-xs text-gray-500 block mb-1">Nombre del lugar</label>
                                                <input
                                                    type="text"
                                                    value={formData.destinoNombre}
                                                    onChange={(e) => setFormData({ ...formData, destinoNombre: e.target.value })}
                                                    placeholder="Ej: Colegio"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setPickerType('destino')}
                                                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg border-2 border-dashed text-sm font-medium transition ${formData.destinoLat
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                                    }`}
                                            >
                                                <MapIcon className="w-4 h-4" />
                                                <span>
                                                    {formData.destinoLat
                                                        ? `Ubicación seleccionada (${formData.destinoLat.toFixed(4)}, ${formData.destinoLng.toFixed(4)})`
                                                        : 'Seleccionar en mapa'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20"
                                    >
                                        {editingRoute ? 'Guardar Cambios' : 'Crear Ruta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Picker Modal - Level 2 */}
            {pickerType && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {pickerType === 'inicio'
                                    ? <><LocationIcon className="w-5 h-5 text-green-600" /> Seleccionar Punto de Inicio</>
                                    : <><FlagIcon className="w-5 h-5 text-red-500" /> Seleccionar Punto de Destino</>
                                }
                            </h3>
                            <button onClick={() => setPickerType(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <XIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <MapPicker
                                onLocationSelect={handleLocationSelect}
                                height="100%"
                                centerLat={pickerType === 'inicio' ? (formData.inicioLat || -17.3895) : (formData.destinoLat || -17.3895)}
                                centerLng={pickerType === 'inicio' ? (formData.inicioLng || -66.1568) : (formData.destinoLng || -66.1568)}
                                initialLat={pickerType === 'inicio' ? formData.inicioLat : formData.destinoLat}
                                initialLng={pickerType === 'inicio' ? formData.inicioLng : formData.destinoLng}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}







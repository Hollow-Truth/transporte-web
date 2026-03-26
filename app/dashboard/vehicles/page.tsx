'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PlusIcon, PencilIcon, TrashIcon } from '@/components/icons';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Vehicle, User } from '@/types';

const COLORES = [
    { nombre: 'Amarillo',  hex: '#EAB308' },
    { nombre: 'Azul',      hex: '#2563EB' },
    { nombre: 'Blanco',    hex: '#F3F4F6' },
    { nombre: 'Celeste',   hex: '#7DD3FC' },
    { nombre: 'Dorado',    hex: '#B45309' },
    { nombre: 'Gris',      hex: '#6B7280' },
    { nombre: 'Naranja',   hex: '#EA580C' },
    { nombre: 'Negro',     hex: '#1F2937' },
    { nombre: 'Plateado',  hex: '#9CA3AF' },
    { nombre: 'Rojo',      hex: '#DC2626' },
    { nombre: 'Verde',     hex: '#16A34A' },
    { nombre: 'Vino',      hex: '#7F1D1D' },
] as const;

function getColorHex(nombre: string): string {
    return COLORES.find(c => c.nombre === nombre)?.hex ?? '#9CA3AF';
}

export default function VehiclesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [conductors, setConductors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        año: new Date().getFullYear(),
        capacidad: 15,
        color: '',
        conductorId: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vehiclesRes, usersRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/users'),
            ]);
            setVehicles(vehiclesRes.data);
            setConductors(usersRes.data.filter((u: User) => u.role === 'conductor'));
        } catch { } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await api.patch(`/vehicles/${editingVehicle.id}`, formData);
                toast.success('Vehículo actualizado');
            } else {
                await api.post('/vehicles', formData);
                toast.success('Vehículo guardado exitosamente');
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar vehículo');
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            placa: vehicle.placa,
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            año: vehicle.año,
            capacidad: vehicle.capacidad,
            color: vehicle.color,
            conductorId: vehicle.conductorId ?? '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success('Vehículo eliminado');
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar vehículo');
        }
    };

    const resetForm = () => {
        setFormData({
            placa: '',
            marca: '',
            modelo: '',
            año: new Date().getFullYear(),
            capacidad: 15,
            color: '',
            conductorId: '',
        });
        setEditingVehicle(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                            <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
                            <p className="text-gray-600 mt-1">Gestión de vehículos del sistema</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Nuevo Vehículo</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Placa</th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><span className="sm:hidden">Modelo</span><span className="hidden sm:inline">Marca/Modelo</span></th>
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conductor</th>
                                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50">
                                        <td className="px-3 md:px-6 py-4 whitespace-nowrap font-semibold text-gray-900 sticky left-0 bg-white z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">{vehicle.placa}</td>
                                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-gray-700">{vehicle.marca} {vehicle.modelo}</td>
                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-700">{vehicle.año}</td>
                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-700">{vehicle.capacidad} personas</td>
                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center">
                                                <span className="w-4 h-4 rounded-full mr-2 border border-gray-300" style={{ backgroundColor: getColorHex(vehicle.color) }}></span>
                                                <span className="text-gray-700">{vehicle.color}</span>
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-gray-700">
                                            {vehicle.conductor ? `${vehicle.conductor.nombre} ${vehicle.conductor.apellido || ''}` : 'Sin asignar'}
                                        </td>
                                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 md:px-2.5 py-1 text-xs font-medium rounded-full ${vehicle.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {vehicle.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-2 md:mr-3"
                                                title="Editar"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                <span className="hidden sm:inline ml-1">Editar</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="inline-flex items-center text-red-600 hover:text-red-800"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span className="hidden sm:inline ml-1">Eliminar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Placa *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.placa}
                                            onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ABC-123"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.marca}
                                            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Toyota"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.modelo}
                                            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Hiace"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.año}
                                            onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.capacidad}
                                            onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: getColorHex(formData.color) }}
                                            />
                                            <select
                                                required
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Seleccionar color</option>
                                                {COLORES.map(c => (
                                                    <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Conductor *</label>
                                        <select
                                            required
                                            value={formData.conductorId}
                                            onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar conductor</option>
                                            {conductors.map((conductor) => (
                                                <option key={conductor.id} value={conductor.id}>
                                                    {conductor.nombre} {conductor.apellido} - {conductor.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium"
                                    >
                                        {editingVehicle ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}







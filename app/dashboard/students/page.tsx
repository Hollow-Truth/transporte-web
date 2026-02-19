'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PlusIcon, PencilIcon, TrashIcon, LocationIcon, MapIcon, XIcon } from '@/components/icons';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });
import type { Student, User, Route } from '@/types';

export default function StudentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<{
        nombre: string;
        apellido: string;
        fechaNacimiento: string;
        direccion: string;
        grado: string;
        nombrePadre: string;
        telefonoPadre: string;
        padreId: string;
        rutaId: string;
        latitud?: number;
        longitud?: number;
    }>({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        direccion: '',
        grado: '',
        nombrePadre: '',
        telefonoPadre: '',
        padreId: '',
        rutaId: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsRes, usersRes, routesRes] = await Promise.all([
                api.get('/students'),
                api.get('/users'),
                api.get('/routes'),
            ]);
            setStudents(studentsRes.data);
            setParents(usersRes.data.filter((u: User) => u.role === 'padre'));
            setRoutes(routesRes.data);
        } catch {
            // error loading data
        } finally {
            setLoading(false);
        }
    };

    const [showMapPicker, setShowMapPicker] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await api.patch(`/students/${editingStudent.id}`, formData);
            } else {
                await api.post('/students', formData);
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar estudiante');
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            nombre: student.nombre,
            apellido: student.apellido,
            fechaNacimiento: student.fechaNacimiento.split('T')[0],
            direccion: student.direccion,
            grado: student.grado || '',
            nombrePadre: student.nombrePadre || '',
            telefonoPadre: student.telefonoPadre || '',
            latitud: student.latitud || undefined,
            longitud: student.longitud || undefined,
            padreId: student.padreId,
            rutaId: student.rutaId || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;
        try {
            await api.delete(`/students/${id}`);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar estudiante');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            apellido: '',
            fechaNacimiento: '',
            direccion: '',
            grado: '',
            nombrePadre: '',
            telefonoPadre: '',
            latitud: undefined,
            longitud: undefined,
            padreId: '',
            rutaId: '',
        });
        setEditingStudent(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('access_token');
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
                            <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
                            <p className="text-gray-600 mt-1">Gestión de estudiantes del sistema</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Nuevo Estudiante</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <p className="text-gray-600 text-sm mb-1">Total Estudiantes</p>
                            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <p className="text-gray-600 text-sm mb-1">Con Ruta Asignada</p>
                            <p className="text-3xl font-bold text-green-600">
                                {students.filter(s => s.rutaId).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <p className="text-gray-600 text-sm mb-1">Sin Ruta</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {students.filter(s => !s.rutaId).length}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nac.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Padre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                            {student.nombre} {student.apellido}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {new Date(student.fechaNacimiento).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {student.direccion}
                                            {student.latitud && (
                                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                                    <LocationIcon className="w-3 h-3" />
                                                    {student.latitud.toFixed(4)}, {student.longitud?.toFixed(4)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {student.padre ? `${student.padre.nombre} ${student.padre.apellido || ''}` : 'Sin asignar'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {student.ruta ? student.ruta.nombre : 'Sin ruta'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {student.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                <PencilIcon className="w-4 h-4 mr-1" />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="inline-flex items-center text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-1" />
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.fechaNacimiento}
                                            onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Padre *</label>
                                        <select
                                            required
                                            value={formData.padreId}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const parent = parents.find(p => p.id === selectedId);
                                                setFormData({
                                                    ...formData,
                                                    padreId: selectedId,
                                                    nombrePadre: parent ? `${parent.nombre} ${parent.apellido || ''}`.trim() : '',
                                                    telefonoPadre: parent?.telefono || '00000000'
                                                });
                                            }}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar padre</option>
                                            {parents.map((parent) => (
                                                <option key={parent.id} value={parent.id}>
                                                    {parent.nombre} {parent.apellido} - {parent.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Grado *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.grado}
                                            onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej. 5to Primaria"
                                        />
                                    </div>
                                    {/* Campos ocultos o visuales auto-llenados */}
                                    <div className="hidden">
                                        <input type="text" value={formData.nombrePadre} readOnly />
                                        <input type="text" value={formData.telefonoPadre} readOnly />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowMapPicker(true)}
                                            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition"
                                        >
                                            {formData.latitud && formData.longitud ? (
                                                <>
                                                    <LocationIcon className="w-4 h-4" />
                                                    <span>Ubicación seleccionada ({formData.latitud.toFixed(4)}, {formData.longitud.toFixed(4)})</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MapIcon className="w-4 h-4" />
                                                    <span>Seleccionar ubicación en el mapa</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ruta (Opcional)</label>
                                        <select
                                            value={formData.rutaId}
                                            onChange={(e) => setFormData({ ...formData, rutaId: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sin ruta asignada</option>
                                            {routes.map((route) => (
                                                <option key={route.id} value={route.id}>
                                                    {route.nombre} - {route.horaInicio} a {route.horaFin}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMapPicker(false);
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                                    >
                                        {editingStudent ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Picker Modal */}
            {showMapPicker && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1010] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Seleccionar Domicilio</h3>
                            <button onClick={() => setShowMapPicker(false)} className="text-gray-500 hover:text-gray-700"><XIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 relative">
                            <MapPicker
                                initialLat={formData.latitud || -17.3895}
                                initialLng={formData.longitud || -66.1568}
                                onLocationSelect={(lat, lng) => {
                                    setFormData({ ...formData, latitud: lat, longitud: lng });
                                    setShowMapPicker(false);
                                }}
                                height="100%"
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}







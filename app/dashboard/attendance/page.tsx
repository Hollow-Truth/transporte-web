'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import type { User, Route, Vehicle } from '@/types';

interface AttendanceRecord {
    id: string;
    estudianteId: string;
    vehiculoId: string;
    conductorId: string;
    evento: 'abordaje' | 'descenso';
    timestamp: string;
    latitudRegistro: number;
    longitudRegistro: number;
    distanciaDomicilio: number | null;
    validadoGeofencing: boolean;
    manualOverride: boolean;
    sospechoso: boolean;
    estudiante: {
        id: string;
        nombre: string;
        apellido: string;
        grado: string;
        direccion: string;
        ruta?: { nombre: string };
    };
    vehiculo?: { placa: string };
    conductor?: { nombre: string; apellido: string };
}

interface ReportData {
    fecha: string;
    resumen: {
        totalRegistros: number;
        abordajes: number;
        descensos: number;
        validados: number;
        sospechosos: number;
    };
    registros: AttendanceRecord[];
}

export default function AttendancePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [rutaFilter, setRutaFilter] = useState('');
    const [vehiculoFilter, setVehiculoFilter] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        loadFilters();
    }, []);

    useEffect(() => {
        loadReport();
    }, [fecha, rutaFilter, vehiculoFilter]);

    const loadFilters = async () => {
        try {
            const [routesRes, vehiclesRes] = await Promise.all([
                api.get('/routes'),
                api.get('/vehicles'),
            ]);
            setRoutes(routesRes.data);
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ fecha });
            if (rutaFilter) params.append('rutaId', rutaFilter);
            if (vehiculoFilter) params.append('vehiculoId', vehiculoFilter);

            const res = await api.get(`/attendance/report?${params.toString()}`);
            setReport(res.data);
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const summary = report?.resumen;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} onLogout={handleLogout} />

            <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
                        <p className="text-gray-600 mt-1">Registro de abordajes, descensos y validación geoespacial</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
                                <select
                                    value={rutaFilter}
                                    onChange={(e) => setRutaFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todas las rutas</option>
                                    {routes.map((r) => (
                                        <option key={r.id} value={r.id}>{r.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <select
                                    value={vehiculoFilter}
                                    onChange={(e) => setVehiculoFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los vehículos</option>
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <p className="text-gray-600 text-sm">Total Registros</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.totalRegistros}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <p className="text-gray-600 text-sm">Abordajes</p>
                                <p className="text-2xl font-bold text-green-600">{summary.abordajes}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <p className="text-gray-600 text-sm">Descensos</p>
                                <p className="text-2xl font-bold text-blue-600">{summary.descensos}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <p className="text-gray-600 text-sm">Validados</p>
                                <p className="text-2xl font-bold text-green-600">{summary.validados}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <p className="text-gray-600 text-sm">Sospechosos</p>
                                <p className="text-2xl font-bold text-red-600">{summary.sospechosos}</p>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-3">Cargando registros...</p>
                            </div>
                        ) : !report?.registros.length ? (
                            <div className="p-12 text-center">
                                <p className="text-4xl mb-3">📋</p>
                                <p className="text-gray-500 font-medium">Sin registros de asistencia para esta fecha</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distancia</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geofencing</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {report.registros.map((record) => (
                                            <tr key={record.id} className={`hover:bg-gray-50 ${record.sospechoso ? 'bg-red-50' : ''}`}>
                                                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {new Date(record.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900 text-sm">
                                                        {record.estudiante.nombre} {record.estudiante.apellido}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {record.estudiante.grado}
                                                        {record.estudiante.ruta && ` - ${record.estudiante.ruta.nombre}`}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                                                        record.evento === 'abordaje'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {record.evento === 'abordaje' ? 'Abordaje' : 'Descenso'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {record.vehiculo?.placa || '-'}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {record.distanciaDomicilio !== null
                                                        ? `${Math.round(record.distanciaDomicilio)}m`
                                                        : '-'}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    {record.sospechoso ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                            Sospechoso
                                                        </span>
                                                    ) : record.validadoGeofencing ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                            Validado
                                                        </span>
                                                    ) : record.manualOverride ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                            Manual
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                            No validado
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

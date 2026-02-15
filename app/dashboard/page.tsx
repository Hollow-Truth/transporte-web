'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { TruckIcon, MapIcon, AcademicCapIcon, LocationIcon, UsersIcon, ChartIcon, BellIcon, HomeIcon } from '@/components/icons';
import type { User } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#1e3a8a' }}></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar user={user} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r rounded-2xl shadow-sm p-8 text-white mb-8" style={{ backgroundImage: 'linear-gradient(to right, #1e3a8a, #3b82f6)' }}>
                        <h2 className="text-3xl font-bold mb-2">
                            ¡Bienvenido, {user.nombre}!
                        </h2>
                        <p className="text-blue-100">
                            {user.role === 'admin' && 'Panel de administración del sistema'}
                            {user.role === 'conductor' && 'Panel de conductor - Gestiona tu ruta'}
                            {user.role === 'padre' && 'Panel de padre - Monitorea a tus hijos'}
                        </p>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Admin Dashboard */}
                        {user.role === 'admin' && (
                            <>
                                <DashboardCard
                                    title="Vehículos"
                                    icon={TruckIcon}
                                    description="Gestionar vehículos y conductores"
                                    href="/dashboard/vehicles"
                                    count="12"
                                />
                                <DashboardCard
                                    title="Rutas"
                                    icon={MapIcon}
                                    description="Administrar rutas y paradas"
                                    href="/dashboard/routes"
                                    count="8"
                                />
                                <DashboardCard
                                    title="Estudiantes"
                                    icon={AcademicCapIcon}
                                    description="Gestionar estudiantes y asignaciones"
                                    href="/dashboard/students"
                                    count="45"
                                />
                                <DashboardCard
                                    title="Tracking GPS"
                                    icon={LocationIcon}
                                    description="Monitoreo en tiempo real"
                                    href="/dashboard/tracking"
                                />
                                <DashboardCard
                                    title="Usuarios"
                                    icon={UsersIcon}
                                    description="Administrar usuarios del sistema"
                                    href="/dashboard/users"
                                    count="28"
                                />
                                <DashboardCard
                                    title="Reportes"
                                    icon={ChartIcon}
                                    description="Estadísticas y reportes"
                                    href="/dashboard/reports"
                                />
                            </>
                        )}

                        {/* Conductor Dashboard */}
                        {user.role === 'conductor' && (
                            <>
                                <DashboardCard
                                    title="Mi Vehículo"
                                    icon={TruckIcon}
                                    description="Información de tu vehículo"
                                    href="/dashboard/my-vehicle"
                                />
                                <DashboardCard
                                    title="Mi Ruta"
                                    icon={MapIcon}
                                    description="Ruta asignada y paradas"
                                    href="/dashboard/my-route"
                                />
                                <DashboardCard
                                    title="Iniciar Viaje"
                                    icon={LocationIcon}
                                    description="Comenzar tracking GPS"
                                    href="/dashboard/start-trip"
                                />
                            </>
                        )}

                        {/* Padre Dashboard */}
                        {user.role === 'padre' && (
                            <>
                                <DashboardCard
                                    title="Mis Hijos"
                                    icon={AcademicCapIcon}
                                    description="Información de tus hijos"
                                    href="/dashboard/my-children"
                                    count="2"
                                />
                                <DashboardCard
                                    title="Tracking"
                                    icon={LocationIcon}
                                    description="Ubicación del vehículo"
                                    href="/dashboard/tracking"
                                />
                                <DashboardCard
                                    title="Notificaciones"
                                    icon={BellIcon}
                                    description="Alertas y avisos"
                                    href="/dashboard/notifications"
                                    count="3"
                                />
                            </>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <ChartIcon className="w-5 h-5 mr-2 text-gray-600" />
                            Información del Sistema
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 mb-1">Backend API:</p>
                                <p className="font-mono text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200">
                                    http://localhost:3000/api
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Documentación:</p>
                                <a
                                    href="http://localhost:3000/api/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 inline-block border border-blue-200"
                                >
                                    Swagger UI →
                                </a>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Tu ID:</p>
                                <p className="font-mono text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded-lg truncate border border-gray-200">
                                    {user.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard Card Component
function DashboardCard({
    title,
    icon: Icon,
    description,
    href,
    count,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    href: string;
    count?: string;
}) {
    return (
        <a
            href={href}
            className="block bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow transition-all duration-200 p-6 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: '#dbeafe' }}>
                    <Icon className="w-6 h-6" style={{ color: '#1e3a8a' }} />
                </div>
                {count && (
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
        </a>
    );
}



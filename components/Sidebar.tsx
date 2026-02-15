'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, TruckIcon, MapIcon, AcademicCapIcon, UsersIcon, LocationIcon, ChartIcon, BellIcon, LogoutIcon, MenuIcon, XIcon } from './icons';
import type { User } from '@/types';

interface SidebarProps {
    user: User;
    onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const adminLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { href: '/dashboard/vehicles', label: 'Vehículos', icon: TruckIcon },
        { href: '/dashboard/routes', label: 'Rutas', icon: MapIcon },
        { href: '/dashboard/students', label: 'Estudiantes', icon: AcademicCapIcon },
        { href: '/dashboard/tracking', label: 'Tracking GPS', icon: LocationIcon },
        { href: '/dashboard/attendance', label: 'Asistencia', icon: ChartIcon },
        { href: '/dashboard/users', label: 'Usuarios', icon: UsersIcon },
    ];

    const conductorLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { href: '/dashboard/my-vehicle', label: 'Mi Vehículo', icon: TruckIcon },
        { href: '/dashboard/my-route', label: 'Mi Ruta', icon: MapIcon },
        { href: '/dashboard/start-trip', label: 'Iniciar Viaje', icon: LocationIcon },
    ];

    const padreLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { href: '/dashboard/my-children', label: 'Mis Hijos', icon: AcademicCapIcon },
        { href: '/dashboard/tracking', label: 'Tracking', icon: LocationIcon },
        { href: '/dashboard/notifications', label: 'Notificaciones', icon: BellIcon },
    ];

    const links = user.role === 'admin' ? adminLinks : user.role === 'conductor' ? conductorLinks : padreLinks;

    return (
        <>
            {/* Sidebar */}
            <div
                className={`
          fixed lg:static inset-y-0 left-0 z-[1002]
          w-64 bg-white border-r border-gray-200 h-screen flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Mobile Header with Close Button */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Transporte</h1>
                            <p className="text-xs text-gray-500">Escolar</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <XIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                {/* Desktop Logo */}
                <div className="hidden lg:block p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Transporte</h1>
                            <p className="text-xs text-gray-500">Escolar</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                                {user.nombre[0]}{user.apellido?.[0] || ''}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.nombre} {user.apellido}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-700 text-white'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                <span className="text-sm font-medium">{link.label}</span>
                            </a>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 w-full transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-transparent z-[1001]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Menu Button - Now in a navbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[1001] bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <MenuIcon className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Transporte Escolar</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>
        </>
    );
}





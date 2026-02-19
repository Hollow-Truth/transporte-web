'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TruckIcon } from '@/components/icons';
import type { RegisterDto } from '@/types';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterDto>({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);

            sessionStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
                        <TruckIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-gray-600 text-sm">Regístrate como padre de familia</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                id="nombre"
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Juan"
                            />
                        </div>

                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido
                            </label>
                            <input
                                id="apellido"
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </label>
                        <input
                            id="telefono"
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="809-555-1234"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña *
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { UsersIcon, PlusIcon, PencilIcon, TrashIcon, SearchIcon } from '@/components/icons';
import api from '@/lib/api';
import type { User } from '@/types';

export default function UsersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        role: 'conductor' as 'admin' | 'conductor' | 'padre',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (parsedUser.role !== 'admin') {
                router.push('/dashboard');
            }
        }
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, roleFilter, searchTerm]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.apellido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const { password, ...updateData } = formData;
                await api.patch(`/users/${editingUser.id}`, updateData);
            } else {
                console.log('Sending user data:', formData);
                await api.post('/users', formData);
            }
            setShowModal(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            console.error('Error creating user:', error.response?.data);
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            apellido: user.apellido || '',
            email: user.email,
            password: '',
            telefono: user.telefono || '',
            role: user.role as 'admin' | 'conductor' | 'padre',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await api.delete(`/users/${id}`);
            loadUsers();
        } catch (error) {
            alert('Error al eliminar usuario');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            telefono: '',
            role: 'conductor',
        });
        setEditingUser(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            admin: 'bg-blue-100 text-blue-700 border-blue-200',
            conductor: 'bg-green-100 text-green-700 border-green-200',
            padre: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        const labels = {
            admin: 'Admin',
            conductor: 'Conductor',
            padre: 'Padre',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
                {labels[role as keyof typeof labels]}
            </span>
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} onLogout={handleLogout} />

            <div className="flex-1 overflow-auto pt-16 lg:pt-0">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                                <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Nuevo Usuario</span>
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos los roles</option>
                                <option value="admin">Admin</option>
                                <option value="conductor">Conductor</option>
                                <option value="padre">Padre</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Total Usuarios</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-600">Administradores</p>
                            <p className="text-2xl font-bold text-blue-700">{users.filter(u => u.role === 'admin').length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <p className="text-sm text-green-600">Conductores</p>
                            <p className="text-2xl font-bold text-green-700">{users.filter(u => u.role === 'conductor').length}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <p className="text-sm text-orange-600">Padres</p>
                            <p className="text-2xl font-bold text-orange-700">{users.filter(u => u.role === 'padre').length}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center">
                                <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No se encontraron usuarios</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {u.nombre[0]}{u.apellido?.[0] || ''}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{u.nombre} {u.apellido || ''}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.telefono || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="conductor">Conductor</option>
                                        <option value="padre">Padre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                                >
                                    {editingUser ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { LocationIcon, TruckIcon, XIcon } from '@/components/icons';
import { getSocket, type VehiclePosition } from '@/lib/socket';
import api from '@/lib/api';
import type { User, Vehicle } from '@/types';

// Importar MapView dinámicamente para evitar SSR
const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
            </div>
        </div>
    ),
});

export default function TrackingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehiclePositions, setVehiclePositions] = useState<Map<string, VehiclePosition>>(new Map());
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<Map<string, any>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [L, setL] = useState<any>(null);
    const vehicleIdsRef = useRef<string[]>([]);
    const activeVehicleIdsRef = useRef<Set<string>>(new Set());

    // Cargar Leaflet solo en el cliente
    useEffect(() => {
        import('leaflet').then((leaflet) => {
            setL(leaflet.default);
        });
    }, []);

    // Suscribir a todos los vehículos en el socket
    const subscribeToVehicles = useCallback((vehicleIds: string[]) => {
        const socket = getSocket();
        vehicleIds.forEach((id) => {
            socket.emit('join:vehicle', { vehiculoId: id });
        });
    }, []);

    // Cargar posiciones iniciales de buses activos via HTTP
    const loadActivePositions = useCallback(async (vehicleList: Vehicle[]) => {
        for (const vehicle of vehicleList) {
            try {
                // Verificar si hay trayectoria activa
                const activeRes = await api.get(`/gps/trajectory/${vehicle.id}/active`);
                if (!activeRes.data?.id) continue;

                // Obtener última posición
                try {
                    const lastPos = await api.get(`/gps/last/${vehicle.id}`);
                    if (lastPos.data) {
                        const loc = lastPos.data.location || lastPos.data;
                        const lat = loc.lat || loc.latitude || loc.coordinates?.[1];
                        const lng = loc.lng || loc.longitude || loc.coordinates?.[0];
                        if (lat && lng) {
                            const position: VehiclePosition = {
                                vehicleId: vehicle.id,
                                placa: vehicle.placa || 'Desconocido',
                                latitude: lat,
                                longitude: lng,
                                speed: lastPos.data.velocidad || 0,
                                heading: lastPos.data.rumbo || 0,
                                timestamp: lastPos.data.timestamp || new Date().toISOString(),
                            };
                            setVehiclePositions((prev) => {
                                const newMap = new Map(prev);
                                newMap.set(vehicle.id, position);
                                return newMap;
                            });
                            activeVehicleIdsRef.current.add(vehicle.id);
                        }
                    }
                } catch { /* sin última posición */ }
            } catch { /* sin trayectoria activa */ }
        }
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));

        // Cargar vehículos, suscribirse y obtener posiciones iniciales
        (async () => {
            try {
                const response = await api.get('/vehicles');
                setVehicles(response.data);
                const ids = response.data.map((v: Vehicle) => v.id);
                vehicleIdsRef.current = ids;

                // Suscribir al socket
                subscribeToVehicles(ids);

                // Cargar posiciones activas via HTTP (fallback)
                loadActivePositions(response.data);
            } catch {
                // Error cargando vehiculos
            }
        })();
    }, [subscribeToVehicles, loadActivePositions]);

    // Configurar WebSocket
    useEffect(() => {
        const socket = getSocket();

        const onConnect = () => {
            setIsConnected(true);
            if (vehicleIdsRef.current.length > 0) {
                subscribeToVehicles(vehicleIdsRef.current);
            }
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        // Escuchar actualizaciones de posición
        const onLocationUpdate = (data: any) => {

            const vehiculoId = data.vehiculoId || data.vehicleId;
            if (!vehiculoId) return;

            // Extraer coordenadas de diferentes formatos posibles
            const lat = data.location?.lat || data.lat || data.latitude;
            const lng = data.location?.lng || data.lng || data.longitude;
            if (!lat || !lng) return;

            setVehicles((currentVehicles) => {
                const vehicle = currentVehicles.find((v: Vehicle) => v.id === vehiculoId);
                const placa = vehicle?.placa || data.placa || 'Desconocido';

                const position: VehiclePosition = {
                    vehicleId: vehiculoId,
                    placa,
                    latitude: lat,
                    longitude: lng,
                    speed: data.velocidad || data.speed || 0,
                    heading: data.rumbo || data.heading || 0,
                    timestamp: data.timestamp || new Date().toISOString(),
                };

                setVehiclePositions((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(vehiculoId, position);
                    return newMap;
                });
                activeVehicleIdsRef.current.add(vehiculoId);

                return currentVehicles;
            });
        };

        // Escuchar fin de trayectoria para remover vehículo
        const onTrajectoryEnded = (data: any) => {
            const vehiculoId = data.vehiculoId || data.vehicleId;
            if (!vehiculoId) return;
            activeVehicleIdsRef.current.delete(vehiculoId);
            setVehiclePositions((prev) => {
                const newMap = new Map(prev);
                newMap.delete(vehiculoId);
                return newMap;
            });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('location:update', onLocationUpdate);
        socket.on('trajectory:ended', onTrajectoryEnded);

        // Si ya está conectado al montar
        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            // Salir de todas las salas de vehiculos antes de limpiar
            vehicleIdsRef.current.forEach((id) => {
                socket.emit('leave:vehicle', { vehiculoId: id });
            });
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('location:update', onLocationUpdate);
            socket.off('trajectory:ended', onTrajectoryEnded);
            // NO llamar disconnectSocket() - el socket es singleton compartido
        };
    }, [subscribeToVehicles]);

    // HTTP polling fallback - solo consulta vehiculos activos conocidos
    useEffect(() => {
        const interval = setInterval(async () => {
            const activeIds = Array.from(activeVehicleIdsRef.current);

            if (activeIds.length === 0) return; // No hay activos, no hacer nada

            // Solo consultar última posición de vehículos activos (sin check de trajectory)
            for (const vehicleId of activeIds) {
                try {
                    const lastPos = await api.get(`/gps/last/${vehicleId}`);
                    if (!lastPos.data) continue;
                    const loc = lastPos.data.location || lastPos.data;
                    const lat = loc.lat || loc.latitude || loc.coordinates?.[1];
                    const lng = loc.lng || loc.longitude || loc.coordinates?.[0];
                    if (!lat || !lng) continue;
                    setVehicles((currentVehicles) => {
                        const vehicle = currentVehicles.find((v: Vehicle) => v.id === vehicleId);
                        setVehiclePositions((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(vehicleId, {
                                vehicleId, placa: vehicle?.placa || 'Desconocido',
                                latitude: lat, longitude: lng,
                                speed: lastPos.data.velocidad || 0, heading: lastPos.data.rumbo || 0,
                                timestamp: lastPos.data.timestamp || new Date().toISOString(),
                            });
                            return newMap;
                        });
                        return currentVehicles;
                    });
                } catch { /* error obteniendo posicion */ }
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Actualizar marcadores en el mapa
    useEffect(() => {
        if (!map || !L) return;

        // Importar función de creación de iconos
        import('@/components/MapView').then(({ createVehicleIcon }) => {
            vehiclePositions.forEach((position, vehicleId) => {
                let marker = markers.get(vehicleId);

                if (!marker) {
                    // Crear nuevo marcador
                    const icon = createVehicleIcon('#1e3a8a', position.heading);
                    marker = L.marker([position.latitude, position.longitude], { icon })
                        .addTo(map)
                        .bindPopup(`
              <div class="p-2">
                <p class="font-bold text-gray-900">${position.placa}</p>
                <p class="text-sm text-gray-600">Velocidad: ${Number(position.speed || 0).toFixed(1)} km/h</p>
                <p class="text-xs text-gray-500">${new Date(position.timestamp).toLocaleTimeString()}</p>
              </div>
            `);

                    marker.on('click', () => {
                        setSelectedVehicle(vehicleId);
                    });

                    setMarkers((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(vehicleId, marker!);
                        return newMap;
                    });
                } else {
                    // Actualizar posición existente
                    marker.setLatLng([position.latitude, position.longitude]);
                    const icon = createVehicleIcon('#1e3a8a', position.heading);
                    marker.setIcon(icon);
                }
            });
        });
    }, [vehiclePositions, map, L]);

    // Centrar mapa en vehículo seleccionado
    useEffect(() => {
        if (!map || !selectedVehicle) return;

        const position = vehiclePositions.get(selectedVehicle);
        if (position) {
            map.setView([position.latitude, position.longitude], 16, { animate: true });
            setIsPanelOpen(false); // Cerrar panel en móvil al seleccionar
        }
    }, [selectedVehicle, map, vehiclePositions]);

    const handleLogout = () => {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    const activeVehicles = Array.from(vehiclePositions.values());

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} onLogout={handleLogout} />

            {/* Contenedor del mapa */}
            <div className="flex-1 relative pt-16 lg:pt-0 overflow-hidden">
                {/* Mapa ocupa todo el espacio disponible */}
                <MapView onMapReady={setMap} className="h-full w-full" />

                {/* Botón flotante para abrir panel en móvil */}
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 bg-blue-700 text-white p-4 rounded-full shadow-lg z-[1000] flex items-center space-x-2"
                >
                    <TruckIcon className="w-6 h-6" />
                    <span className="font-medium">{activeVehicles.length}</span>
                </button>

                {/* Panel de vehículos - Desktop: fijo, Móvil: drawer desde abajo */}
                <div
                    className={`
            fixed lg:absolute
            bottom-0 lg:top-4 lg:right-4
            left-0 right-0 lg:left-auto
            lg:w-80 w-full
            bg-white rounded-t-2xl lg:rounded-2xl shadow-lg border border-gray-200
            max-h-[70vh] lg:max-h-[calc(100vh-2rem)]
            overflow-hidden flex flex-col
            z-[1000]
            transform transition-transform duration-300
            ${isPanelOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Vehículos Activos</h3>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-xs text-gray-600">
                                        {isConnected ? 'Conectado' : 'Desconectado'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                                >
                                    <XIcon className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            {activeVehicles.length} vehículo{activeVehicles.length !== 1 ? 's' : ''} en movimiento
                        </p>
                    </div>

                    {/* Lista de vehículos */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {activeVehicles.length === 0 ? (
                            <div className="text-center py-8">
                                <LocationIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 text-sm">No hay vehículos activos</p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Los vehículos aparecerán aquí cuando inicien una trayectoria
                                </p>
                            </div>
                        ) : (
                            activeVehicles.map((position) => (
                                <button
                                    key={position.vehicleId}
                                    onClick={() => setSelectedVehicle(position.vehicleId)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedVehicle === position.vehicleId
                                        ? 'border-blue-700 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <TruckIcon className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900">{position.placa}</p>
                                            <p className="text-sm text-gray-600">
                                                {Number(position.speed || 0).toFixed(1)} km/h
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(position.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer con instrucciones */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-600">
                            <strong>Tip:</strong> Haz clic en un vehículo para centrarlo en el mapa
                        </p>
                    </div>
                </div>

                {/* Overlay para cerrar panel en móvil */}
                {isPanelOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-transparent z-[999]"
                        onClick={() => setIsPanelOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}





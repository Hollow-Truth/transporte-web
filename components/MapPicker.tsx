'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    height?: string;
    centerLat?: number;
    centerLng?: number;
    zoom?: number;
}

export default function MapPicker({
    initialLat,
    initialLng,
    onLocationSelect,
    height = '400px',
    centerLat = -17.3895, // Cochabamba, Bolivia
    centerLng = -66.1568,
    zoom = 13
}: MapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [position, setPosition] = useState<[number, number]>([
        initialLat || centerLat,
        initialLng || centerLng
    ]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Inicializar mapa
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView(position, zoom);

            L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 20,
            }).addTo(mapRef.current);

            const filterId = 'blue-map-filter';
            if (!document.getElementById(filterId)) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
                svg.innerHTML = `<defs>
                  <filter id="${filterId}" color-interpolation-filters="sRGB">
                    <feColorMatrix type="matrix" values="
                      0.248 0.248 0.248 0 0.118
                      0.222 0.222 0.222 0 0.227
                      0.133 0.133 0.133 0 0.541
                      0     0     0     1 0
                    "/>
                  </filter>
                </defs>`;
                document.body.appendChild(svg);
            }
            const tilePane = mapRef.current.getPanes().tilePane;
            tilePane.style.filter = `url(#${filterId})`;

            // Agregar marcador inicial
            markerRef.current = L.marker(position, { draggable: true })
                .addTo(mapRef.current);

            // Evento de arrastre del marcador
            markerRef.current.on('dragend', (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
            });

            // Evento de click en el mapa
            mapRef.current.on('click', (e) => {
                const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
                setPosition(newPos);
                if (markerRef.current) {
                    markerRef.current.setLatLng(newPos);
                }
            });

            // Forzar invalidación de tamaño para asegurar renderizado correcto
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 100);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Actualizar posición del marcador cuando cambia
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        }
    }, [position]);

    const handleConfirm = () => {
        onLocationSelect(position[0], position[1]);
    };

    return (
        <div className="w-full flex flex-col h-full">
            <div
                ref={mapContainerRef}
                style={{ height: height, minHeight: '300px' }}
                className="rounded-lg border-2 border-gray-300 mb-4 flex-1 w-full z-10"
            />

            <div className="bg-gray-50 p-4 rounded-lg space-y-3 flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitud
                        </label>
                        <input
                            type="text"
                            value={position[0].toFixed(6)}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitud
                        </label>
                        <input
                            type="text"
                            value={position[1].toFixed(6)}
                            readOnly
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Haz click en el mapa o arrastra el marcador para seleccionar una ubicación
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                >
                    ✓ Confirmar Ubicación
                </button>
            </div>
        </div>
    );
}

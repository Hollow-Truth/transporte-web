'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    onMapReady?: (map: L.Map) => void;
}

export default function MapView({
    center = [-17.3895, -66.1568], // Cochabamba, Bolivia por defecto
    zoom = 13,
    className = 'h-full w-full',
    onMapReady,
}: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Crear mapa
        const map = L.map(containerRef.current).setView(center, zoom);

        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 20,
        }).addTo(map);

        // SVG feColorMatrix: mapeo preciso blanco→azul claro, negro→navy (#1e3a8a)
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
        const tilePane = map.getPanes().tilePane;
        tilePane.style.filter = `url(#${filterId})`;

        mapRef.current = map;

        // Notificar que el mapa está listo
        if (onMapReady) {
            onMapReady(map);
        }

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} className={className} />;
}

// Función helper para crear icono de vehículo personalizado
export const createVehicleIcon = (color: string = '#1e3a8a', rotation: number = 0) => {
    const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg)">
      <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" 
            stroke="${color}" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            fill="${color}" 
            fill-opacity="0.3"/>
    </svg>
  `;

    return L.divIcon({
        html: svgIcon,
        className: 'vehicle-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

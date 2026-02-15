'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

const studentIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:#eab308;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const schoolIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:#1e3a8a;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// Colegio Adventista de Bolivia - ubicación fija
const COLEGIO_LAT = -17.38914530406023;
const COLEGIO_LNG = -66.31402713529513;

interface RouteMapViewerProps {
    start: { lat: number, lng: number, label?: string };
    end: { lat: number, lng: number, label?: string };
    stops?: { lat: number, lng: number, label?: string, type?: 'student' | 'stop' }[];
    routeGeometry?: { lat: number, lng: number }[];
    onMapReady?: (map: L.Map) => void;
}

export default function RouteMapViewer({ start, end, stops = [], routeGeometry, onMapReady }: RouteMapViewerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize Map
        const map = L.map(containerRef.current);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add School Marker (fixed location)
        L.marker([COLEGIO_LAT, COLEGIO_LNG], { icon: schoolIcon })
            .bindPopup('<b>Colegio Adventista de Bolivia</b>')
            .addTo(map);

        // Add Start Marker (Green)
        if (start.lat && start.lng) {
            L.marker([start.lat, start.lng], {
                icon: createCustomIcon('#22c55e') // Green-500
            })
                .bindPopup(`<b>Inicio:</b> ${start.label || 'Punto de Inicio'}`)
                .addTo(map);
        }

        // Add End Marker (Red)
        if (end.lat && end.lng) {
            L.marker([end.lat, end.lng], {
                icon: createCustomIcon('#ef4444') // Red-500
            })
                .bindPopup(`<b>Destino:</b> ${end.label || 'Punto de Destino'}`)
                .addTo(map);
        }

        // Add Stops/Students
        stops.forEach((stop, index) => {
            if (stop.lat && stop.lng) {
                const icon = stop.type === 'student' ? studentIcon : createCustomIcon('#3b82f6');
                L.marker([stop.lat, stop.lng], { icon })
                    .bindPopup(`<b>${stop.type === 'student' ? 'Estudiante' : 'Parada'}:</b> ${stop.label || `Punto ${index + 1}`}`)
                    .addTo(map);
            }
        });

        // Draw Line (Full calculated path)
        if (routeGeometry && routeGeometry.length > 0) {
            const latlngs = routeGeometry.map(p => [p.lat, p.lng] as [number, number]);

            const polyline = L.polyline(latlngs, {
                color: '#3b82f6', // Blue-500
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);

            // Fit bounds to the route
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        }
        // Fallback: Straight line if no geometry
        else if (start.lat && start.lng && end.lat && end.lng) {
            const latlngs: L.LatLngExpression[] = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];

            const polyline = L.polyline(latlngs, {
                color: '#9ca3af', // Gray-400
                weight: 3,
                opacity: 0.6,
                dashArray: '5, 10'
            }).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        } else {
            // Default view if no points
            map.setView([-17.3895, -66.1568], 13);
        }

        // Invalidate size after mount to ensure correct rendering in modal
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        if (onMapReady) {
            onMapReady(map);
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [start, end, routeGeometry]);

    return <div ref={containerRef} className="w-full h-full rounded-xl border border-gray-200" />;
}

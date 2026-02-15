export enum UserRole {
  ADMIN = 'admin',
  CONDUCTOR = 'conductor',
  PADRE = 'padre',
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  role: UserRole;
  telefono?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido?: string;
    role: UserRole;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  role?: UserRole;
  telefono?: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  capacidad: number;
  color: string;
  conductorId: string;
  conductor?: User;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  lat?: number;
  lng?: number;
  latitud: number;
  longitud: number;
  nombre: string;
  orden: number;
}

export interface Route {
  id: string;
  nombre: string;
  descripcion: string;
  vehiculoId: string;
  vehiculo?: Vehicle;
  puntos: RouteStop[];
  estudiantes?: Student[];
  paradas?: RouteStop[];
  horaInicio: string;
  horaFin: string;
  inicioLat: number;
  inicioLng: number;
  inicioNombre: string;
  destinoLat: number;
  destinoLng: number;
  destinoNombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  direccion: string;
  grado?: string;
  nombrePadre?: string;
  telefonoPadre?: string;
  latitud?: number;
  longitud?: number;
  padreId: string;
  padre?: User;
  rutaId?: string;
  ruta?: Route;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GpsPoint {
  id: string;
  vehiculoId: string;
  latitud: number;
  longitud: number;
  velocidad?: number;
  rumbo?: number;
  timestamp: string;
}

export interface Trajectory {
  id: string;
  vehiculoId: string;
  fechaInicio: string;
  fechaFin?: string;
  distanciaTotal?: number;
}

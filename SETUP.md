# Frontend Next.js - Sistema de Transporte Escolar

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install axios
```

### 2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3001`

---

## 📁 Estructura del Proyecto

```
transporte-web/
├── app/                    # App Router (Next.js 15)
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── dashboard/         # Dashboard principal
│   ├── vehicles/          # Gestión de vehículos
│   ├── routes/            # Gestión de rutas
│   ├── students/          # Gestión de estudiantes
│   └── tracking/          # Tracking GPS en tiempo real
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
│   └── api.ts            # Cliente API con axios
├── types/                 # Tipos TypeScript
│   └── index.ts          # Interfaces del backend
└── .env.local            # Variables de entorno
```

---

## 🔧 Configuración

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 📝 Flujo de la Aplicación

### 1. Autenticación
**Registro (Padres):**
- Usuario accede a `/register`
- Completa formulario: email, password, nombre, apellido
- Se crea automáticamente con `role: "padre"`
- Recibe token JWT

**Login:**
- Usuario accede a `/login`
- Ingresa email y password
- Recibe token JWT y datos de usuario
- Redirige a `/dashboard`

**Creación de Usuarios (Admin):**
- Admin puede crear conductores desde `/dashboard/users`
- Usa endpoint `POST /api/users` con `role: "conductor"`

### 2. Dashboard Principal
Muestra según el rol:

**Admin:**
- Total de vehículos, rutas, estudiantes
- Mapa con tracking en tiempo real
- Acceso a todos los módulos

**Conductor:**
- Su vehículo asignado
- Ruta del día
- Botón para iniciar/finalizar trayectoria
- Mapa con su ubicación

**Padre:**
- Información de sus hijos
- Ruta asignada
- Ubicación del vehículo en tiempo real
- Notificaciones de llegada

### 3. Módulo de Vehículos (`/dashboard/vehicles`)
**Admin puede:**
- Ver lista de vehículos
- Crear nuevo vehículo (placa, marca, modelo, año, capacidad, color)
- Asignar conductor (selecciona de lista de usuarios con role="conductor")
- Editar/Desactivar vehículos

### 4. Módulo de Rutas (`/dashboard/routes`)
**Admin puede:**
- Ver lista de rutas
- Crear nueva ruta:
  - Nombre y descripción
  - Asignar vehículo
  - Agregar paradas en el mapa (lat, lng, nombre, orden)
  - Definir horarios (hora inicio, hora fin)
- Ver ruta en mapa con todas las paradas
- Editar/Desactivar rutas

### 5. Módulo de Estudiantes (`/dashboard/students`)
**Admin puede:**
- Ver lista de estudiantes
- Crear nuevo estudiante:
  - Datos personales (nombre, apellido, fecha nacimiento, dirección)
  - Asignar padre (selecciona de usuarios con role="padre")
  - Asignar ruta
- Filtrar por ruta o por padre
- Editar/Desactivar estudiantes

**Padre puede:**
- Ver solo sus hijos
- Ver ruta asignada a cada hijo

### 6. Tracking GPS en Tiempo Real (`/dashboard/tracking`)
**Funcionalidades:**
- Mapa con todos los vehículos activos
- Actualización en tiempo real vía WebSockets
- Click en vehículo muestra:
  - Información del vehículo
  - Conductor
  - Ruta asignada
  - Velocidad actual
  - Última actualización
- Historial de trayectorias
- Búsqueda de vehículos cercanos a una ubicación

---

## 🔌 Integración con Backend

### API Client (lib/api.ts)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Ejemplo de Uso
```typescript
// Login
const response = await api.post('/auth/login', {
  email: 'admin@test.com',
  password: 'Admin123!'
});
localStorage.setItem('access_token', response.data.access_token);

// Obtener vehículos
const vehicles = await api.get('/vehicles');

// Crear ruta
const route = await api.post('/routes', {
  nombre: 'Ruta Norte',
  vehiculoId: 'uuid',
  puntos: [
    { lat: 18.4861, lng: -69.9312, nombre: 'Parada 1', orden: 1 }
  ],
  horaInicio: '07:00',
  horaFin: '08:00'
});
```

---

## 🗺️ WebSockets para Tracking

### Conexión
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('access_token')
  }
});

// Suscribirse a vehículo
socket.emit('subscribe:vehicle', vehicleId);

// Escuchar actualizaciones
socket.on('location:update', (data) => {
  console.log('Nueva ubicación:', data);
  // Actualizar marcador en mapa
});
```

---

## 🎨 Componentes Principales a Crear

### 1. AuthForm
- Formulario reutilizable para login/register
- Validación de campos
- Manejo de errores

### 2. VehicleCard
- Muestra información del vehículo
- Acciones: editar, desactivar
- Estado: activo/inactivo

### 3. RouteMap
- Mapa con Leaflet o Google Maps
- Muestra ruta con paradas
- Permite agregar/editar paradas

### 4. StudentTable
- Tabla con lista de estudiantes
- Filtros por ruta y padre
- Acciones: editar, desactivar

### 5. TrackingMap
- Mapa en tiempo real
- Marcadores de vehículos
- Actualización vía WebSocket
- Popup con información

---

## 📦 Dependencias Adicionales Recomendadas

```bash
npm install socket.io-client
npm install leaflet react-leaflet
npm install @types/leaflet
npm install date-fns
npm install react-hook-form
npm install zod
```

---

## 🔐 Protección de Rutas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

---

## 🎯 Próximos Pasos

1. ✅ Backend funcionando en `http://localhost:3000`
2. ✅ Frontend creado en `transporte-web`
3. ⏳ Instalar dependencias: `npm install axios`
4. ⏳ Crear página de login
5. ⏳ Crear dashboard principal
6. ⏳ Implementar módulos (vehicles, routes, students)
7. ⏳ Integrar tracking en tiempo real

---

## 📞 Endpoints del Backend

Todos los endpoints están documentados en:
```
http://localhost:3000/api/docs
```

**Principales:**
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/routes` - Listar rutas
- `POST /api/routes` - Crear ruta
- `GET /api/students` - Listar estudiantes
- `POST /api/gps/points` - Guardar ubicación
- `GET /api/gps/nearby` - Vehículos cercanos

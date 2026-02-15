# Frontend - Transporte Escolar

Sistema de gestión de transporte escolar - Frontend Next.js

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ instalado
- Backend corriendo en `http://localhost:3000`

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:3001**

## 🎨 Diseño

### Paleta de Colores
- **Principal:** `#403F6F` (Morado oscuro)
- **Hover:** `#322F57` (Morado más oscuro)
- **Peligro:** `#dc2626` (Rojo)
- **Éxito:** `#16a34a` (Verde)
- **Fondo:** `#ffffff` (Blanco)

### Características de Diseño
- ✅ Fondo blanco tradicional (estilo Facebook/Reddit)
- ✅ Iconos SVG minimalistas monocromáticos
- ✅ Sidebar responsive con menú hamburguesa en móvil
- ✅ Bordes redondeados en todos los componentes
- ✅ Transiciones suaves

## 📁 Estructura del Proyecto

```
transporte-web/
├── app/
│   ├── login/              # Página de inicio de sesión
│   ├── register/           # Página de registro
│   └── dashboard/          # Dashboard principal
│       ├── page.tsx        # Dashboard home
│       ├── vehicles/       # Gestión de vehículos
│       ├── routes/         # Gestión de rutas
│       ├── students/       # Gestión de estudiantes
│       └── tracking/       # Tracking GPS (próximo)
├── components/
│   ├── Sidebar.tsx         # Sidebar responsive
│   └── icons.tsx           # Iconos SVG
├── lib/
│   └── api.ts              # Cliente Axios con interceptores
├── types/
│   └── index.ts            # Tipos TypeScript
└── .env.local              # Variables de entorno
```

## 🔐 Autenticación

El sistema usa JWT almacenado en `localStorage`:
- Token: `access_token`
- Usuario: `user`

### Usuarios de Prueba

**Admin:**
- Email: `admin@test.com`
- Password: `Admin123!`

**Conductor:**
- Email: `conductor@test.com`
- Password: `Conductor123!`

**Padre:**
- Email: `padre@test.com`
- Password: `Padre123!`

## 📱 Responsive Design

### Desktop (lg+)
- Sidebar fijo visible
- Layout de 3 columnas en grids

### Tablet (md)
- Sidebar fijo visible
- Layout de 2 columnas en grids

### Mobile (< lg)
- Sidebar oculto por defecto
- Botón hamburguesa en esquina superior izquierda
- Overlay oscuro al abrir sidebar
- Layout de 1 columna en grids

## 🎯 Módulos Implementados

### ✅ Autenticación
- Login con validación
- Registro de padres
- Redirección automática

### ✅ Dashboard
- Vista personalizada por rol (Admin/Conductor/Padre)
- Cards con estadísticas
- Navegación rápida

### ✅ Vehículos (Admin)
- Listar vehículos en tabla
- Crear/Editar/Eliminar vehículos
- Asignar conductor
- Filtrar por estado

### ✅ Rutas (Admin)
- Listar rutas en grid de cards
- Crear/Editar/Eliminar rutas
- Gestión de paradas (agregar/eliminar)
- Asignar vehículo
- Definir horarios

### ✅ Estudiantes (Admin)
- Listar estudiantes en tabla
- Crear/Editar/Eliminar estudiantes
- Asignar padre y ruta
- Estadísticas (total, con ruta, sin ruta)
- Filtros por padre y ruta

### 🔜 Próximos Módulos
- Tracking GPS en tiempo real
- WebSockets para actualizaciones live
- Notificaciones
- Reportes

## 🔧 Configuración

### Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Cliente API

El cliente API (`lib/api.ts`) incluye:
- Interceptor de request para agregar JWT
- Interceptor de response para manejar errores 401
- Redirección automática a login si no hay token

## 🎨 Componentes Principales

### Sidebar
- Navegación por roles
- Información del usuario
- Logout
- Responsive con menú hamburguesa

### Icons
15+ iconos SVG minimalistas:
- HomeIcon, TruckIcon, MapIcon
- AcademicCapIcon, UsersIcon
- LocationIcon, ChartIcon, BellIcon
- PlusIcon, PencilIcon, TrashIcon
- LogoutIcon, MenuIcon, XIcon

## 🚦 Próximos Pasos

1. **Tracking GPS**
   - Mapa con Leaflet/Mapbox
   - Marcadores de vehículos en tiempo real
   - WebSocket para actualizaciones

2. **Notificaciones**
   - Sistema de alertas
   - Notificaciones push

3. **Reportes**
   - Estadísticas de uso
   - Reportes de rutas
   - Exportar a PDF/Excel

## 📚 Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Iconos:** SVG personalizados

## 🐛 Troubleshooting

### El frontend no carga
```bash
# Verificar que el puerto 3001 esté libre
netstat -ano | findstr :3001

# Reiniciar el servidor
npm run dev
```

### Error de conexión con API
- Verificar que el backend esté corriendo en `http://localhost:3000`
- Revisar la variable `NEXT_PUBLIC_API_URL` en `.env.local`

### Sidebar no aparece en móvil
- Presionar el botón hamburguesa en la esquina superior izquierda
- El sidebar se oculta automáticamente en pantallas < 1024px

## 📝 Notas

- El sistema está diseñado para ser usado en conjunto con el backend NestJS
- Todos los módulos CRUD están completamente funcionales
- El diseño es responsive y funciona en desktop, tablet y móvil
- Los colores pueden ser personalizados en `app/globals.css`

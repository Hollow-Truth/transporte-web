# Guía de Prueba - Tracking GPS en Tiempo Real

## 🚀 Cómo Probar el Sistema de Tracking

### Requisitos Previos
- Backend corriendo en `http://localhost:3000`
- Frontend corriendo en `http://localhost:3001`
- Usuario admin logueado

### Paso 1: Preparar Datos

1. **Crear un vehículo** (si no existe):
   - Ir a `/dashboard/vehicles`
   - Crear vehículo con placa, marca, modelo, conductor

2. **Crear una ruta** (si no existe):
   - Ir a `/dashboard/routes`
   - Crear ruta con nombre, horarios, vehículo asignado

### Paso 2: Iniciar Trayectoria

Usar Swagger UI o cURL para iniciar una trayectoria:

**Opción A: Swagger UI**
1. Abrir `http://localhost:3000/api/docs`
2. Autenticarse con el botón "Authorize"
3. Ir a `POST /gps/trajectory/start`
4. Ejecutar con body:
```json
{
  "vehiculoId": "uuid-del-vehiculo",
  "rutaId": "uuid-de-la-ruta"
}
```

**Opción B: PowerShell**
```powershell
$token = "tu-jwt-token"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    vehiculoId = "uuid-del-vehiculo"
    rutaId = "uuid-de-la-ruta"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/gps/trajectory/start" -Method POST -Headers $headers -Body $body
```

### Paso 3: Enviar Puntos GPS

Enviar puntos GPS para simular movimiento del vehículo:

```powershell
# Punto 1 - Santo Domingo Centro
$point1 = @{
    vehiculoId = "uuid-del-vehiculo"
    latitud = 18.4861
    longitud = -69.9312
    velocidad = 35.5
    rumbo = 45
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/gps/points" -Method POST -Headers $headers -Body $point1

Start-Sleep -Seconds 3

# Punto 2 - Movimiento hacia el norte
$point2 = @{
    vehiculoId = "uuid-del-vehiculo"
    latitud = 18.4871
    longitud = -69.9302
    velocidad = 40.2
    rumbo = 50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/gps/points" -Method POST -Headers $headers -Body $point2

Start-Sleep -Seconds 3

# Punto 3 - Continuar movimiento
$point3 = @{
    vehiculoId = "uuid-del-vehiculo"
    latitud = 18.4881
    longitud = -69.9292
    velocidad = 38.7
    rumbo = 55
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/gps/points" -Method POST -Headers $headers -Body $point3
```

### Paso 4: Ver en el Frontend

1. Abrir `http://localhost:3001/dashboard/tracking`
2. Deberías ver:
   - ✅ Mapa cargado con OpenStreetMap
   - ✅ Panel lateral mostrando "1 vehículo en movimiento"
   - ✅ Marcador del vehículo en el mapa
   - ✅ Indicador "Conectado" en verde
   - ✅ Actualizaciones en tiempo real cuando envías nuevos puntos

### Paso 5: Interactuar

- **Hacer clic en el vehículo del panel**: Centra el mapa en ese vehículo
- **Hacer clic en el marcador del mapa**: Muestra popup con información
- **Enviar más puntos GPS**: Ver cómo se actualiza en tiempo real

## 🧪 Script de Prueba Automatizado

Crear archivo `test-tracking.ps1`:

```powershell
# Configuración
$baseUrl = "http://localhost:3000/api"
$token = "tu-jwt-token-aqui"
$vehiculoId = "uuid-del-vehiculo"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "🚀 Iniciando simulación de tracking GPS..." -ForegroundColor Green

# Simular ruta desde Santo Domingo Centro hacia el norte
$waypoints = @(
    @{ lat = 18.4861; lng = -69.9312; speed = 35.5; heading = 45 },
    @{ lat = 18.4871; lng = -69.9302; speed = 40.2; heading = 50 },
    @{ lat = 18.4881; lng = -69.9292; speed = 38.7; heading = 55 },
    @{ lat = 18.4891; lng = -69.9282; speed = 42.1; heading = 60 },
    @{ lat = 18.4901; lng = -69.9272; speed = 45.3; heading = 65 },
    @{ lat = 18.4911; lng = -69.9262; speed = 43.8; heading = 70 },
    @{ lat = 18.4921; lng = -69.9252; speed = 41.2; heading = 75 },
    @{ lat = 18.4931; lng = -69.9242; speed = 39.5; heading = 80 }
)

foreach ($point in $waypoints) {
    $body = @{
        vehiculoId = $vehiculoId
        latitud = $point.lat
        longitud = $point.lng
        velocidad = $point.speed
        rumbo = $point.heading
    } | ConvertTo-Json

    Write-Host "📍 Enviando punto: Lat $($point.lat), Lng $($point.lng), Velocidad $($point.speed) km/h" -ForegroundColor Cyan
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/gps/points" -Method POST -Headers $headers -Body $body
        Write-Host "✅ Punto enviado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds 2
}

Write-Host "`n✨ Simulación completada!" -ForegroundColor Green
```

## 🔍 Verificación

### En el Frontend
- [ ] Mapa se carga correctamente
- [ ] Panel muestra vehículos activos
- [ ] Marcadores aparecen en el mapa
- [ ] Posiciones se actualizan en tiempo real
- [ ] Popup muestra información correcta
- [ ] Click en vehículo centra el mapa
- [ ] Indicador de conexión funciona

### En la Consola del Navegador
- [ ] "✅ WebSocket conectado" aparece
- [ ] "Posición recibida:" con datos del vehículo
- [ ] No hay errores de JavaScript

### En el Backend
- [ ] Logs muestran conexiones WebSocket
- [ ] Eventos `vehicle:position` se emiten
- [ ] No hay errores en la consola

## 🐛 Troubleshooting

### El mapa no carga
- Verificar que Leaflet CSS está importado en `globals.css`
- Revisar consola del navegador por errores

### No aparecen vehículos
- Verificar que se inició una trayectoria
- Confirmar que se están enviando puntos GPS
- Revisar conexión WebSocket (indicador verde)

### WebSocket no conecta
- Verificar que el backend está corriendo
- Confirmar que el token JWT es válido
- Revisar CORS en el backend

### Marcadores no se actualizan
- Verificar eventos en consola del navegador
- Confirmar que `vehicleId` coincide
- Revisar que el evento `vehicle:position` se emite desde el backend

## 📝 Notas

- El sistema usa OpenStreetMap como proveedor de tiles
- Los marcadores se actualizan automáticamente sin recargar
- La rotación del icono del vehículo refleja el rumbo (heading)
- El panel muestra la hora de la última actualización

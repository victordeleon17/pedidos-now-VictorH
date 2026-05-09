# Endpoints Manuales Para Simular UI Repartidores

## Base Local

```txt
http://localhost:3005
```

Todos los endpoints de Logistica usan:

```txt
/api/logistica
```

## Headers Simulados

Para simular un repartidor:

```http
x-user-id: 101
x-user-role: repartidor
```

Para simular admin:

```http
x-user-id: 1
x-user-role: admin
```

Los usuarios/roles simulados estan en:

```txt
src/data/auth.mock.js
```

Los repartidores simulados estan en:

```txt
src/data/repartidores.mock.js
```

## 1. Ver Repartidores Disponibles

```http
GET /api/logistica/repartidores/disponibles
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/repartidores/disponibles
```

## 2. Crear Entrega Desde Restaurante

Usa restaurante real y pedido simulado si Restaurante no responde pedido.

```http
POST /api/logistica/entregas/restaurantes/:restaurante_id/pedidos/:pedido_id
```

Ejemplo:

```bash
curl -X POST http://localhost:3005/api/logistica/entregas/restaurantes/1/pedidos/1 \
  -H 'Content-Type: application/json' \
  -d '{
    "cliente_nombre": "Cliente Manual",
    "direccion_entrega": "Direccion manual de prueba",
    "destino_lat": 14.84,
    "destino_lng": -91.52
  }'
```

## 3. Ver Feed Disponible

Este endpoint lo consumiria la UI de repartidores antes de aceptar.

```http
GET /api/logistica/feed/disponibles
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/feed/disponibles
```

## 4. Ver Preview De Una Entrega

Muestra mas datos, pero todavia sin telefonos.

```http
GET /api/logistica/feed/:entrega_id/preview
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/feed/1/preview
```

## 5. Aceptar Entrega

Simula que el repartidor acepta el pedido.

```http
PATCH /api/logistica/feed/:entrega_id/aceptar
```

Ejemplo:

```bash
curl -X PATCH http://localhost:3005/api/logistica/feed/1/aceptar \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: 101' \
  -H 'x-user-role: repartidor' \
  -d '{ "repartidor_id": 101 }'
```

Resultado esperado:

- Crea asignacion activa.
- Cambia entrega a `asignada`.
- Cambia repartidor a `ocupado`.
- Registra historial.
- Registra notificacion hacia Restaurante con evento `ACCEPTED`.

## 6. Ver Detalles Completos Post-Aceptacion

Este endpoint seria para el panel activo del repartidor.

```http
GET /api/logistica/entregas/:entrega_id/detalles
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/entregas/1/detalles \
  -H 'x-user-id: 101' \
  -H 'x-user-role: repartidor'
```

## 7. Marcar Pedido Recogido

Simula que el repartidor ya llego al restaurante y recogio el pedido.

```http
PATCH /api/logistica/entregas/:entrega_id/recogida
```

Ejemplo:

```bash
curl -X PATCH http://localhost:3005/api/logistica/entregas/1/recogida \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: 101' \
  -H 'x-user-role: repartidor' \
  -d '{ "comentario": "Pedido recogido en restaurante" }'
```

Resultado esperado:

- Cambia entrega a `en_ruta`.
- Registra historial.
- Registra notificacion hacia Restaurante con evento `PICKED_UP`.

## 8. Actualizar Ubicacion Del Repartidor

```http
PATCH /api/logistica/repartidores/me/ubicacion
```

Ejemplo:

```bash
curl -X PATCH http://localhost:3005/api/logistica/repartidores/me/ubicacion \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: 101' \
  -H 'x-user-role: repartidor' \
  -d '{
    "lat": 14.839,
    "lng": -91.521,
    "heading": 180,
    "entrega_id": 1
  }'
```

## 9. Marcar Entregado

```http
PATCH /api/logistica/entregas/:entrega_id/entregada
```

Ejemplo:

```bash
curl -X PATCH http://localhost:3005/api/logistica/entregas/1/entregada \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: 101' \
  -H 'x-user-role: repartidor' \
  -d '{ "comentario": "Entregado al cliente" }'
```

Resultado esperado:

- Cambia entrega a `entregada`.
- Marca `fecha_entrega_real`.
- Desactiva la entrega.
- Libera la asignacion activa.
- Cambia repartidor a `disponible`.
- Registra notificacion hacia Restaurante con evento `DELIVERED`.

## 10. Ver Historial

```http
GET /api/logistica/entregas/:entrega_id/historial
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/entregas/1/historial
```

## 11. Ver Notificaciones Registradas

```http
GET /api/logistica/notificaciones
```

Ejemplo:

```bash
curl http://localhost:3005/api/logistica/notificaciones
```

## Estados Del Flujo Manual

```txt
pendiente -> asignada -> en_ruta -> entregada
```

Estados alternos:

```txt
pendiente/asignada/en_ruta -> cancelada
pendiente/asignada/en_ruta -> fallida
```

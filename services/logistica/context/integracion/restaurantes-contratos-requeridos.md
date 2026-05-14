# Contratos Requeridos Para Restaurantes

## Objetivo

Definir que necesita Logistica del modulo Restaurantes para operar el flujo completo de entrega y que endpoints necesita Restaurantes para recibir cambios de estado.

## Estado Actual Verificado

- Base desplegada: `https://restaurantes.fly.dev/api`
- `GET /restaurantes` funciona.
- `GET /restaurantes/:id` funciona.
- `GET /estados-pedido` funciona pero actualmente devuelve lista vacia.
- `GET /restaurantes/:restaurante_id/pedidos` respondio `500` en deploy durante la revision.
- Las colecciones Postman documentan pedidos, detalles, historial y cancelacion bajo `/restaurantes/:restaurante_id/pedidos`.

## Endpoint Que Restaurante Debe Arreglar

### Obtener Pedido

```http
GET /api/restaurantes/:restaurante_id/pedidos/:pedido_id
```

Debe responder `200` con datos del pedido. Logistica puede trabajar con datos basicos, pero idealmente debe incluir un payload logistico completo.

Respuesta minima esperada:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurante_id": 1,
    "cliente_id": 500,
    "direccion_entrega": "Direccion del cliente",
    "notas": "Instrucciones del cliente",
    "total": 150.00,
    "estado_id": 1,
    "items": [
      { "producto_id": 1, "nombre": "Producto", "cantidad": 2, "precio": 50.00 }
    ]
  }
}
```

## Endpoint Recomendado Para Payload Logistico

Este endpoint evitaria que Logistica tenga que reconstruir datos desde varios endpoints.

```http
GET /api/restaurantes/:restaurante_id/pedidos/:pedido_id/logistica
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "orden_id": 1,
    "tipo_origen": "pedido",
    "empresa_id": 1,
    "sucursal_id": null,
    "cliente_id": 500,
    "categoria_codigo": "FOOD",
    "metodo_pago": "CASH",
    "tarifa_ofrecida": 25.00,
    "monto_cobrar": 150.00,
    "distancia_estimada_km": 4.2,
    "negocio_nombre": "Restaurante El Buen Sabor",
    "negocio_telefono": "+57 300 1234567",
    "negocio_direccion": "Calle Principal #123, Ciudad",
    "origen_coordenadas": { "lat": 14.8355, "lng": -91.5275 },
    "cliente_nombre": "Cliente Demo",
    "cliente_telefono": "5555-0000",
    "direccion_entrega": "Direccion del cliente",
    "referencia_direccion": "Referencia",
    "instrucciones_entrega": "Llamar al llegar",
    "destino_coordenadas": { "lat": 14.84, "lng": -91.52 },
    "detalles_orden": ["2x Producto"],
    "fecha_entrega_estimada": null
  }
}
```

## Endpoint Que Restaurante Debe Exponer Para Cambios De Estado

Logistica necesita avisar a Restaurante cuando cambia la entrega.

### Opcion Compatible Con La Coleccion Actual

```http
PUT /api/restaurantes/:restaurante_id/pedidos/:pedido_id/estado
```

Body sugerido:

```json
{
  "estado_id": 2,
  "motivo": "LOGISTICA_ACCEPTED",
  "metadata": {
    "entrega_id": 1,
    "estado_logistica": "asignada",
    "repartidor_id": 101,
    "timestamp": "2026-05-04T19:00:00.000Z"
  }
}
```

### Opcion Recomendada Especifica Para Logistica

```http
PATCH /api/restaurantes/:restaurante_id/pedidos/:pedido_id/logistica-status
```

Body recomendado:

```json
{
  "entrega_id": 1,
  "estado_logistica": "asignada",
  "evento": "ACCEPTED",
  "repartidor_id": 101,
  "comentario": "Repartidor acepto la entrega",
  "timestamp": "2026-05-04T19:00:00.000Z"
}
```

## Mapeo De Estados Sugerido

| Estado Logistica | Evento | Significado Para Restaurante |
|---|---|---|
| `pendiente` | `CREATED` | Entrega creada, esperando repartidor |
| `asignada` | `ACCEPTED` | Repartidor acepto el pedido |
| `en_ruta` | `PICKED_UP` | Repartidor recogio el pedido |
| `entregada` | `DELIVERED` | Pedido entregado al cliente |
| `cancelada` | `CANCELLED` | Entrega cancelada |
| `fallida` | `FAILED` | Entrega no completada |

## Estado Actual En Logistica

Mientras Restaurante no exponga el payload logistico completo, Logistica usa:

- Datos reales de `GET /api/restaurantes/:id`.
- Datos simulados de pedido en `src/data/restaurante-pedido.mock.js`.
- Notificaciones registradas en `notificaciones_logistica`.
- Intento real hacia `PUT /api/restaurantes/:restaurante_id/pedidos/:pedido_id/estado` cuando haya metadata de restaurante.

Si Restaurante responde error, Logistica no bloquea el flujo: registra la notificacion como fallida para reintento.

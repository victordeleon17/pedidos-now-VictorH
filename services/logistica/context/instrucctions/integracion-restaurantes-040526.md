# Integracion Restaurantes 04/05/2026

## Fuente revisada

- Coleccion Postman: `context/postman/restaurantes/MASTER-COLLECTION.postman_collection.json`
- Deploy: `https://restaurantes.fly.dev`
- Base API real verificada: `https://restaurantes.fly.dev/api`

## Endpoints verificados

- `GET /health` responde correctamente.
- `GET /api/restaurantes` responde restaurantes activos.
- `GET /api/restaurantes/:id` responde detalle del restaurante.
- `GET /api/estados-pedido` responde correctamente, aunque actualmente sin datos.
- `GET /api/restaurantes/:id/pedidos` existe en Postman, pero en deploy respondio 500 durante la verificacion.

## Decisiones de implementacion

1. Agregar cliente HTTP para Restaurantes usando `RESTAURANTES_API_URL`, con default `https://restaurantes.fly.dev/api`.
2. Preparar endpoint en Logistica para crear entregas desde restaurante usando datos reales del restaurante y payload del pedido cuando este disponible.
3. Mientras pedidos/restaurantes no exponga payload logistico completo, completar datos faltantes con mocks controlados.
4. Mantener auth y roles simulados en archivo local, sin base de datos.
5. Separar la capa simulada para poder reemplazarla por Auth/Broker/Administracion sin tocar los controllers principales.

## Pendiente externo

- Restaurante debe confirmar endpoint definitivo para payload logistico de pedido o corregir el 500 de pedidos.
- Broker/Auth/Administracion deben entregar contratos reales de usuarios, roles y repartidores.

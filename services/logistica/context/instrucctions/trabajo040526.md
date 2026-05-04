# Trabajo 04/05/2026 - Preparacion funcional de Logistica

## Objetivo

Dejar el modulo de logistica preparado para trabajar localmente con PostgreSQL, rutas REST activas y datos simulados de repartidores mientras los modulos externos terminan sus integraciones.

## Alcance inmediato

1. Restaurar o recrear el controlador funcional de entregas que hoy falta como `entrega.controller.js`.
2. Montar las rutas de logistica en `src/app.js` bajo `/api/logistica`.
3. Completar rutas faltantes para `feed`, `repartidores`, `categorias` y `notificaciones`.
4. Agregar middleware temporal de autenticacion/desarrollo para que los controllers tengan usuario simulado sin bloquear pruebas locales.
5. Agregar datos semilla de 5 repartidores para simular asignaciones y feed operativo mientras Administracion no esta disponible.
6. Corregir orden de rutas donde pueda haber conflictos con parametros dinamicos.
7. Verificar con PostgreSQL encendido usando `npm test`, `npm run sync` y endpoints basicos.

## Fuera de alcance por ahora

- Integracion real con Administracion.
- Integracion real con Restaurante o Negocios.
- Contrato definitivo del payload externo de pedidos.
- WebSockets productivos.
- Worker de cancelacion automatica.
- JWT real y roles definitivos.

## Criterio de terminado

- El servidor debe poder iniciar sin errores con rutas montadas.
- `/api/logistica/*` debe responder en rutas principales.
- Deben existir repartidores simulados para probar asignaciones.
- La base de datos debe sincronizar modelos y datos iniciales sin romper datos existentes.

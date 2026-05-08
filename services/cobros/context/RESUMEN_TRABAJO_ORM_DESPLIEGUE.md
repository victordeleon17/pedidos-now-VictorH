# Resumen de trabajo realizado - Cobros ORM y despliegue

Fecha: 2026-05-08

## Alcance

Este documento resume el trabajo realizado recientemente sobre el microservicio `services/cobros` del proyecto Pedidos Now.

El objetivo fue estabilizar el modulo de Cobros sobre ORM con Sequelize, completar migraciones y seeders, agregar reglas financieras nuevas, crear endpoints faltantes y dejar el servicio mas preparado para un despliegue MVP/demo.

Durante este trabajo se decidio ignorar por ahora `services/cobros/src/models/` y usar como fuente de verdad ORM unicamente:

- `services/cobros/models/`
- `services/cobros/migrations/`
- `services/cobros/seeders/`
- `services/cobros/config/config.js`

## Contexto inicial

El modulo de Cobros venia de una etapa hibrida:

- Version inicial basada en SQL manual y `mysql2`.
- Transicion hacia ORM con Sequelize.
- Base legacy/manual asociada a `cobros.sql`.
- Base ORM objetivo llamada `payments_orm_db`.

Antes del trabajo, existian rutas, controladores y servicios basicos, pero faltaban migraciones completas. Varias migraciones ya aparecian como ejecutadas en `SequelizeMeta`, aunque estaban vacias cuando se ejecutaron originalmente. Eso provocaba errores como tablas inexistentes en la base ORM.

## Decisiones tomadas

### Fuente de verdad ORM

Se confirmo que por ahora se ignora `src/models/` y se trabaja solo con `models/`.

Esto evita mezclar dos estructuras de modelos y reduce ambiguedad durante la estabilizacion.

### Base de datos objetivo

La base ORM objetivo queda como:

```text
payments_orm_db
```

`config/config.js` ahora usa ese nombre por defecto si `DB_NAME` no esta definido.

### Metodos de pago

Se definieron cuatro metodos de pago base:

- `CASH`
- `CARD_CREDIT`
- `CARD_DEBIT`
- `COUPON`

`CARD_CREDIT` y `CARD_DEBIT` comparten comportamiento financiero, pero el banco debe poder distinguirlos. Por eso se agrego soporte para guardar `card_type`.

### Comportamiento de `COUPON`

Se definio que `COUPON`:

- No significa pedido 100% cubierto.
- No se combina con pago parcial.
- Existe como descuento aplicado.
- Requiere `coupon_discount` mayor a cero.
- Requiere `courier_id`.
- Debe mantener `total_amount` mayor a cero.
- Genera ganancia para el repartidor.
- Crea movimiento en wallet.

### Tarifas y recargos

Se agregaron reglas financieras nuevas:

- Tarifa por peso: Q1 por libra hasta un maximo de Q90.
- Recargo por clima o trafico: se aplica tomando como base la tarifa por peso cuando viene `apply_weather_surcharge` o `apply_traffic_surcharge`.
- Seguro: se implemento como 1.5% de `insurance_value`.
- Envio prioritario: 10% del precio calculado antes de prioridad.

Nota: la frase original fue "seguro de 1.5 del valor". Se implemento como 1.5%, porque usar 1.5x seria un recargo extremadamente alto. Si el equipo confirma que debe ser 1.5x, se debe ajustar la formula.

## Migraciones trabajadas

Se completaron migraciones que antes estaban vacias o incompletas.

### Migraciones completadas

Se agrego definicion real a estas migraciones:

- `migrations/20260508144810-create-payment-statuses.js`
- `migrations/20260508144819-create-orders-snapshot.js`
- `migrations/20260508144844-create-order-items-snapshot.js`
- `migrations/20260508145031-create-payments.js`
- `migrations/20260508145035-create-payment-attempts.js`
- `migrations/20260508145039-create-courier-wallets.js`
- `migrations/20260508145043-create-courier-transactions.js`

Estas migraciones ahora crean las tablas necesarias para el runtime ORM:

- `payment_statuses`
- `orders_snapshot`
- `order_items_snapshot`
- `payments`
- `payment_attempts`
- `courier_wallets`
- `courier_transactions`

### Migracion de reparacion

Se agrego:

```text
migrations/20260508152000-repair-missing-orm-tables.js
```

Motivo: las migraciones anteriores ya estaban marcadas como `up` en la base, pero no habian creado tablas porque originalmente estaban vacias.

La migracion de reparacion revisa si faltan tablas y las crea sin hacer reset destructivo ni borrar datos.

### Migracion de tarifas y tarjeta

Se agrego:

```text
migrations/20260508161000-add-fees-and-card-type-to-payments.js
```

Agrega campos nuevos a `orders_snapshot` y `payments`:

- `weight_fee`
- `weather_traffic_fee`
- `insurance_fee`
- `priority_fee`

Y agrega a `payments`:

- `card_type`

La migracion es defensiva: valida si las columnas existen antes de agregarlas.

## Seeders trabajados

### Metodos de pago

Se actualizo:

```text
seeders/20260507170119-seed-payment-methods.js
```

Ahora inserta o actualiza de forma idempotente:

- `CASH`
- `CARD_CREDIT`
- `CARD_DEBIT`
- `COUPON`

Se uso `ON DUPLICATE KEY UPDATE` para evitar errores por duplicados.

### Estados de pago

Se agrego:

```text
seeders/20260508150100-seed-payment-statuses.js
```

Estados sembrados:

- `PENDING`
- `PROCESSING`
- `APPROVED`
- `DENIED`
- `CANCELLED`
- `PARTIALLY_REFUNDED`
- `REFUNDED`

Estos estados pertenecen al estado del pago. Se mantienen separados de `settlement_status`, que representa liquidacion o deuda.

## Modelos ORM modificados

### `models/orderSnapshot.model.js`

Se agregaron campos financieros nuevos:

- `weight_fee`
- `weather_traffic_fee`
- `insurance_fee`
- `priority_fee`

### `models/payment.model.js`

Se agregaron:

- `card_type`
- `weight_fee`
- `weather_traffic_fee`
- `insurance_fee`
- `priority_fee`

Estos campos permiten persistir la informacion calculada durante el cobro.

## Servicios modificados

### `src/services/payments.service.js`

Se hicieron cambios importantes:

#### Calculo financiero

`calculateTotals` ahora calcula:

- subtotal
- descuentos por item
- descuentos de producto
- descuento por cupon
- total de descuentos
- service fee
- tarifa por peso
- recargo por clima/trafico
- seguro
- envio prioritario
- propina
- total final

#### Creacion de pago

`createPayment` ahora:

- Guarda los nuevos campos financieros en `OrderSnapshot`.
- Guarda los nuevos campos financieros en `Payment`.
- Guarda `card_type` para pagos con tarjeta.
- Valida que `COUPON` mantenga `total_amount` mayor a cero.
- Crea movimiento `COUPON_EARNING` cuando el metodo es `COUPON`.

#### Cancelacion

Se agrego funcion:

```js
cancelPayment(paymentId, payload)
```

Comportamiento:

- Busca el pago.
- Valida que pueda cancelarse.
- Cambia estado a `CANCELLED`.
- Actualiza el snapshot asociado.
- Registra ajuste de wallet.
- Si era pago en efectivo, liquida/cierra deuda pendiente relacionada.

#### Reembolso

Se agrego funcion:

```js
refundPayment(paymentId, payload)
```

Comportamiento:

- Busca el pago.
- Valida que pueda reembolsarse.
- Valida que el monto no supere el saldo reembolsable.
- Cambia estado a `PARTIALLY_REFUNDED` o `REFUNDED`.
- Actualiza `total_refunded`.
- Crea intento de pago mock para registrar el reembolso.
- Ajusta wallet proporcionalmente.
- Si era pago en efectivo, reduce la deuda pendiente relacionada.

#### Ajustes de wallet

Se agrego logica auxiliar para aplicar ajustes financieros en wallet durante cancelaciones y reembolsos.

### `src/services/wallet.service.js`

Se cambio `getWalletSummary`.

Antes:

- Si la wallet no existia, lanzaba error.

Ahora:

- Si la wallet no existe, devuelve saldos en cero y lista vacia de transacciones.

Esto permite que otros servicios consulten wallet de repartidores aunque aun no tengan pagos.

## Controladores modificados

### `src/controllers/payments.controller.js`

Se conectaron validadores nuevos y se agregaron controladores para:

- `cancel`
- `refund`

Tambien se mantiene:

- `calculate`
- `create`
- `getById`
- `list`

### `src/controllers/wallet.controller.js`

Se conectaron los validadores existentes para:

- resumen de wallet
- pago de deuda pendiente

## Rutas modificadas

### `src/routes/payments.routes.js`

Se agregaron endpoints:

```http
PATCH /api/payments/:paymentId/cancel
POST /api/payments/:paymentId/refund
```

Rutas finales de payments:

```http
POST /api/payments/calculate
POST /api/payments
PATCH /api/payments/:paymentId/cancel
POST /api/payments/:paymentId/refund
GET /api/payments/:paymentId
GET /api/payments
```

## Validadores modificados

### `src/validators/payments.validator.js`

Se agregaron validaciones para:

- campos numericos no negativos
- `coupon_discount` cuando `payment_method_code = COUPON`
- `card_type` cuando el metodo es tarjeta
- `courier_id` obligatorio para todos los pagos
- body de cancelacion
- body de reembolso

## Configuracion y app

### `config/config.js`

Se agrego `payments_orm_db` como base por defecto para:

- development
- test
- production

### `src/app.js`

Se agrego:
- CORS configurable mediante `CORS_ORIGIN`.
- Limite de JSON configurable mediante `JSON_BODY_LIMIT`.
- Logging opcional de requests con `LOG_REQUESTS=true`.
- Middleware `notFound`.
- Middleware `errorHandler`.

Se cambio `console.log` por `console.info` para mensajes operativos.

## Despliegue

### `.env.example`

Se agrego archivo:

```text
.env.example
```

Variables incluidas:

- `NODE_ENV`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `CORS_ORIGIN`
- `JSON_BODY_LIMIT`
- `LOG_REQUESTS`
- URLs futuras para integraciones con banca, contabilidad, negocios, paqueteria y repartidores.

### Scripts de despliegue

Se actualizaron scripts en `package.json`:

```json
"deploy:migrate": "npm run orm:migrate && npm run orm:seed",
"deploy:start": "npm run deploy:migrate && npm start"
```

Decision tomada: para MVP/demo se eligio correr migraciones y seeders antes del arranque usando `deploy:start`.

Para produccion real, lo ideal mas adelante seria ejecutar migraciones como job separado antes de levantar nuevas replicas.

### Docker

Se agregaron:

- `Dockerfile`
- `.dockerignore`

El `Dockerfile` instala dependencias y ejecuta:

```bash
npm run deploy:start
```

Nota: se usa `npm ci` sin `--omit=dev` porque `sequelize-cli` esta en `devDependencies` y se necesita para ejecutar migraciones dentro del contenedor.

### Documentacion de despliegue

Se agrego:

```text
DEPLOYMENT.md
```

Incluye:

- Comando recomendado para despliegue MVP.
- Variables requeridas.
- Opciones gratuitas de despliegue.

## Archivos agregados

Se agregaron estos archivos:

- `context/RESUMEN_TRABAJO_ORM_DESPLIEGUE.md`
- `.env.example`
- `Dockerfile`
- `.dockerignore`
- `DEPLOYMENT.md`
- `migrations/20260508152000-repair-missing-orm-tables.js`
- `migrations/20260508161000-add-fees-and-card-type-to-payments.js`
- `seeders/20260508150100-seed-payment-statuses.js`

## Archivos modificados

Se modificaron estos archivos principales:

- `config/config.js`
- `package.json`
- `models/orderSnapshot.model.js`
- `models/payment.model.js`
- `src/app.js`
- `src/controllers/payments.controller.js`
- `src/controllers/wallet.controller.js`
- `src/routes/payments.routes.js`
- `src/services/payments.service.js`
- `src/services/wallet.service.js`
- `src/validators/payments.validator.js`
- varias migraciones existentes que antes estaban vacias
- `seeders/20260507170119-seed-payment-methods.js`

## Archivos eliminados

No se eliminaron archivos durante este trabajo.

## Verificaciones realizadas

Se ejecutaron verificaciones tecnicas y smoke tests.

### Migraciones y seeders

Comandos ejecutados:

```bash
npm run orm:migrate
npm run orm:seed
npm run deploy:migrate
```

Resultado:

- Migraciones ejecutadas correctamente.
- Seeders ejecutados correctamente.
- `deploy:migrate` funciona y es idempotente.

### Validacion de conexion Sequelize

Se valido conexion Sequelize correctamente.

### Tablas confirmadas

Se confirmo que existen tablas principales:

- `courier_transactions`
- `courier_wallets`
- `order_items_snapshot`
- `orders_snapshot`
- `payment_attempts`
- `payment_methods`
- `payment_statuses`
- `payments`
- `sequelizemeta`

### Seeders confirmados

Se confirmo:

- `payment_methods = 4`
- `payment_statuses = 7`

### Smoke tests ejecutados

Se probaron flujos internos usando servicios directamente:

- Pago con tarjeta y reembolso parcial.
- Pago en efectivo, deuda en wallet y pago pendiente.
- Consulta de wallet sin pagos.
- Pago con `COUPON` y movimiento `COUPON_EARNING`.

### Checks de sintaxis

Se ejecutaron checks con `node --check` sobre archivos clave.

## Estado actual del microservicio

El microservicio queda listo para un despliegue MVP/demo si se cumple lo siguiente:

- Existe una base MySQL accesible.
- La base objetivo es `payments_orm_db` o se configura `DB_NAME`.
- Se configura `.env` a partir de `.env.example`.
- Se ejecuta `npm run deploy:migrate` antes de iniciar o `npm run deploy:start` directamente.
- Se acepta que banco, contabilidad y otros servicios aun esten en modo contrato/mock.

## Pendientes importantes

Antes de considerar un despliegue estable o produccion real, falta:

- Probar endpoints por HTTP real con el servidor levantado.
- Validar `docker build`.
- Actualizar README y coleccion Postman con endpoints y campos nuevos.
- Definir autenticacion/autorizacion entre servicios.
- Definir contratos finales con Paqueteria, Repartidores, Banco, Administracion, Restaurantes y Broker.
- Integrar banco real cuando el equipo correspondiente tenga contrato listo.
- Agregar tests automatizados.
- Mejorar manejo de errores HTTP por tipo.
- Definir si el seguro es 1.5% o 1.5x.
- Decidir si las migraciones deben ejecutarse como job separado en despliegues no-demo.

## Opciones de despliegue sin pagar

Opciones recomendadas para demo:

- Docker local con MySQL local.
- Render free tier para API si se dispone de MySQL accesible.
- Koyeb free tier para API.
- Railway solo si hay creditos disponibles.
- Fly.io si la cuenta mantiene allowance gratuito.

Para demo academica, la opcion mas controlable es Docker local. Para exponerlo a otros equipos sin pagar, Render o Koyeb pueden funcionar para la API, pero se necesita resolver una base MySQL accesible.

## Conclusion

El modulo de Cobros paso de estar en una migracion ORM incompleta a tener una base ORM operativa, seeders idempotentes, reglas financieras nuevas, endpoints de cancelacion y reembolso, soporte de wallet mas flexible y preparacion inicial para despliegue.

Lo trabajado deja el servicio en condiciones razonables para un MVP/demo, pero todavia no reemplaza una preparacion de produccion real con seguridad, banco real, contratos interservicio cerrados y pruebas automatizadas.

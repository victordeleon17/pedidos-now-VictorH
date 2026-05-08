# Analisis del proyecto Pedidos Now

Fecha de analisis: 2026-05-08

## Alcance revisado

Este documento resume el estado del repositorio `pedidos-now` completo y profundiza en los servicios con implementacion real encontrada durante el recorrido del proyecto.

El repositorio esta planteado como un monorepo academico basado en microservicios. La documentacion raiz define una arquitectura `UI -> Broker -> Servicios`, con servicios Node.js, persistencia en MySQL y capas internas tipo MVC por servicio.

## Estructura general del repositorio

```text
pedidos-now/
├── apps/
├── broker/
├── docs/
├── infra/
├── services/
└── README.md
```

## Carpetas de nivel raiz

### `README.md`

Describe el objetivo general de Pedidos Now: conectar clientes, restaurantes o negocios, repartidores y soporte al cliente. Tambien define la arquitectura esperada, los servicios planeados, las UIs planeadas y reglas de colaboracion con Git y PRs.

### `apps/`

Contiene carpetas planificadas para interfaces front-end:

- `ui-clientes/`
- `ui-repartidores/`
- `ui-negocios/`
- `ui-agentes-soporte/`

Estado actual: solo contienen `.gitignore`; no hay implementacion React todavia.

### `broker/`

Carpeta prevista para el broker o gateway mediador entre UIs y microservicios.

Estado actual: solo contiene `.gitignore`; no hay implementacion de gateway todavia.

### `docs/`

Contiene `enunciado-general/Proyecto final Arquitectura de Sistemas II secciones A, D y E.pdf`.

Estado actual: documentacion academica de referencia. No se encontro codigo ejecutable en esta carpeta.

### `infra/`

Contiene infraestructura compartida.

Archivo revisado: `infra/mysql/docker-compose.yml`.

Define un contenedor MySQL 8.0.45 en el puerto host `3307`, con volumen persistente `mysql_data`. El archivo tiene variables vacias para `MYSQL_ROOT_PASSWORD`, `MYSQL_USER` y `MYSQL_PASSWORD`; requiere configuracion antes de usarse de forma segura.

### `services/`

Servicios planificados:

- `admin-contabilidad/`: solo `.gitignore`.
- `bancario/`: solo `.gitignore`.
- `chats/`: solo `.gitignore`.
- `cobros/`: implementacion activa.
- `descuentos/`: solo `.gitignore`.
- `negocios/`: solo `.gitignore`.
- `paqueteria/`: solo `.gitignore`.
- `restaurantes/`: implementacion activa.
- `soporte-automatizado/`: solo `.gitignore`.

## Servicio `services/cobros`

### Proposito

Microservicio de cobros y billetera virtual de repartidores. Registra pagos, calcula totales financieros, genera snapshots de pedidos e impacta saldos de repartidores segun el metodo de pago.

### Stack y dependencias

Archivo: `services/cobros/package.json`.

- Node.js con CommonJS.
- Express 5.
- Sequelize 6.
- MySQL via `mysql2`.
- `dotenv` para variables de entorno.
- `cors` para CORS.
- `nodemon` y `sequelize-cli` como herramientas de desarrollo.

Scripts disponibles:

- `npm run dev`: ejecuta `nodemon src/app.js`.
- `npm start`: ejecuta `node src/app.js`.
- `npm run orm:migrate`: ejecuta migraciones Sequelize.
- `npm run orm:seed`: ejecuta seeders Sequelize.
- `npm test`: placeholder que falla intencionalmente porque no hay tests automatizados.

### Configuracion

Archivo: `services/cobros/config/config.js`.

Lee `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST` y `DB_PORT` desde `.env`. Usa dialecto MySQL y desactiva logging. La misma estructura se usa para `development`, `test` y `production`.

Nota: existe un `.env` local en `services/cobros`, pero no se documento su contenido para evitar exponer secretos o configuraciones privadas.

### Entrada de la aplicacion

Archivo: `services/cobros/src/app.js`.

Configura Express con CORS y JSON. Monta las rutas bajo `/api`:

- `health.routes`
- `payments.routes`
- `wallet.routes`

Escucha en `PORT` o `3005` por defecto.

### Conexion a base de datos

Archivo: `services/cobros/src/db.js`.

Exporta `sequelize` desde `../models`, es decir, usa el arbol de modelos de `services/cobros/models/`, no el de `services/cobros/src/models/`.

### Rutas expuestas

Archivos:

- `src/routes/health.routes.js`
- `src/routes/payments.routes.js`
- `src/routes/wallet.routes.js`

Endpoints reales:

- `GET /api/health`: valida conexion a DB con `sequelize.authenticate()`.
- `POST /api/payments/calculate`: calcula totales sin persistir.
- `POST /api/payments`: crea un pago, snapshot, intento y movimientos de wallet.
- `GET /api/payments/:paymentId`: obtiene un pago con metodo, estado, intentos y snapshot.
- `GET /api/payments`: lista pagos con filtros.
- `GET /api/wallet/summary`: obtiene saldos y transacciones de repartidor.
- `POST /api/wallet/pay-pending`: liquida una deuda de efectivo por `transactionId` u `orderId`.

### Controladores

Archivos:

- `src/controllers/payments.controller.js`
- `src/controllers/wallet.controller.js`

Los controladores son delgados: delegan en servicios, responden `{ ok: true, result }` en exito y `{ ok: false, error }` en error. Los errores se devuelven como `400` salvo el caso `Payment not found`, que devuelve `404`.

### Logica de pagos

Archivo: `src/services/payments.service.js`.

Responsabilidades principales:

- Calcular subtotales, descuentos, tarifa de servicio, propina y total.
- Validar idempotencia por `idempotency_key`.
- Buscar metodo de pago por `payment_method_code`.
- Buscar estado `APPROVED` en `payment_statuses`.
- Crear `OrderSnapshot` y `OrderItemSnapshot`.
- Crear `Payment` y `PaymentAttempt`.
- Crear o reutilizar `CourierWallet`.
- Registrar `CourierTransaction` segun metodo de pago.

Flujo para tarjeta:

1. Calcula total del pedido.
2. Crea snapshot financiero.
3. Crea pago aprobado.
4. Crea intento mock exitoso.
5. Aumenta `available_balance` y `total_earned` del repartidor por `courier_earned_fee`.
6. Registra transaccion `CARD_EARNING` tipo `CREDIT`.

Flujo para efectivo:

1. Calcula total del pedido.
2. Crea snapshot financiero.
3. Crea pago aprobado con `settlement_status = PENDING`.
4. Define vencimiento a 24 horas.
5. Incrementa `pending_debt_balance` por el total del pedido.
6. Ajusta `current_balance` como saldo disponible menos deuda.
7. Registra transaccion `CASH_DEBT` tipo `DEBIT` con `can_pay_pending = true`.

### Logica de billetera

Archivo: `src/services/wallet.service.js`.

Responsabilidades principales:

- Obtener resumen financiero de un repartidor.
- Calcular estado de morosidad simple.
- Filtrar transacciones por rango de fechas.
- Liquidar deuda pendiente de efectivo.

Estados de morosidad actuales:

- `NONE`: sin deuda o sin wallet.
- `GRACE_PERIOD_WARNING`: existe deuda pendiente.
- `BLOCKED_CRITICAL_DEBT`: wallet con `account_status = BLOCKED`.

Flujo `payPending`:

1. Requiere `courierId` y `transactionId` u `orderId`.
2. Busca una transaccion `CASH_DEBT` pendiente.
3. Marca la transaccion original como `SETTLED`.
4. Actualiza el pago relacionado como `SETTLED`.
5. Reduce `pending_debt_balance`.
6. Aumenta `available_balance` y `total_earned` con la ganancia del repartidor.
7. Crea una nueva transaccion `CASH_SETTLEMENT` tipo `CREDIT`.

### Modelos activos de Sequelize

Carpeta usada por runtime: `services/cobros/models/`.

El cargador `models/index.js` lee todos los archivos `*.model.js`, inicializa Sequelize con `config/config.js` y ejecuta asociaciones.

Modelos activos:

- `PaymentMethod`: catalogo de metodos (`payment_methods`).
- `PaymentStatus`: catalogo de estados (`payment_statuses`).
- `OrderSnapshot`: snapshot financiero del pedido (`orders_snapshot`).
- `OrderItemSnapshot`: items del snapshot (`order_items_snapshot`).
- `Payment`: pago registrado (`payments`).
- `PaymentAttempt`: intentos de pago (`payment_attempts`).
- `CourierWallet`: saldo acumulado del repartidor (`courier_wallets`).
- `CourierTransaction`: movimientos de wallet (`courier_transactions`).

Relaciones principales:

- `Payment` pertenece a `OrderSnapshot`, `PaymentMethod` y `PaymentStatus`.
- `Payment` tiene muchos `PaymentAttempt` y `CourierTransaction`.
- `OrderSnapshot` tiene muchos `OrderItemSnapshot` y un `Payment`.
- `OrderSnapshot` pertenece a `PaymentStatus`.
- `OrderItemSnapshot` pertenece a `OrderSnapshot`.
- `CourierTransaction` pertenece a `Payment`.

### Modelos no conectados al runtime

Carpeta: `services/cobros/src/models/`.

Existe un segundo arbol de modelos exportado desde `src/models/index.js`, incluyendo entidades adicionales como coupons, refunds, wallet settlements, withdrawals y adjustments. Sin embargo, la aplicacion actual importa modelos desde `../../models`, no desde `src/models`. Por lo tanto, estos modelos parecen ser una version conceptual o pendiente de integracion.

### Migraciones y seeders

Carpeta: `services/cobros/migrations/`.

Estado encontrado:

- `20260507164704-create-payment-methods.js`: crea realmente `payment_methods`.
- Las migraciones para `payment_statuses`, `orders_snapshot`, `order_items_snapshot`, `payments`, `payment_attempts`, `courier_wallets` y `courier_transactions` estan vacias con plantilla de Sequelize CLI.

Carpeta: `services/cobros/seeders/`.

- `20260507170119-seed-payment-methods.js`: inserta `CASH` y `CARD_CREDIT`.

Riesgo importante: el servicio requiere tablas como `payment_statuses`, `orders_snapshot`, `payments`, `payment_attempts`, `courier_wallets` y `courier_transactions`, pero sus migraciones estan vacias. A menos que la base exista por otro script, `sequelize-cli db:migrate` no dejara la base lista para ejecutar el servicio completo.

### SQL manual

Archivo: `services/cobros/db/cobros.sql`.

Existe un script SQL completo segun el README. No forma parte de los scripts npm actuales; si se usa, debe ejecutarse manualmente o integrarse al flujo de migraciones.

### Validadores y middlewares

Archivos:

- `src/validators/payments.validator.js`
- `src/validators/wallet.validator.js`
- `src/middlewares/error.middleware.js`
- `src/helpers/responses.js`
- `src/helpers/ids.js`

Estado actual: existen validadores, helpers de respuesta y middleware de errores, pero las rutas y controladores actuales no los usan. La validacion efectiva ocurre parcialmente dentro de los servicios mediante errores manuales.

### Documentacion y Postman

Archivos:

- `services/cobros/README.md`
- `services/cobros/README_todos_los_endpoints.md`
- `services/cobros/postman-tests/cobros-api.postman_collection.json`

La documentacion lista los endpoints actuales y cuerpos de ejemplo. El README menciona `.env.example`, pero no se encontro ese archivo en el recorrido de archivos visibles.

## Servicio `services/restaurantes`

### Proposito

Microservicio de gestion de restaurantes, productos, combos y pedidos. Es el otro servicio con implementacion real en el repositorio.

### Stack y dependencias

Archivo: `services/restaurantes/package.json`.

- Node.js con CommonJS.
- Express 4.
- Sequelize 6.
- MySQL via `mysql2`.
- `axios` para integraciones HTTP.
- `dotenv`.
- `jsonwebtoken`.
- `express-validator`.
- `morgan`.

Scripts disponibles:

- `npm run dev`: `nodemon server.js`.
- `npm start`: `node server.js`.
- `npm test`: placeholder que falla intencionalmente.

### Entrada de la aplicacion

Archivos:

- `server.js`
- `src/app.js`

`server.js` prueba conexion a base de datos, sincroniza modelos con `sequelize.sync({ alter: false })` en desarrollo e inicia el servidor.

`src/app.js` configura JSON, URL encoded, Morgan, health check en `/health`, rutas bajo `/api` y middleware central de errores.

### Configuracion

Archivos:

- `src/config/env.js`
- `src/config/database.js`
- `src/config/external-services.js`

Valores por defecto importantes:

- `PORT = 3000`.
- `DB_NAME = restaurantes_db`.
- `DB_USER = root`.
- `JWT_SECRET = default_secret`.
- `AUTH_SERVICE_URL = http://localhost:3001`.
- `BROKER_SERVICE_URL = http://localhost:3002`.
- `DESCUENTOS_SERVICE_URL = http://localhost:3003`.
- `COBROS_SERVICE_URL = http://localhost:3004`.

Observacion: `cobros` usa puerto por defecto `3005`, pero `restaurantes` apunta a `COBROS_SERVICE_URL` por defecto en `3004`. Esto debe alinearse para integracion real.

### Rutas reales montadas

Archivo: `src/routes/index.js`.

Rutas montadas actualmente:

- `/api/restaurantes`
- `/api/productos`

Aunque la documentacion de restaurantes menciona combos, pedidos, descuentos, horarios y precios, no se encontraron esas rutas montadas actualmente en `src/routes/index.js`.

### Controladores activos

Restaurantes: `src/controllers/restaurantes/restaurante.controller.js`.

Endpoints implementados:

- Listar restaurantes con filtros `activo` y `disponible`.
- Obtener restaurante por ID con horarios activos.
- Crear restaurante.
- Actualizar restaurante.
- Inactivar restaurante.
- Cambiar disponibilidad.

Productos: `src/controllers/productos/producto.controller.js`.

Endpoints implementados:

- Listar productos con filtros `activo`, `restaurante_id` y `tipo_producto_id`.
- Obtener producto por ID.
- Crear producto.
- Actualizar producto.
- Inactivar producto.
- Activar/desactivar producto.
- Listar productos por restaurante.

Pedidos: `src/controllers/pedidos/pedido.controller.js`.

Existe un controlador simple, pero no esta montado en rutas. Ademas importa `../models/pedido.model`, ruta que no coincide con la estructura real `src/models/pedidos/pedido.model.js`; este archivo probablemente no funciona en su estado actual.

### Modelos y relaciones

Archivo central: `src/models/index.js`.

Agrupa modelos de:

- Restaurantes: `Restaurante`, `HorarioRestaurante`, `HistorialRestaurante`.
- Productos: `TipoProducto`, `Producto`, `HistorialPreciosProducto`.
- Combos: `TipoCombo`, `Combo`, `ComboProducto`.
- Pedidos: `EstadoPedido`, `Pedido`, `DetallePedido`, `HistorialEstadosPedido`, `CancelacionPedido`.

Relaciones principales:

- Restaurante tiene horarios, historial, productos, combos y pedidos.
- Producto pertenece a restaurante y tipo de producto.
- Producto tiene historial de precios.
- Combo pertenece a restaurante y tipo de combo.
- Combo y Producto tienen relacion muchos a muchos via `ComboProducto`.
- Pedido pertenece a restaurante y estado.
- Pedido tiene detalles, historial de estados y una cancelacion.
- DetallePedido puede referenciar producto o combo.

### Integraciones externas

Archivos:

- `src/services/auth.service.js`
- `src/services/broker.service.js`
- `src/services/descuentos.service.js`
- `src/services/cobros.service.js`

Integraciones previstas:

- Auth: valida token con `/api/auth/validate`.
- Broker: notifica pedidos con `/api/pedidos/notify`.
- Descuentos: consulta promociones y valida descuentos.
- Cobros: aplica multas y procesa cobros.

Observacion: estos servicios existen como clientes HTTP, pero los controladores activos revisados no los integran todavia en flujos reales.

### Documentacion existente

Carpeta: `services/restaurantes/context/`.

Contiene documentacion amplia:

- `PROJECT_CONTEXT.md`
- `PROGRESS.md`
- `EXTERNAL_APIS.md`
- `ENDPOINTS.md`
- `DB_SCHEMA.md`
- `CONTEXTOMODELS.md`

Hay una brecha entre documentacion e implementacion: algunos endpoints documentados no estan montados en rutas reales.

## Flujo de negocio entre servicios

### Flujo esperado segun arquitectura raiz

1. Una UI consume el Broker.
2. El Broker valida, enruta y unifica respuestas.
3. Un microservicio ejecuta logica de negocio.
4. El microservicio persiste en MySQL.
5. La respuesta vuelve al Broker y luego a la UI.

### Flujo real implementado parcialmente

Actualmente no hay broker implementado. Los servicios `restaurantes` y `cobros` pueden ejecutarse como APIs directas.

`restaurantes` tiene clientes HTTP para hablar con `auth`, `broker`, `descuentos` y `cobros`, pero esos servicios no estan todos implementados o integrados en controladores activos.

`cobros` puede funcionar de forma independiente si la base de datos tiene las tablas necesarias y los catalogos requeridos.

### Flujo de cobro recomendado

1. Un pedido externo entrega datos de cliente, negocio, direccion, repartidor, items, metodo de pago e idempotency key.
2. `POST /api/payments/calculate` permite previsualizar totales.
3. `POST /api/payments` registra el cobro aprobado.
4. Si el pago es tarjeta, se acredita la ganancia del repartidor.
5. Si el pago es efectivo, se registra deuda pendiente del repartidor con la app.
6. `GET /api/wallet/summary` permite revisar saldos y transacciones.
7. `POST /api/wallet/pay-pending` liquida deudas de efectivo.

## Hallazgos tecnicos relevantes

### Fortalezas

- La intencion arquitectonica esta clara: monorepo con microservicios por dominio.
- `cobros` mantiene una separacion razonable entre rutas, controladores, servicios y modelos.
- `cobros` usa transacciones Sequelize para operaciones financieras compuestas.
- `cobros` contempla idempotencia por `idempotency_key`.
- `restaurantes` tiene un modelo de dominio amplio y relaciones bien centralizadas.
- Existe documentacion contextual en `restaurantes` y documentacion de endpoints en `cobros`.
- Hay coleccion Postman para probar `cobros`.

### Riesgos y brechas

- La mayoria de servicios y UIs estan vacios o solo con `.gitignore`.
- No hay broker implementado, aunque la arquitectura depende de el.
- No hay tests automatizados; ambos `npm test` fallan por placeholder.
- `cobros` tiene migraciones vacias para la mayoria de tablas necesarias.
- `cobros` requiere `PaymentStatus` con codigo `APPROVED`, pero no hay seeder revisado que lo inserte.
- `cobros` tiene validadores y middleware de errores que no estan conectados a rutas.
- `cobros` tiene dos arboles de modelos; el runtime usa `models/`, mientras `src/models/` parece no usarse.
- `restaurantes` documenta endpoints no montados actualmente.
- `restaurantes` apunta a Cobros en puerto `3004`, mientras Cobros arranca en `3005` por defecto.
- `restaurantes/src/controllers/pedidos/pedido.controller.js` parece tener imports inconsistentes y no esta montado.
- `infra/mysql/docker-compose.yml` tiene credenciales vacias y requiere configuracion.

## Recomendaciones de siguiente paso

1. Completar migraciones de `cobros` o integrar formalmente `db/cobros.sql` al flujo de setup.
2. Agregar seeder de `payment_statuses` con al menos `APPROVED`.
3. Conectar validadores de `cobros` a rutas/controladores antes de ejecutar logica de negocio.
4. Alinear `COBROS_SERVICE_URL` en `restaurantes` con el puerto real de `cobros`.
5. Decidir si `services/cobros/src/models/` se elimina, se integra o queda como documentacion tecnica para evitar confusion.
6. Montar o retirar de documentacion los endpoints de `restaurantes` que todavia no existen.
7. Crear tests minimos para health, calculo de pagos, creacion de pago tarjeta, creacion de pago efectivo y liquidacion de deuda.
8. Implementar el Broker o ajustar temporalmente la documentacion para reflejar consumo directo entre servicios.

## Resumen ejecutivo

El proyecto esta en una etapa inicial/intermedia. La estructura de monorepo y los dominios estan bien definidos, pero solo `cobros` y `restaurantes` tienen codigo funcional relevante. `cobros` es el servicio mas cercano a un flujo completo de negocio financiero, aunque depende de completar base de datos, seeders y validacion. `restaurantes` tiene modelos y CRUDs basicos para restaurantes/productos, pero varias capacidades documentadas aun no estan expuestas por rutas reales. El resto de servicios, broker y UIs estan planificados pero no implementados.

# Resumen Actual del Proyecto - Módulo de Cobros

## Alcance del documento

Este documento resume **únicamente el estado actual del módulo de Cobros** del proyecto **Pedidos Now**.  
No describe el proyecto completo ni el estado final de todos los microservicios.  
El enfoque aquí es:

- acuerdos funcionales relacionados con Cobros
- dependencias con otros microservicios
- qué información Cobros debe enviar y recibir
- estado actual de la base de datos
- estado actual de la API
- problemas detectados y errores actuales
- siguiente ruta de trabajo

---

# 1. Contexto general del módulo

El módulo **Cobros** es el microservicio encargado de administrar la lógica financiera asociada al cobro de pedidos dentro del proyecto.

Actualmente el módulo se ha trabajado bajo dos enfoques:

1. **Versión inicial con SQL manual + mysql2**
2. **Versión en transición hacia ORM con Sequelize**

Esto significa que el módulo ya tiene una lógica funcional base, pero actualmente se encuentra en una fase de migración técnica para formalizar el acceso a la base de datos mediante ORM.

---

# 2. Responsabilidad actual del módulo de Cobros

El módulo de Cobros se encarga de:

- calcular el total financiero de un pedido
- registrar un cobro
- consultar un cobro
- listar cobros por filtros
- manejar la billetera virtual del repartidor
- registrar deuda pendiente cuando el cobro es en efectivo
- permitir el pago de deuda pendiente del repartidor

A nivel funcional, la lógica principal que se ha venido trabajando es:

## Pago con tarjeta
- el cobro se registra como aprobado
- la ganancia del repartidor se acredita a la billetera
- se registra una transacción financiera tipo `CARD_EARNING`

## Pago en efectivo
- el cobro se registra como aprobado
- el repartidor queda con deuda pendiente hacia la plataforma
- se registra una transacción financiera tipo `CASH_DEBT`
- esa deuda puede liquidarse posteriormente

---

# 3. Acuerdos funcionales ya trabajados

## 3.1 Acuerdo con Negocios
Se ha trabajado el criterio de que Cobros debe manejar un **snapshot financiero del pedido** dentro de su propia base de datos.

Eso significa que Cobros guarda localmente información financiera del pedido, sin depender totalmente de consultas en tiempo real a otros servicios.

Ese snapshot contempla al menos:

- pedido
- items del pedido
- subtotal
- descuentos
- tarifa de servicio
- propina
- total
- método de pago final

## 3.2 Acuerdo con Administración y Contabilidad
Se definió que Cobros necesita validar o consumir información administrativa/contable relacionada con:

- cuentas origen
- cuentas destino
- cuenta del repartidor
- movimientos contables
- compensaciones
- reembolsos
- reglas financieras o reportes posteriores

Actualmente este acuerdo está entendido a nivel funcional, pero todavía no está completamente integrado en código entre servicios.

## 3.3 Acuerdo con Sistema Bancario
Se ha definido que Cobros depende del sistema bancario para la validación financiera real de una transacción.

En términos funcionales:

- Cobros prepara la operación financiera
- Banco valida y confirma la transacción
- Cobros registra el resultado final del cobro

Actualmente esta integración todavía no está cerrada de forma real; en la práctica, la lógica sigue en modo **mock** o simulada en varias partes.

---

# 4. Qué debe recibir Cobros de otros servicios

## 4.1 De Negocios
Cobros necesita o puede necesitar:

- `order_id`
- `reservation_id`
- datos del pedido
- items del pedido
- subtotal
- descuentos
- total final
- método de pago final
- estado del pedido
- confirmación de si el pedido fue entregado, cancelado o ajustado

## 4.2 De Administración y Contabilidad
Cobros necesita o puede necesitar:

- cuentas origen y destino válidas
- referencia de cuenta del repartidor
- movimientos contables
- reglas para compensaciones
- datos para reembolsos
- reglas de liquidación o bloqueo financiero

## 4.3 De Sistema Bancario
Cobros necesita o puede necesitar:

- confirmación de aprobación o rechazo
- `bankTransactionId`
- código de respuesta
- mensaje de respuesta
- referencia externa
- fecha y hora de la operación

## 4.4 De Broker
Cobros necesita que Broker exponga o enrute correctamente las llamadas del frontend hacia sus endpoints, pero Broker no sustituye la comunicación lógica entre microservicios.  
Broker sirve como puerta de entrada del tráfico del frontend, no como reemplazo del contrato funcional entre servicios backend.

---

# 5. Qué debe enviar Cobros a otros servicios

## 5.1 A Sistema Bancario
Cobros debe enviar o podría enviar:

- `paymentId`
- `orderId`
- `reservationId`
- `courierId` si aplica
- monto
- moneda
- método de pago
- referencia de cuenta o token bancario
- `idempotencyKey`
- descripción de la operación

## 5.2 A Administración y Contabilidad
Cobros debe enviar o podría enviar:

- movimientos financieros del cobro
- reembolsos
- compensaciones
- deuda pendiente del repartidor
- liquidaciones realizadas
- historial financiero útil para reportes

## 5.3 A Negocios
Cobros debe enviar o podría enviar:

- confirmación de cobro
- estado del cobro
- referencia del pago
- si el cobro fue aprobado o rechazado
- estado de liquidación si aplica

---

# 6. Identificadores que actualmente usa Cobros

Actualmente el módulo ha trabajado con estos identificadores:

- `payment_id`
- `order_id`
- `reservation_id`
- `orderSnapshotId`

Actualmente **no se ha definido como identificador activo del módulo**:

- `case_reference`

---

# 7. Estados de cobro manejados actualmente

Actualmente el módulo ha venido manejando estos estados o estados contemplados en base de datos:

- `PENDING`
- `PROCESSING`
- `APPROVED`
- `DENIED`
- `CANCELLED`
- `PARTIALLY_REFUNDED`
- `REFUNDED`
- `SETTLEMENT_PENDING`
- `SETTLED`
- `OVERDUE`
- `BLOCKED`

No todos están completamente expuestos mediante endpoint REST, pero sí han sido contemplados en la lógica y/o en la base de datos.

---

# 8. Endpoints actuales del módulo de Cobros

Actualmente el módulo ha trabajado estos endpoints:

## Health
- `GET /api/health`

## Payments
- `POST /api/payments/calculate`
- `POST /api/payments`
- `GET /api/payments/:paymentId`
- `GET /api/payments`

Filtros que se han venido usando:
- `reservationId`
- `orderSnapshotId`
- `orderId`
- `courierId`

## Wallet
- `GET /api/wallet/summary`
- `POST /api/wallet/pay-pending`

---

# 9. Lo que sí existe y lo que todavía no existe

## Sí existe actualmente
- cálculo de total
- creación de cobro
- consulta de cobro por ID
- listado de cobros por filtros
- resumen de billetera
- pago pendiente de deuda del repartidor
- colección de Postman
- estructura de README y documentación
- base de datos inicial funcional
- transición inicial a ORM

## No existe todavía como endpoint completo confirmado
- endpoint REST formal para cancelar un cobro
- endpoint REST formal para marcar un cobro como revertido
- integración bancaria real cerrada
- integración completa con Administración y Contabilidad
- integración final real con Negocios

---

# 10. Estado actual de la base de datos

## 10.1 Base de datos inicial
La primera base trabajada fue la versión basada en script SQL, levantada con `cobros.sql`.  
Esa base ya contemplaba el módulo funcional de Cobros y fue usada para la versión inicial del proyecto con `mysql2`.

## 10.2 Migración a inglés y UUID
Posteriormente se trabajó una versión adaptada con:

- nombres en inglés
- uso de UUID en vez de BIGINT
- mejor alineación con estilo de microservicios

## 10.3 Snapshot financiero
Se acordó mantener dentro de Cobros un snapshot financiero del pedido, con tablas específicas para pedido y items.

## 10.4 Estado actual con ORM
Actualmente existe una base nueva para ORM:

- `payments_orm_db`

Esta base se creó para evitar conflictos con la base anterior trabajada mediante script SQL manual.

---

# 11. Problemas detectados en la base de datos y ORM

Actualmente los principales problemas detectados han sido los siguientes:

## 11.1 Mezcla entre SQL manual y ORM
Se trabajó inicialmente con una base creada por `cobros.sql` y luego se intentó sembrar información equivalente con Sequelize.

Eso provocó conflictos de duplicidad, principalmente en tablas como:

- `payment_methods`

## 11.2 Seeders duplicados
Se presentó error de `Validation error` al correr seeders porque la tabla ya tenía registros únicos como:

- `CASH`
- `CARD_CREDIT`

## 11.3 Tablas faltantes en la base ORM
Después de levantar el servidor con Sequelize, la API falló porque la base `payments_orm_db` no tenía todavía todas las tablas requeridas.

Errores observados:
- `Table 'payments_orm_db.payments' doesn't exist`
- `Table 'payments_orm_db.courier_wallets' doesn't exist`

## 11.4 Estado actual del ORM
El proyecto ya tiene configurado Sequelize y parte de los modelos ORM, pero la migración no está terminada.

Eso significa que:
- el servidor puede levantar
- las rutas existen
- pero algunas operaciones fallan porque faltan migraciones o tablas reales en la base ORM

---

# 12. Modelos ORM que ya se comenzaron a trabajar

Actualmente ya se ha trabajado al menos de forma parcial con estos modelos Sequelize:

- `paymentMethod.model.js`
- `paymentStatus.model.js`
- `orderSnapshot.model.js`
- `orderItemSnapshot.model.js`
- `payment.model.js`
- `paymentAttempt.model.js`
- `courierWallet.model.js`
- `courierTransaction.model.js`
- `coupon.model.js`
- `paymentDiscountApplied.model.js`

También ya existe:
- `models/index.js`
- `config/config.js`

---

# 13. Problemas técnicos que se presentaron durante el proceso

## 13.1 Error de conexión sin contraseña
Sequelize intentó conectarse con:
- `root@localhost`
- sin contraseña

Eso se corrigió revisando `.env` y `config/config.js`.

## 13.2 Error por repetir `sequelize-cli init`
Se intentó volver a correr `npx sequelize-cli init` después de que la estructura ya existía.

Eso generó el mensaje:
- `config/config.js already exists`

Ese error no era grave; solo indicaba que la estructura base ya había sido creada.

## 13.3 Error de `Cannot GET /`
Se observó `Cannot GET /` al abrir la raíz del servidor en navegador.

Eso no era un error del proyecto, solo significaba que no existe ruta `/`, sino rutas `/api/...`.

## 13.4 Error de tablas inexistentes
Actualmente el problema técnico más importante es que faltan migraciones completas para que la base ORM tenga todas las tablas necesarias.

---

# 14. Estado actual del código

Actualmente el proyecto está en una fase híbrida:

## Parte funcional ya existente
- estructura de Express
- controladores
- rutas
- helpers
- documentación
- colección Postman
- lógica inicial de payments y wallet

## Parte en migración
- acceso a datos por Sequelize
- migraciones
- seeders
- asociaciones completas
- adaptación de services a ORM real

---

# 15. Qué hace falta para continuar correctamente

Para que el módulo de Cobros funcione completamente sobre ORM, todavía hace falta:

## 15.1 Completar migraciones
Se deben crear y ejecutar correctamente las migraciones de tablas como:

- `payment_statuses`
- `orders_snapshot`
- `order_items_snapshot`
- `payments`
- `payment_attempts`
- `courier_wallets`
- `courier_transactions`

## 15.2 Completar seeders
Se deben dejar funcionales los seeders base, al menos para:

- `payment_methods`
- `payment_statuses`

## 15.3 Ajustar services
Los archivos que más impacto tienen en la migración ORM son:

- `src/services/payments.service.js`
- `src/services/wallet.service.js`

## 15.4 Evitar mezclar dos fuentes de verdad
Se debe evitar seguir mezclando al mismo tiempo:

- `cobros.sql`
- migraciones + seeders

Lo correcto es separar claramente:
- base legacy/manual
- base ORM nueva

---

# 16. Recomendación de trabajo actual

La forma más segura de continuar es:

## Base legacy/manual
- `payments_db`
- usada para la versión vieja con `mysql2`

## Base ORM
- `payments_orm_db`
- usada únicamente para migraciones, seeders y Sequelize

Esto permite:
- no romper la versión anterior inmediatamente
- seguir construyendo la nueva versión ORM de forma ordenada

---

# 17. Resumen ejecutivo

## Estado funcional
El módulo de Cobros ya tiene definida su lógica principal y sus endpoints base.

## Estado técnico
La API está en migración hacia ORM con Sequelize.

## Estado de integración
Las integraciones con otros microservicios están entendidas a nivel funcional, pero todavía no están cerradas de forma real y completa.

## Estado de base de datos
Existe una base funcional inicial y una base nueva para ORM.  
Actualmente el principal problema técnico es que la base ORM todavía no tiene todas las tablas necesarias creadas y sincronizadas.

## Estado del alcance
**Solo se está trabajando el módulo de Cobros.**  
No se está resolviendo en este momento el proyecto completo ni todos los microservicios de la plataforma.

---

# 18. Conclusión

El módulo de Cobros ya cuenta con:

- definición funcional clara
- lógica principal identificada
- endpoints base
- base de datos inicial trabajada
- documentación
- colección Postman
- estructura base ORM iniciada

Sin embargo, todavía se encuentra en una etapa intermedia de consolidación técnica, especialmente en:

- migraciones ORM
- seeders
- tablas faltantes
- ajuste total de services con Sequelize
- integración real con otros microservicios

El trabajo actual debe centrarse en completar correctamente la base ORM y estabilizar la capa de datos del módulo antes de seguir con integraciones mayores.

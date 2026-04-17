# Cobros Service - Documentación Completa de Endpoints

## Descripción
Este documento contiene **todos los endpoints** disponibles actualmente en el microservicio **Cobros**.

---

## Base URL
```text
http://localhost:3005/api
```

---

# 1. Health

## 1.1 Verificar estado del servicio
**GET** `/api/health`

### Descripción
Comprueba que el servicio esté corriendo y que la base de datos responda correctamente.

### Respuesta esperada
```json
{
  "ok": true,
  "service": "cobros",
  "db": "ok"
}
```

---

# 2. Payments

## 2.1 Calcular total del pedido
**POST** `/api/payments/calculate`

### Descripción
Calcula subtotal, descuentos, tarifa de servicio, propina y total final sin registrar el cobro.

### Body
```json
{
  "items": [
    {
      "product_id": "11111111-1111-1111-1111-111111111111",
      "product_name": "Hamburguesa",
      "quantity": 2,
      "unit_price": 40,
      "item_discount": 0,
      "is_combo": false
    },
    {
      "product_id": "22222222-2222-2222-2222-222222222222",
      "product_name": "Papas",
      "quantity": 1,
      "unit_price": 15,
      "item_discount": 0,
      "is_combo": false
    }
  ],
  "product_discounts": 0,
  "coupon_discount": 0,
  "service_fee": 5,
  "tip_amount": 10
}
```

### Respuesta esperada
```json
{
  "ok": true,
  "result": {
    "subtotal": 95,
    "items_discount_total": 0,
    "product_discounts": 0,
    "coupon_discount": 0,
    "total_discounts": 0,
    "service_fee": 5,
    "tip_amount": 10,
    "total_amount": 110
  }
}
```

---

## 2.2 Crear cobro
**POST** `/api/payments`

### Descripción
Crea el cobro, genera el snapshot financiero y registra el impacto financiero sobre la billetera del repartidor.

### Body de ejemplo (CARD)
```json
{
  "customer_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "courier_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "business_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "delivery_address_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "reservation_id": "RES-10001",
  "currency_code": "GTQ",
  "payment_method_code": "CARD_CREDIT",
  "product_discounts": 0,
  "coupon_discount": 0,
  "service_fee": 5,
  "courier_earned_fee": 15,
  "approved_extra_fee": 0,
  "tip_amount": 10,
  "items": [
    {
      "product_id": "11111111-1111-1111-1111-111111111111",
      "external_product_id": "PROD-10",
      "product_name": "Hamburguesa",
      "quantity": 2,
      "unit_price": 40,
      "item_discount": 0,
      "is_combo": false
    }
  ],
  "idempotency_key": "idem-card-10001"
}
```

### Body de ejemplo (CASH)
```json
{
  "customer_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "courier_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "business_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "delivery_address_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "reservation_id": "RES-10002",
  "currency_code": "GTQ",
  "payment_method_code": "CASH",
  "product_discounts": 0,
  "coupon_discount": 0,
  "service_fee": 5,
  "courier_earned_fee": 15,
  "approved_extra_fee": 0,
  "tip_amount": 10,
  "items": [
    {
      "product_id": "11111111-1111-1111-1111-111111111111",
      "external_product_id": "PROD-10",
      "product_name": "Hamburguesa",
      "quantity": 2,
      "unit_price": 40,
      "item_discount": 0,
      "is_combo": false
    }
  ],
  "idempotency_key": "idem-cash-10002"
}
```

### Respuesta esperada
```json
{
  "ok": true,
  "result": {
    "payment_id": "uuid-del-pago",
    "order_snapshot_id": "uuid-del-snapshot",
    "reservation_id": "RES-10001",
    "status": "APPROVED",
    "settlement_status": "NOT_APPLICABLE"
  }
}
```

---

## 2.3 Consultar cobro por ID
**GET** `/api/payments/:paymentId`

### Descripción
Retorna el detalle de un pago, incluyendo intentos y estado.

### Ejemplo
```http
GET /api/payments/uuid-del-pago
```

---

## 2.4 Listar cobros
**GET** `/api/payments`

### Descripción
Lista cobros aplicando filtros por query params.

### Filtros soportados
- `reservationId`
- `orderSnapshotId`
- `orderId`
- `courierId`

### Ejemplos
```http
GET /api/payments?reservationId=RES-10001
GET /api/payments?orderSnapshotId=uuid-del-snapshot
GET /api/payments?orderId=ORD-10001
GET /api/payments?courierId=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
```

---

# 3. Wallet

## 3.1 Obtener resumen de billetera
**GET** `/api/wallet/summary`

### Descripción
Devuelve el resumen financiero del repartidor.

### Query params
- `courierId` obligatorio
- `startDate` opcional
- `endDate` opcional

### Ejemplo
```http
GET /api/wallet/summary?courierId=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb&startDate=2026-03-01&endDate=2026-03-31
```

### Respuesta esperada
```json
{
  "ok": true,
  "result": {
    "balances": {
      "positiveBalance": 150.5,
      "appDebt": 85,
      "totalEarned": 1250.75
    },
    "morosityState": "GRACE_PERIOD_WARNING",
    "transactions": [
      {
        "transactionId": "uuid-transaccion",
        "orderId": "RES-10002",
        "date": "2026-03-21T14:30:00.000Z",
        "totalOrderAmount": 100,
        "earnedFee": 15,
        "paymentMethod": "CASH",
        "resultingBalance": -100,
        "isDebtSettled": false,
        "transaction_category": "CASH_DEBT",
        "settlement_status": "PENDING",
        "description": "Cash order debt pending settlement"
      }
    ]
  }
}
```

---

## 3.2 Pagar pendiente por transactionId
**POST** `/api/wallet/pay-pending`

### Descripción
Liquida una deuda pendiente usando el `transactionId`.

### Body
```json
{
  "courierId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "transactionId": "uuid-transaccion"
}
```

### Respuesta esperada
```json
{
  "ok": true,
  "result": {
    "message": "Pago procesado exitosamente. Tu deuda con la app ha sido saldada.",
    "settlementId": "uuid-liquidacion",
    "bankReference": "bank-settlement-123456"
  }
}
```

---

## 3.3 Pagar pendiente por orderId
**POST** `/api/wallet/pay-pending`

### Descripción
Liquida una deuda pendiente usando el `orderId`.

### Body
```json
{
  "courierId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "orderId": "RES-10002"
}
```

### Respuesta esperada
```json
{
  "ok": true,
  "result": {
    "message": "Pago procesado exitosamente. Tu deuda con la app ha sido saldada.",
    "settlementId": "uuid-liquidacion",
    "bankReference": "bank-settlement-123456"
  }
}
```

---

# Resumen general de endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| POST | `/api/payments/calculate` | Calcula total del pedido |
| POST | `/api/payments` | Crea un cobro |
| GET | `/api/payments/:paymentId` | Consulta un cobro específico |
| GET | `/api/payments` | Lista cobros con filtros |
| GET | `/api/wallet/summary` | Resume la billetera del repartidor |
| POST | `/api/wallet/pay-pending` | Liquida deuda pendiente |

---

# Colección Postman

Se recomienda acompañar este documento con la colección exportada:

```text
postman-tests/cobros-api.postman_collection.json
```

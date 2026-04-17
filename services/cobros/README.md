# Cobros Service

Microservicio encargado de la **gestión de cobros**, cálculo de totales, registro de pagos y **billetera virtual del repartidor** dentro del proyecto **Pedidos Now**.

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start

📁 Estructura del Proyecto
src/
├── controllers/        # Controladores de payments y wallet
├── helpers/            # Funciones auxiliares (ids, money, responses)
├── middlewares/        # Manejo de errores y middlewares generales
├── models/             # Modelos de acceso a datos
├── routes/             # Definición de endpoints
├── services/           # Lógica de negocio
├── validators/         # Validaciones de requests
├── app.js              # Configuración principal de Express
└── db.js               # Conexión a MySQL

db/
└── cobros.sql          # Script completo de base de datos

postman-tests/
└── cobros-api.postman_collection.json   # Colección de Postman

context/                # Documentación interna del módulo
README.md               # Documentación principal del microservicio
package.json            # Configuración del proyecto Node.js
package-lock.json       # Lock de dependencias
.env.example            # Variables de entorno de ejemplo
.gitignore              # Archivos ignorados por Git

🛠️ Tecnologías
Node.js + Express
MySQL + mysql2
dotenv
Postman para pruebas de endpoints

🌐 Endpoints Principales
/api/health — Verificación del estado del servicio
/api/payments/calculate — Cálculo de total del pedido
/api/payments — Creación de cobros
/api/payments/:paymentId — Consulta de cobro por ID
/api/payments — Listado de cobros con filtros
/api/wallet/summary — Resumen de billetera del repartidor
/api/wallet/pay-pending — Pago de deuda pendiente del repartidor

✅ Flujo Recomendado de Pruebas
GET /api/health
POST /api/payments/calculate
POST /api/payments con CARD_CREDIT
POST /api/payments con CASH
GET /api/payments/:paymentId
GET /api/payments?reservationId=...
GET /api/wallet/summary
POST /api/wallet/pay-pending
GET /api/wallet/summary nuevamente
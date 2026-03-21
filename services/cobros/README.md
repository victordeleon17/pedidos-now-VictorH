# Cobros Service

Microservicio encargado de la **gestión de cobros/pagos**, cálculo de totales, registro de intentos, reembolsos y control financiero (snapshot) para Pedidos Now.

## Inicio Rápido

### 1) Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start

📁 Estructura del Proyecto

src/
├─ config/          # Configuraciones (DB, env, servicios externos)
├─ models/          # Modelos ORM (si aplica)
├─ controllers/     # Lógica de endpoints (req/res)
├─ routes/          # Definición de endpoints
├─ services/        # Lógica de negocio y consumo de APIs externas (Banco/Admin/etc.)
├─ middlewares/     # Auth, validación, errores
├─ helpers/         # Funciones auxiliares
└─ app.js           # Configuración de Express

context/            # Documentación para equipo / acuerdos
db/                 # Scripts SQL del servicio
postman-tests/      # Colección y/o pruebas de Postman
tests/              # Pruebas (si aplica)
server.js           # Entry point del servicio
syncDatabase.js     # Utilidad de sincronización/seed DB (si aplica)


const env = require('./env');

module.exports = {
  COBROS_SERVICE_URL: process.env.COBROS_SERVICE_URL || 'http://localhost:3005',
  SISTEMA_BANCARIO_URL: process.env.SISTEMA_BANCARIO_URL || 'http://localhost:3006',
  BROKER_URL: process.env.BROKER_URL || 'http://localhost:5000',
  
  endpoints: {
    cobros: {
      getCobros: '/api/cobros',
      getCobrosEnRango: '/api/cobros',
      getMultas: '/api/multas',
      procesarCobro: '/api/cobros'
    },
    bancario: {
      transferencia: '/api/transferencias',
      consultarSaldo: '/api/cuentas',
      obtenerCuenta: '/api/cuentas'
    },
    broker: {
      validate: '/api/auth/validate'
    }
  }
};
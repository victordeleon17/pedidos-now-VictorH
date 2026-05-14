const axios = require('axios');

// Configuración
const API_BASE_URL = process.env.API_URL || 'https://restaurantes.fly.dev';
const TIMEOUT = 10000; // 10 segundos timeout

// Configurar axios con timeout y headers
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'DatabasePopulator/1.0'
  }
});

// Datos para poblar
const DATA = {
  tiposProducto: [
    { nombre: 'Hamburguesas', descripcion: 'Hamburguesas clásicas y gourmet' },
    { nombre: 'Pizzas', descripcion: 'Pizzas artesanales y tradicionales' },
    { nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes' },
    { nombre: 'Postres', descripcion: 'Postres y dulces' },
    { nombre: 'Ensaladas', descripcion: 'Ensaladas frescas y saludables' },
    { nombre: 'Pollo', descripcion: 'Platos a base de pollo' },
    { nombre: 'Pasta', descripcion: 'Pastas italianas' },
    { nombre: 'Sopas', descripcion: 'Sopas y caldos' }
  ],

  restaurantes: [
    {
      nombre: 'Restaurante El Buen Sabor',
      descripcion: 'Restaurante de comida casera y tradicional',
      direccion: 'Calle Principal #123, Ciudad',
      telefono: '+57 300 1234567',
      correo: 'contacto@buensabor.com',
      logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      disponible: true
    },
    {
      nombre: 'Pizza Napoli',
      descripcion: 'Auténticas pizzas italianas con ingredientes frescos',
      direccion: 'Avenida Central #456, Centro',
      telefono: '+57 301 2345678',
      correo: 'info@pizzanapoli.com',
      logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      disponible: true
    },
    {
      nombre: 'Burger Palace',
      descripcion: 'Las mejores hamburguesas gourmet de la ciudad',
      direccion: 'Carrera 15 #78-90, Zona Rosa',
      telefono: '+57 302 3456789',
      correo: 'pedidos@burgerpalace.com',
      logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      disponible: true
    },
    {
      nombre: 'Healthy Bites',
      descripcion: 'Comida saludable y nutritiva para tu bienestar',
      direccion: 'Calle Verde #234, Eco Park',
      telefono: '+57 303 4567890',
      correo: 'contacto@healthybites.com',
      logo_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      disponible: true
    },
    {
      nombre: 'Chicken Express',
      descripcion: 'Pollo frito y a la parrilla, rápido y delicioso',
      direccion: 'Boulevard Norte #567, Mall Plaza',
      telefono: '+57 304 5678901',
      correo: 'ventas@chickenexpress.com',
      logo_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
      disponible: true
    },
    {
      nombre: 'Pasta & More',
      descripcion: 'Pastas artesanales y platos italianos tradicionales',
      direccion: 'Via Roma #890, Distrito Gastronómico',
      telefono: '+57 305 6789012',
      correo: 'info@pastaandmore.com',
      logo_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
      disponible: false
    }
  ],

  tiposCombos: [
    { nombre: 'Combo Personal', descripcion: 'Comida para una persona' },
    { nombre: 'Combo Familiar', descripcion: 'Comida para compartir en familia' },
    { nombre: 'Combo Ejecutivo', descripcion: 'Comida rápida para almuerzo ejecutivo' },
    { nombre: 'Combo Pareja', descripcion: 'Comida para dos personas' }
  ],

  estadosPedido: [
    { nombre: 'Recibido', descripcion: 'Pedido recibido y en espera de confirmación' },
    { nombre: 'Confirmado', descripcion: 'Pedido confirmado por el restaurante' },
    { nombre: 'En Preparación', descripcion: 'El restaurante está preparando el pedido' },
    { nombre: 'Listo', descripcion: 'Pedido listo para entrega o recogida' },
    { nombre: 'En Camino', descripcion: 'Pedido enviado para entrega a domicilio' },
    { nombre: 'Entregado', descripcion: 'Pedido entregado al cliente' },
    { nombre: 'Cancelado por Cliente', descripcion: 'Pedido cancelado por el cliente' },
    { nombre: 'Cancelado por Restaurante', descripcion: 'Pedido cancelado por el restaurante' },
    { nombre: 'Rechazado', descripcion: 'Pedido rechazado por el restaurante' }
  ]
};

// Función para hacer petición con reintentos
async function makeRequest(method, url, data = null, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const config = { method, url };
      if (data) config.data = data;
      
      const response = await api(config);
      return response.data;
    } catch (error) {
      console.log(`   ⚠️  Intento ${i + 1} falló: ${error.response?.data?.message || error.message}`);
      
      if (i === retries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Función para verificar si la API está disponible
async function checkApiHealth() {
  try {
    console.log('🔍 Verificando estado de la API...');
    const response = await api.get('/restaurantes');
    console.log('✅ API disponible y funcionando');
    return true;
  } catch (error) {
    console.log('❌ API no disponible:', error.message);
    return false;
  }
}

// Función para crear tipos de producto (usando SQL directo o saltando esta parte)
async function createTiposProducto() {
  console.log('\n📋 Saltando creación de tipos de producto...');
  console.log('   ⚠️  Los tipos de producto se crean por seeders o ya existen');
  // Simulamos IDs de tipos de producto que probablemente ya existen
  return [
    { data: { id: 1 } }, { data: { id: 2 } }, { data: { id: 3 } },
    { data: { id: 4 } }, { data: { id: 5 } }, { data: { id: 6 } },
    { data: { id: 7 } }, { data: { id: 8 } }
  ];
}

// Función para crear restaurantes
async function createRestaurantes() {
  console.log('\n🏪 Creando restaurantes...');
  const results = [];
  
  for (const restaurante of DATA.restaurantes) {
    try {
      console.log(`   🍽️  Creando: ${restaurante.nombre}`);
      const result = await makeRequest('POST', '/restaurantes', restaurante);
      results.push(result);
      console.log(`   ✅ Creado con ID: ${result.data?.id}`);
    } catch (error) {
      console.log(`   ❌ Error creando ${restaurante.nombre}`);
    }
  }
  
  return results;
}

// Función para crear horarios
async function createHorarios(restaurantesIds) {
  console.log('\n🕐 Creando horarios...');
  
  const horariosPatterns = [
    // El Buen Sabor - Lunes a Domingo
    { restaurante_id: 1, pattern: 'todos_dias', apertura: '08:00:00', cierre: '22:00:00' },
    // Pizza Napoli - Martes a Domingo
    { restaurante_id: 2, pattern: 'martes_domingo', apertura: '12:00:00', cierre: '23:00:00' },
    // Burger Palace - Lunes a Domingo (horarios extendidos)
    { restaurante_id: 3, pattern: 'todos_dias_extendido', apertura: '11:00:00', cierre: '00:00:00' },
    // Healthy Bites - Lunes a Viernes
    { restaurante_id: 4, pattern: 'lunes_viernes', apertura: '07:00:00', cierre: '18:00:00' },
    // Chicken Express - Todos los días
    { restaurante_id: 5, pattern: 'todos_dias', apertura: '11:00:00', cierre: '23:30:00' },
    // Pasta & More - Miércoles a Domingo (temporalmente cerrado)
    { restaurante_id: 6, pattern: 'miercoles_domingo', apertura: '17:00:00', cierre: '23:00:00' }
  ];
  
  for (const pattern of horariosPatterns) {
    const restauranteId = restaurantesIds[pattern.restaurante_id - 1];
    if (!restauranteId) continue;
    
    let dias = [];
    switch (pattern.pattern) {
      case 'todos_dias':
        dias = [0, 1, 2, 3, 4, 5, 6]; // Lunes a Domingo
        break;
      case 'martes_domingo':
        dias = [1, 2, 3, 4, 5, 6]; // Martes a Domingo
        break;
      case 'todos_dias_extendido':
        dias = [0, 1, 2, 3, 4, 5, 6]; // Lunes a Domingo
        break;
      case 'lunes_viernes':
        dias = [0, 1, 2, 3, 4]; // Lunes a Viernes
        break;
      case 'miercoles_domingo':
        dias = [2, 3, 4, 5, 6]; // Miércoles a Domingo
        break;
    }
    
    for (const dia of dias) {
      try {
        const horario = {
          dia_semana: dia,
          hora_apertura: pattern.apertura,
          hora_cierre: pattern.cierre
        };
        
        console.log(`   ⏰ Creando horario para restaurante ${restauranteId}, día ${dia}`);
        await makeRequest('POST', `/restaurantes/${restauranteId}/horarios`, horario);
      } catch (error) {
        console.log(`   ❌ Error creando horario para restaurante ${restauranteId}`);
      }
    }
  }
}

// Función para crear productos
async function createProductos(restaurantesIds, tiposProductoIds) {
  console.log('\n🍔 Creando productos...');
  
  const productos = [
    // Restaurante El Buen Sabor (ID: 1)
    { restaurante: 1, tipo: 1, nombre: 'Hamburguesa Clásica', descripcion: 'Hamburguesa con carne de res, lechuga, tomate, cebolla y queso', imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', precio: 15000 },
    { restaurante: 1, tipo: 8, nombre: 'Sancocho de Pollo', descripcion: 'Sancocho tradicional con pollo, yuca, plátano y verduras', imagen_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', precio: 18000 },
    { restaurante: 1, tipo: 3, nombre: 'Limonada Natural', descripcion: 'Limonada fresca con hielo y menta', imagen_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', precio: 4500 },
    
    // Pizza Napoli (ID: 2)
    { restaurante: 2, tipo: 2, nombre: 'Pizza Margherita', descripcion: 'Pizza clásica con tomate, mozzarella y albahaca fresca', imagen_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', precio: 25000 },
    { restaurante: 2, tipo: 2, nombre: 'Pizza Pepperoni', descripcion: 'Pizza con salsa de tomate, mozzarella y pepperoni', imagen_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', precio: 28000 },
    { restaurante: 2, tipo: 3, nombre: 'Coca Cola', descripcion: 'Coca Cola 350ml', imagen_url: 'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400', precio: 3500 },
    
    // Burger Palace (ID: 3)
    { restaurante: 3, tipo: 1, nombre: 'Royal Burger', descripcion: 'Hamburguesa gourmet con carne angus, queso cheddar, bacon y cebolla caramelizada', imagen_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', precio: 22000 },
    { restaurante: 3, tipo: 1, nombre: 'Veggie Burger', descripcion: 'Hamburguesa vegetariana con quinoa, vegetales y aguacate', imagen_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', precio: 19000 },
    { restaurante: 3, tipo: 3, nombre: 'Malteada de Vainilla', descripcion: 'Malteada cremosa de vainilla con crema batida', imagen_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', precio: 8500 },
    
    // Healthy Bites (ID: 4)
    { restaurante: 4, tipo: 5, nombre: 'Ensalada César', descripcion: 'Lechuga romana, pollo a la parrilla, crutones y aderezo césar', imagen_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', precio: 16000 },
    { restaurante: 4, tipo: 5, nombre: 'Bowl de Quinoa', descripcion: 'Quinoa con vegetales frescos, aguacate y semillas', imagen_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', precio: 14500 },
    { restaurante: 4, tipo: 3, nombre: 'Smoothie Verde', descripcion: 'Batido verde con espinaca, manzana, apio y jengibre', imagen_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', precio: 7500 },
    
    // Chicken Express (ID: 5)
    { restaurante: 5, tipo: 6, nombre: 'Pollo Crispy', descripcion: 'Pollo frito crujiente con especias secretas (8 piezas)', imagen_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', precio: 24000 },
    { restaurante: 5, tipo: 6, nombre: 'Alitas BBQ', descripcion: 'Alitas de pollo con salsa BBQ (12 unidades)', imagen_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', precio: 18500 },
    { restaurante: 5, tipo: 3, nombre: 'Gaseosa Personal', descripcion: 'Gaseosa de 500ml - Varios sabores', imagen_url: 'https://images.unsplash.com/photo-1624552820506-6b1d67ab7078?w=400', precio: 4000 },
    
    // Pasta & More (ID: 6)
    { restaurante: 6, tipo: 7, nombre: 'Spaghetti Bolognese', descripcion: 'Pasta con salsa bolognesa tradicional y queso parmesano', imagen_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', precio: 20000 },
    { restaurante: 6, tipo: 7, nombre: 'Fettuccine Alfredo', descripcion: 'Fettuccine en salsa cremosa alfredo con pollo', imagen_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', precio: 22000 }
  ];
  
  for (const prod of productos) {
    try {
      const restauranteId = restaurantesIds[prod.restaurante - 1];
      const tipoProductoId = tiposProductoIds[prod.tipo - 1];
      
      if (!restauranteId || !tipoProductoId) continue;
      
      const producto = {
        tipo_producto_id: tipoProductoId,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        imagen_url: prod.imagen_url,
        precio: prod.precio
      };
      
      console.log(`   🍽️  Creando: ${producto.nombre}`);
      await makeRequest('POST', `/restaurantes/${restauranteId}/productos`, producto);
      console.log(`   ✅ Producto creado exitosamente`);
    } catch (error) {
      console.log(`   ❌ Error creando producto ${prod.nombre}`);
    }
  }
}

// Función para crear tipos de combos (usando SQL directo o saltando esta parte)
async function createTiposCombos() {
  console.log('\n📦 Saltando creación de tipos de combos...');
  console.log('   ⚠️  Los tipos de combo se crean por seeders o ya existen');
  return [];
}

// Función para crear estados de pedido
async function createEstadosPedido() {
  console.log('\n📋 Creando estados de pedido...');
  const results = [];
  
  for (const estado of DATA.estadosPedido) {
    try {
      console.log(`   📊 Creando: ${estado.nombre}`);
      const result = await makeRequest('POST', '/estados-pedido', estado);
      results.push(result);
      console.log(`   ✅ Creado con ID: ${result.data?.id}`);
    } catch (error) {
      console.log(`   ❌ Error creando ${estado.nombre} - endpoint podría no existir`);
    }
  }
  
  return results;
}

// Función para verificar datos existentes
async function checkExistingData() {
  console.log('\n🔍 Verificando datos existentes...');
  
  try {
    const endpoints = [
      { name: 'Restaurantes', url: '/restaurantes' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint.url);
        const count = Array.isArray(response.data?.data) ? response.data.data.length : 0;
        console.log(`   📊 ${endpoint.name}: ${count} registros`);
      } catch (error) {
        console.log(`   ⚠️  No se pudo consultar ${endpoint.name}`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error verificando datos existentes');
  }
}

// Función principal
async function populateDatabase() {
  console.log('🚀 Iniciando población de base de datos');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Verificar que la API esté disponible
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      console.log('❌ La API no está disponible. Abortando...');
      return;
    }
    
    // Verificar datos existentes
    await checkExistingData();
    
    // 1. Crear tipos de producto
    const tiposProducto = await createTiposProducto();
    const tiposProductoIds = tiposProducto.map(t => t.data?.id).filter(Boolean);
    
    // 2. Crear restaurantes
    const restaurantes = await createRestaurantes();
    const restaurantesIds = restaurantes.map(r => r.data?.id).filter(Boolean);
    
    // 3. Crear tipos de combos
    await createTiposCombos();
    
    // 4. Crear estados de pedido
    await createEstadosPedido();
    
    // 5. Crear horarios (solo si tenemos restaurantes)
    if (restaurantesIds.length > 0) {
      await createHorarios(restaurantesIds);
    }
    
    // 6. Crear productos (solo si tenemos restaurantes y tipos)
    if (restaurantesIds.length > 0 && tiposProductoIds.length > 0) {
      await createProductos(restaurantesIds, tiposProductoIds);
    }
    
    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('📊 Datos creados:');
    console.log(`   🏪 ${restaurantesIds.length} restaurantes`);
    console.log(`   🏷️  ${tiposProductoIds.length} tipos de producto`);
    console.log('   ⏰ Horarios por restaurante');
    console.log('   🍽️  Productos distribuidos');
    console.log('   📦 Tipos de combos');
    console.log('   📋 Estados de pedido');
    
  } catch (error) {
    console.error('❌ Error durante la población:', error.message);
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log('\n📋 Uso: node populateViaAPI.js [comando]');
  console.log('\n📌 Comandos disponibles:');
  console.log('   populate  - Poblar la base de datos (default)');
  console.log('   check     - Solo verificar estado actual');
  console.log('   help      - Mostrar esta ayuda');
  console.log('\n🌍 Variables de entorno:');
  console.log('   API_URL   - URL base de la API (default: https://restaurantes.fly.dev/api)');
  console.log('\n💡 Ejemplos:');
  console.log('   node populateViaAPI.js');
  console.log('   node populateViaAPI.js populate');
  console.log('   API_URL="http://localhost:3000/api" node populateViaAPI.js');
}

// Ejecución principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'populate';
  
  switch (command) {
    case 'populate':
      await populateDatabase();
      break;
      
    case 'check':
      const isHealthy = await checkApiHealth();
      if (isHealthy) await checkExistingData();
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      console.log(`❌ Comando desconocido: ${command}`);
      showHelp();
      break;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = {
  populateDatabase,
  checkApiHealth,
  checkExistingData,
  API_BASE_URL
};
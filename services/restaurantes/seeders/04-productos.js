'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Productos', [
      // Productos para Restaurante El Buen Sabor (ID: 1)
      {
        restaurante_id: 1,
        tipo_producto_id: 1, // Hamburguesas
        nombre: 'Hamburguesa Clásica',
        descripcion: 'Hamburguesa con carne de res, lechuga, tomate, cebolla y queso',
        imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        precio: 15000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 1,
        tipo_producto_id: 8, // Sopas
        nombre: 'Sancocho de Pollo',
        descripcion: 'Sancocho tradicional con pollo, yuca, plátano y verduras',
        imagen_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        precio: 18000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 1,
        tipo_producto_id: 3, // Bebidas
        nombre: 'Limonada Natural',
        descripcion: 'Limonada fresca con hielo y menta',
        imagen_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400',
        precio: 4500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Productos para Pizza Napoli (ID: 2)
      {
        restaurante_id: 2,
        tipo_producto_id: 2, // Pizzas
        nombre: 'Pizza Margherita',
        descripcion: 'Pizza clásica con tomate, mozzarella y albahaca fresca',
        imagen_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        precio: 25000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 2,
        tipo_producto_id: 2, // Pizzas
        nombre: 'Pizza Pepperoni',
        descripcion: 'Pizza con salsa de tomate, mozzarella y pepperoni',
        imagen_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        precio: 28000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 2,
        tipo_producto_id: 3, // Bebidas
        nombre: 'Coca Cola',
        descripcion: 'Coca Cola 350ml',
        imagen_url: 'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=400',
        precio: 3500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Productos para Burger Palace (ID: 3)
      {
        restaurante_id: 3,
        tipo_producto_id: 1, // Hamburguesas
        nombre: 'Royal Burger',
        descripcion: 'Hamburguesa gourmet con carne angus, queso cheddar, bacon y cebolla caramelizada',
        imagen_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
        precio: 22000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 3,
        tipo_producto_id: 1, // Hamburguesas
        nombre: 'Veggie Burger',
        descripcion: 'Hamburguesa vegetariana con quinoa, vegetales y aguacate',
        imagen_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
        precio: 19000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 3,
        tipo_producto_id: 3, // Bebidas
        nombre: 'Malteada de Vainilla',
        descripcion: 'Malteada cremosa de vainilla con crema batida',
        imagen_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        precio: 8500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Productos para Healthy Bites (ID: 4)
      {
        restaurante_id: 4,
        tipo_producto_id: 5, // Ensaladas
        nombre: 'Ensalada César',
        descripcion: 'Lechuga romana, pollo a la parrilla, crutones y aderezo césar',
        imagen_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        precio: 16000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 4,
        tipo_producto_id: 5, // Ensaladas
        nombre: 'Bowl de Quinoa',
        descripcion: 'Quinoa con vegetales frescos, aguacate y semillas',
        imagen_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        precio: 14500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 4,
        tipo_producto_id: 3, // Bebidas
        nombre: 'Smoothie Verde',
        descripcion: 'Batido verde con espinaca, manzana, apio y jengibre',
        imagen_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
        precio: 7500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Productos para Chicken Express (ID: 5)
      {
        restaurante_id: 5,
        tipo_producto_id: 6, // Pollo
        nombre: 'Pollo Crispy',
        descripcion: 'Pollo frito crujiente con especias secretas (8 piezas)',
        imagen_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        precio: 24000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 5,
        tipo_producto_id: 6, // Pollo
        nombre: 'Alitas BBQ',
        descripcion: 'Alitas de pollo con salsa BBQ (12 unidades)',
        imagen_url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
        precio: 18500,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 5,
        tipo_producto_id: 3, // Bebidas
        nombre: 'Gaseosa Personal',
        descripcion: 'Gaseosa de 500ml - Varios sabores',
        imagen_url: 'https://images.unsplash.com/photo-1624552820506-6b1d67ab7078?w=400',
        precio: 4000,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Productos para Pasta & More (ID: 6)
      {
        restaurante_id: 6,
        tipo_producto_id: 7, // Pasta
        nombre: 'Spaghetti Bolognese',
        descripcion: 'Pasta con salsa bolognesa tradicional y queso parmesano',
        imagen_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        precio: 20000,
        activo: false, // Inactivo porque el restaurante no está disponible
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        restaurante_id: 6,
        tipo_producto_id: 7, // Pasta
        nombre: 'Fettuccine Alfredo',
        descripcion: 'Fettuccine en salsa cremosa alfredo con pollo',
        imagen_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        precio: 22000,
        activo: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Productos', null, {});
  }
};
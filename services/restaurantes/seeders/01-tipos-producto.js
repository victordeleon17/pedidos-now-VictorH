'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('TiposProducto', [
      {
        nombre: 'Hamburguesas',
        descripcion: 'Hamburguesas clásicas y gourmet',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizzas',
        descripcion: 'Pizzas artesanales y tradicionales',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Bebidas',
        descripcion: 'Bebidas frías y calientes',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Postres',
        descripcion: 'Postres y dulces',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Ensaladas',
        descripcion: 'Ensaladas frescas y saludables',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pollo',
        descripcion: 'Platos a base de pollo',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pasta',
        descripcion: 'Pastas italianas',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sopas',
        descripcion: 'Sopas y caldos',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('TiposProducto', null, {});
  }
};
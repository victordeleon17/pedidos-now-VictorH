'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Restaurantes', [
      {
        nombre: 'Restaurante El Buen Sabor',
        descripcion: 'Restaurante de comida casera y tradicional',
        direccion: 'Calle Principal #123, Ciudad',
        telefono: '+57 300 1234567',
        correo: 'contacto@buensabor.com',
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        disponible: true,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pizza Napoli',
        descripcion: 'Auténticas pizzas italianas con ingredientes frescos',
        direccion: 'Avenida Central #456, Centro',
        telefono: '+57 301 2345678',
        correo: 'info@pizzanapoli.com',
        logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        disponible: true,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Burger Palace',
        descripcion: 'Las mejores hamburguesas gourmet de la ciudad',
        direccion: 'Carrera 15 #78-90, Zona Rosa',
        telefono: '+57 302 3456789',
        correo: 'pedidos@burgerpalace.com',
        logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        disponible: true,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Healthy Bites',
        descripcion: 'Comida saludable y nutritiva para tu bienestar',
        direccion: 'Calle Verde #234, Eco Park',
        telefono: '+57 303 4567890',
        correo: 'contacto@healthybites.com',
        logo_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        disponible: true,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Chicken Express',
        descripcion: 'Pollo frito y a la parrilla, rápido y delicioso',
        direccion: 'Boulevard Norte #567, Mall Plaza',
        telefono: '+57 304 5678901',
        correo: 'ventas@chickenexpress.com',
        logo_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        disponible: true,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pasta & More',
        descripcion: 'Pastas artesanales y platos italianos tradicionales',
        direccion: 'Via Roma #890, Distrito Gastronómico',
        telefono: '+57 305 6789012',
        correo: 'info@pastaandmore.com',
        logo_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        disponible: false,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Restaurantes', null, {});
  }
};
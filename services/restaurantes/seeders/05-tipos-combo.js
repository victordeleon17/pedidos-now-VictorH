'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('TiposCombos', [
      {
        nombre: 'Combo Personal',
        descripcion: 'Comida para una persona',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Combo Familiar',
        descripcion: 'Comida para compartir en familia',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Combo Ejecutivo',
        descripcion: 'Comida rápida para almuerzo ejecutivo',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Combo Pareja',
        descripcion: 'Comida para dos personas',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('TiposCombos', null, {});
  }
};
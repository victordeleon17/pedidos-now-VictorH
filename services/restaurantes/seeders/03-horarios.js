'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const horarios = [];
    
    // Horarios para Restaurante El Buen Sabor (ID: 1) - Lunes a Domingo
    for (let dia = 0; dia <= 6; dia++) {
      horarios.push({
        restaurante_id: 1,
        dia_semana: dia,
        hora_apertura: '08:00:00',
        hora_cierre: '22:00:00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Horarios para Pizza Napoli (ID: 2) - Martes a Domingo (cierra lunes)
    for (let dia = 1; dia <= 6; dia++) {
      horarios.push({
        restaurante_id: 2,
        dia_semana: dia,
        hora_apertura: '12:00:00',
        hora_cierre: '23:00:00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Horarios para Burger Palace (ID: 3) - Lunes a Domingo
    for (let dia = 0; dia <= 6; dia++) {
      const horaInicio = dia === 0 || dia === 6 ? '10:00:00' : '11:00:00'; // Fines de semana abre más temprano
      horarios.push({
        restaurante_id: 3,
        dia_semana: dia,
        hora_apertura: horaInicio,
        hora_cierre: '00:00:00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Horarios para Healthy Bites (ID: 4) - Lunes a Viernes
    for (let dia = 0; dia <= 4; dia++) {
      horarios.push({
        restaurante_id: 4,
        dia_semana: dia,
        hora_apertura: '07:00:00',
        hora_cierre: '18:00:00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Horarios para Chicken Express (ID: 5) - Todos los días
    for (let dia = 0; dia <= 6; dia++) {
      horarios.push({
        restaurante_id: 5,
        dia_semana: dia,
        hora_apertura: '11:00:00',
        hora_cierre: '23:30:00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Horarios para Pasta & More (ID: 6) - Miércoles a Domingo (temporalmente cerrado)
    for (let dia = 2; dia <= 6; dia++) {
      horarios.push({
        restaurante_id: 6,
        dia_semana: dia,
        hora_apertura: '17:00:00',
        hora_cierre: '23:00:00',
        activo: false, // Inactivo porque el restaurante no está disponible
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return queryInterface.bulkInsert('Horarios', horarios, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Horarios', null, {});
  }
};
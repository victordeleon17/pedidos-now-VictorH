// Admin-contabilidad Kenneth

const paqueteriaHandler = require('./paqueteria/paqueteria.handler');

exports.procesarEvento = async (evento) => {
  try {
    switch (evento.modulo) {
      case 'paqueteria':
        await paqueteriaHandler(evento);
        break;

      default:
        console.log(' Evento no manejado:', evento.tipo);
    }
  } catch (error) {
    console.error(' Error procesando evento:', error);
  }
};
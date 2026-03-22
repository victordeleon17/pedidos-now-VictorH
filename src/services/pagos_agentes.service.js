const repository = require('../repositories/pagos_agentes.repository');

const getAll = async () => {
    return await repository.getAll();
};

const obtenerTotalPagos = async () => {
    return await repository.getTotalPagosAgentes();
}

module.exports = {
    getAll, 
    obtenerTotalPagos
}
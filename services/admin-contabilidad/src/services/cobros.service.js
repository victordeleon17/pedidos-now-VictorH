const axios = require('axios');

const obtenerCobros = async (inicio, fin) => {
    try {
        const response = await axios.get(
            `${process.env.COBROS_SERVICE_URL}/api/cobros?inicio=${inicio}&fin=${fin}`
        );
        return response.data;
    } catch (error) {
        console.error('Error obteniendo cobros:', error.message);
        throw error;
    }
};

const obtenerMultas = async (inicio, fin) => {
    try {
        const response = await axios.get(
            `${process.env.COBROS_SERVICE_URL}/api/multas?inicio=${inicio}&fin=${fin}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

module.exports = { obtenerCobros, obtenerMultas };
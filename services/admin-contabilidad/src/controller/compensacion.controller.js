const service = require('../services/compensacion.service');

const crearCompensacion = async (req, res) => {
    try {
        const data = req.body;

        if (!data.monto || data.monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido'
            });
        }

        const result = await service.registrarCompensacion(data);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al procesar compensacion'});
    }
};

module.exports = {
    crearCompensacion
};
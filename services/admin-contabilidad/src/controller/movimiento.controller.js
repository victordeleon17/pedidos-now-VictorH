const service = require('../services/movimiento.service');

const ingresoPedido = async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.pedido_id || !data.monto || !data.monto <= 0) {
            return res.status(400).json({
                error: 'Faltan datos o monto inválido'
            });
        }

        const result = await service.registrarIngresoPedido(data);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:'Error al registrar ingreso'});
    }
};

const egreso = async (req, res) => {
    try {
        const data = req.body;

        const result = await service.registrarEgreso(data);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al registrar egreso'});
    }
};

module.exports = {
    ingresoPedido,
    egreso
}
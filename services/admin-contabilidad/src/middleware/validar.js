const validarMonto = (req, res, next) => {
    const {monto} = req.body;
    if(!monto || typeof monto !== 'number' || monto <= 0){
        return res.status(400).json({
            error: 'Monto inválido'
        });
    }
    next();
};

module.exports = {
    validarMonto
};
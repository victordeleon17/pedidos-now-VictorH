const validarMonto = (req, res, next) => {
    const { monto_total, idempotency_key } = req.body;

    if (!idempotency_key) {
        return res.status(400).json({
            error: 'idempotency_key es requerida'
        });
    }

    if (!monto_total || typeof monto_total !== 'number' || monto_total <= 0) {
        return res.status(400).json({
            error: 'monto_total inválido'
        });
    }

    next();
};
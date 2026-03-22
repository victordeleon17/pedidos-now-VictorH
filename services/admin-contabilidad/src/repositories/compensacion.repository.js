const db = require('../config/db');

const crearCompensacion = async (data) => {
    const [result] = await db.query(
        `INSERT INTO compensacion_entidad
        (entidad_comercial_id, motivo, 
        monto, estado)
        VALUES (?, ?, ?, 'aprobado')`,
        [data.entidad_id, data.motivo, data.monto]
    );
    return result.insertId;
};

module.exports = {
    crearCompensacion
};
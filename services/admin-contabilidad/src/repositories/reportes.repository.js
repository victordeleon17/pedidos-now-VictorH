const db = require('../config/db');

const getPagosPorFecha = async (inicio, fin) => {
    const [rows] = await db.query(
        `SELECT 
            DATE(fecha_pago) as fecha,
            SUM(salario) as total
        FROM pagos_agentes
        WHERE fecha_pago BETWEEN ? AND ?
        GROUP BY DATE(fecha_pago)`,
        [inicio, fin]
    );
    return rows;
};

const getVentas = async (inicio, fin) => {
    let query = `
        SELECT IFNULL(SUM(total),0) AS total_ventas
        FROM pedido_contabilidad
        WHERE estado = 'completado'
    `;

    const params = [];

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN ? AND ?";
        params.push(inicio, fin);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
};

const getPedidos = async (inicio, fin) => {
    let query = `
        SELECT COUNT(*) AS total_pedidos
        FROM pedido_contabilidad
        WHERE 1=1
    `;

    const params = [];

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN ? AND ?";
        params.push(inicio, fin);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
}

const getPropinas = async (inicio, fin) => {
    let query = `
        SELECT IFNULL(SUM(propina), 0) AS total_propinas
        FROM pedido_reparto
    `;

    const params = [];

    if (inicio && fin) {
        query += " WHERE DATE(fecha) BETWEEN ? AND ?";
        params.push(inicio, fin);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
};

const getCostos = async (inicio, fin) => {
    let query = `
        SELECT IFNULL(SUM(monto), 0) AS total_costos
        FROM movimiento_financiero
        WHERE tipo = 'egreso'
    `;

    const params = [];

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN ? AND ?";
        params.push(inicio, fin);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
};

const getVentasPorDia = async (inicio, fin) => {
    const [rows] = await db.query(`
            SELECT DATE(fecha) as fecha, SUM(total) as total
            FROM pedido_contabilidad
            WHERE estado = 'completado'
            AND DATE(fecha) BETWEEN ? AND ?
            GROUP BY DATE(fecha)
        `, [inicio, fin]);
    return rows;
}

const getCrecimientoVentas = async () => {
    const [rows] = await db.query(`
        SELECT
            (SELECT IFNULL(SUM(total),0) 
            FROM pedido_contabilidad 
            WHERE DATE(fecha)=CURDATE()) as hoy,
            (SELECT IFNULL(SUM(total), 0) 
            FROM pedido_contabilidad 
            WHERE DATE(fecha)=CURDATE()-INTERVAL 1 DAY) as ayer
        `);
    return rows[0];
}

//const getChats = async () => {
//    return [
//        {estado: 'resuelto', total: 45},
//        {estado: 'no_resuelto', total: 10},
//        {estado: 'cerrado', total: 5}
//    ]
//}

//const getUsuariosMes = async () => {
//    return [
//        {mes: 'Enero', total: 120},
//        {mes: 'Febrero', total: 200},
//        {mes: 'Marzo', total: 150}
//    ];
//};

const getEstadisticasPorEntidad = async (inicio, fin) => {
    const [rows] = await db.query(
        `SELECT ec.id, ec.nombre_comercial,
        COUNT(DISTINCT pc.id) AS total_pedidos,
        IFNULL(SUM(pc.descuento),0) AS total_descuentos
        FROM entidad_comercial ec
        LEFT JOIN pedido_contabilidad pc
        ON ec.id = pc.entidad_comercial_id
        WHERE (? IS NULL OR DATE(pc.fecha) BETWEEN ? AND ?)
        GROUP BY ec.id, ec.nombre_comercial`,
        [inicio, inicio, fin]       
    );
    return rows;
};

const getReembolsosYCompensaciones = async (inicio, fin) => {
    const [rows] = await db.query(
        `SELECT 'reembolso' as tipo,
        COUNT(*) as total,
        IFNULL(SUM(monto),0) as monto_total
        FROM reembolso_cliente
        WHERE (? IS NULL OR DATE(fecha_solicitud) BETWEEN ? AND ?)
        UNION ALL
        SELECT 'compensacion' as tipo,
        COUNT(*) as total,
        IFNULL(SUM(monto),0) as monto_total
        FROM compensacion_entidad
        WHERE (? IS NULL OR DATE(fecha_generacion) BETWEEN ? AND ?)`,
        [inicio, inicio, fin, inicio, inicio, fin]
    );
    return rows;
};

module.exports = {
    getPagosPorFecha,
    getVentas,
    getPedidos,
    getPropinas,
    getCostos,
    getVentasPorDia,
    getCrecimientoVentas,
    getEstadisticasPorEntidad,
    getReembolsosYCompensaciones
};
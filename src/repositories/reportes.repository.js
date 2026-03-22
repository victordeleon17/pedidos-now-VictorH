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

const getChats = async () => {
    return [
        {estado: 'resuelto', total: 45},
        {estado: 'no_resuelto', total: 10},
        {estado: 'cerrado', total: 5}
    ]
}

const getUsuariosMes = async () => {
    return [
        {mes: 'Enero', total: 120},
        {mes: 'Febrero', total: 200},
        {mes: 'Marzo', total: 150}
    ];
};

module.exports = {
    getPagosPorFecha,
    getVentas,
    getPedidos,
    getPropinas,
    getCostos,
    getVentasPorDia,
    getCrecimientoVentas,
    getChats,
    getUsuariosMes
};
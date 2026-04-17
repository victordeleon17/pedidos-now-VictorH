-- 008_crear_tabla_reporte_generado.sql
-- Registro de reportes financieros generados con sus parámetros y resultado

CREATE TABLE IF NOT EXISTS `reporte_generado` (
  `id`              bigint(20)  NOT NULL AUTO_INCREMENT,
  `tipo_reporte`    enum('ventas','pedidos_atendidos','chats_resueltos','nuevos_usuarios','costos') DEFAULT NULL,
  `periodo_inicio`  date        DEFAULT NULL,
  `periodo_fin`     date        DEFAULT NULL,
  `parametros`      text        DEFAULT NULL,
  `resultado_json`  text        DEFAULT NULL,
  `generado_por`    bigint(20)  DEFAULT NULL,
  `creado_en`       datetime    DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

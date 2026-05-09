-- 004_crear_tabla_periodo_nomina.sql
-- Periodos de nómina quincenales o mensuales

CREATE TABLE IF NOT EXISTS `periodo_nomina` (
  `id`           bigint(20)  NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date        DEFAULT NULL,
  `fecha_fin`    date        DEFAULT NULL,
  `tipo`         enum('quincenal','mensual') DEFAULT NULL,
  `cerrado`      tinyint(1)  DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 011_crear_tabla_estadistica_periodo.sql
-- Estadísticas financieras agregadas por entidad comercial y periodo

CREATE TABLE IF NOT EXISTS `estadistica_periodo` (
  `id`                    bigint(20)    NOT NULL AUTO_INCREMENT,
  `entidad_comercial_id`  bigint(20)    DEFAULT NULL,
  `periodo_inicio`        date          DEFAULT NULL,
  `periodo_fin`           date          DEFAULT NULL,
  `total_transacciones`   int(11)       DEFAULT NULL,
  `ganancias_generadas`   decimal(18,2) DEFAULT NULL,
  `descuentos_aplicados`  decimal(18,2) DEFAULT NULL,
  `propinas_repartidores` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estadistica_entidad` (`entidad_comercial_id`),
  CONSTRAINT `fk_estadistica_entidad_comercial` FOREIGN KEY (`entidad_comercial_id`)
    REFERENCES `entidad_comercial` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

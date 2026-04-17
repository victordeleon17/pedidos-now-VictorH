-- 016_crear_tabla_nomina_detalle.sql
-- Detalle de nómina por empleado y periodo: base, bonificaciones, descuentos y total

CREATE TABLE IF NOT EXISTS `nomina_detalle` (
  `id`             bigint(20)    NOT NULL AUTO_INCREMENT,
  `empleado_id`    bigint(20)    DEFAULT NULL,
  `periodo_id`     bigint(20)    DEFAULT NULL,
  `salario_base`   decimal(18,2) DEFAULT NULL,
  `bonificaciones` decimal(18,2) DEFAULT NULL,
  `descuentos`     decimal(18,2) DEFAULT NULL,
  `total_pagar`    decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_nomina_empleado` (`empleado_id`),
  KEY `idx_nomina_periodo`  (`periodo_id`),
  CONSTRAINT `fk_nomina_empleado`        FOREIGN KEY (`empleado_id`) REFERENCES `empleado`       (`id`),
  CONSTRAINT `fk_nomina_periodo_nomina`  FOREIGN KEY (`periodo_id`)  REFERENCES `periodo_nomina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

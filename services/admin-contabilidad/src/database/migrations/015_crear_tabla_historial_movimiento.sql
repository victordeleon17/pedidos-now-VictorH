-- 015_crear_tabla_historial_movimiento.sql
-- Historial de cambios de estado de cada movimiento financiero

CREATE TABLE IF NOT EXISTS `historial_movimiento` (
  `id`              bigint(20)  NOT NULL AUTO_INCREMENT,
  `movimiento_id`   bigint(20)  DEFAULT NULL,
  `estado`          varchar(50) DEFAULT NULL,
  `fecha`           datetime    DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_historial_movimiento` (`movimiento_id`),
  CONSTRAINT `fk_historial_movimiento_financiero` FOREIGN KEY (`movimiento_id`)
    REFERENCES `movimiento_financiero` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

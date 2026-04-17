-- 017_crear_tabla_pedido_reparto.sql
-- Información de reparto por pedido: repartidor asignado, propina, distancia y tiempo

CREATE TABLE IF NOT EXISTS `pedido_reparto` (
  `id`              bigint(20)    NOT NULL AUTO_INCREMENT,
  `pedido_id`       bigint(20)    DEFAULT NULL,
  `empleado_id`     bigint(20)    DEFAULT NULL,
  `propina`         decimal(18,2) DEFAULT NULL,
  `distancia_km`    decimal(10,2) DEFAULT NULL,
  `tiempo_minutos`  int(11)       DEFAULT NULL,
  `fecha`           datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reparto_pedido`   (`pedido_id`),
  KEY `idx_reparto_empleado` (`empleado_id`),
  CONSTRAINT `fk_reparto_pedido_contabilidad` FOREIGN KEY (`pedido_id`)
    REFERENCES `pedido_contabilidad` (`id`),
  CONSTRAINT `fk_reparto_empleado` FOREIGN KEY (`empleado_id`)
    REFERENCES `empleado` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 006_crear_tabla_auditoria_log.sql
-- Log general de auditoría por usuario, módulo e IP de origen

CREATE TABLE IF NOT EXISTS `auditoria_log` (
  `id`          bigint(20)  NOT NULL AUTO_INCREMENT,
  `usuario_id`  bigint(20)  DEFAULT NULL,
  `modulo`      varchar(50) DEFAULT NULL,
  `accion`      varchar(50) DEFAULT NULL,
  `descripcion` text        DEFAULT NULL,
  `fecha`       datetime    DEFAULT current_timestamp(),
  `ip_origen`   varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

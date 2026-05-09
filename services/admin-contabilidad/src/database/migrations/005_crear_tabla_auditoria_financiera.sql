-- 005_crear_tabla_auditoria_financiera.sql
-- Registro de acciones financieras con monto para auditoría

CREATE TABLE IF NOT EXISTS `auditoria_financiera` (
  `id`          int(11)       NOT NULL AUTO_INCREMENT,
  `accion`      varchar(50)   DEFAULT NULL,
  `descripcion` text          DEFAULT NULL,
  `monto`       decimal(10,2) DEFAULT NULL,
  `fecha`       timestamp     NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

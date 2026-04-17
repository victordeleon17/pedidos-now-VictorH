-- 010_crear_tabla_compensacion_entidad.sql
-- Compensaciones económicas otorgadas a entidades comerciales

CREATE TABLE IF NOT EXISTS `compensacion_entidad` (
  `id`                   bigint(20)    NOT NULL AUTO_INCREMENT,
  `entidad_comercial_id` bigint(20)    DEFAULT NULL,
  `motivo`               varchar(200)  DEFAULT NULL,
  `monto`                decimal(18,2) DEFAULT NULL,
  `estado`               enum('pendiente','aprobado','pagado','rechazado') DEFAULT 'pendiente',
  `fecha_generacion`     datetime      DEFAULT current_timestamp(),
  `fecha_pago`           datetime      DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_compensacion_entidad` (`entidad_comercial_id`),
  CONSTRAINT `fk_compensacion_entidad_comercial` FOREIGN KEY (`entidad_comercial_id`)
    REFERENCES `entidad_comercial` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

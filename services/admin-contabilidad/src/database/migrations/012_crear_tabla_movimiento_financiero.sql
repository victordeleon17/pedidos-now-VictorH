-- 012_crear_tabla_movimiento_financiero.sql
-- Registro central de todos los ingresos y egresos del sistema

CREATE TABLE IF NOT EXISTS `movimiento_financiero` (
  `id`             bigint(20)    NOT NULL AUTO_INCREMENT,
  `cuenta_id`      bigint(20)    NOT NULL,
  `tipo`           enum('ingreso','egreso') NOT NULL,
  `subtipo`        varchar(50)   DEFAULT NULL,
  `modulo_origen`  enum('restaurante','paqueteria','pedido','reembolso','compensacion','nomina') DEFAULT NULL,
  `referencia_id`  bigint(20)    DEFAULT NULL,
  `monto`          decimal(18,2) NOT NULL,
  `descripcion`    text          DEFAULT NULL,
  `creado_por`     bigint(20)    DEFAULT NULL,
  `estado`         enum('pendiente','aprobado','procesado','fallido') DEFAULT 'pendiente',
  `fecha`          datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_movimiento_cuenta` (`cuenta_id`),
  CONSTRAINT `fk_movimiento_cuenta_fondo` FOREIGN KEY (`cuenta_id`)
    REFERENCES `cuenta_fondo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

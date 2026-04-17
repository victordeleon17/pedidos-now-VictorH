-- 018_crear_tabla_pago_nomina.sql
-- Pagos ejecutados de nómina: vincula nomina_detalle con la cuenta de fondo usada

CREATE TABLE IF NOT EXISTS `pago_nomina` (
  `id`                 bigint(20)    NOT NULL AUTO_INCREMENT,
  `nomina_detalle_id`  bigint(20)    DEFAULT NULL,
  `cuenta_fondo_id`    bigint(20)    DEFAULT NULL,
  `monto_pagado`       decimal(18,2) DEFAULT NULL,
  `estado`             enum('pendiente','procesado','fallido') DEFAULT NULL,
  `fecha_pago`         datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pago_nomina_detalle` (`nomina_detalle_id`),
  KEY `idx_pago_cuenta_fondo`   (`cuenta_fondo_id`),
  CONSTRAINT `fk_pago_nomina_detalle`  FOREIGN KEY (`nomina_detalle_id`) REFERENCES `nomina_detalle` (`id`),
  CONSTRAINT `fk_pago_cuenta_fondo`    FOREIGN KEY (`cuenta_fondo_id`)   REFERENCES `cuenta_fondo`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

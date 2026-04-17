-- 013_crear_tabla_pedido_contabilidad.sql
-- Vista contable de cada pedido: subtotal, descuento, comisión y total

CREATE TABLE IF NOT EXISTS `pedido_contabilidad` (
  `id`                   bigint(20)    NOT NULL AUTO_INCREMENT,
  `entidad_comercial_id` bigint(20)    DEFAULT NULL,
  `pedido_id_externo`    bigint(20)    DEFAULT NULL,
  `subtotal`             decimal(18,2) DEFAULT NULL,
  `descuento`            decimal(18,2) DEFAULT NULL,
  `comision`             decimal(18,2) DEFAULT NULL,
  `total`                decimal(18,2) DEFAULT NULL,
  `estado`               enum('completado','cancelado','reembolsado') DEFAULT NULL,
  `fecha`                datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pedido_entidad` (`entidad_comercial_id`),
  CONSTRAINT `fk_pedido_entidad_comercial` FOREIGN KEY (`entidad_comercial_id`)
    REFERENCES `entidad_comercial` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

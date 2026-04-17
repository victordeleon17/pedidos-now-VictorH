-- 014_crear_tabla_reembolso_cliente.sql
-- Solicitudes de reembolso de clientes por pedidos con incidencias

CREATE TABLE IF NOT EXISTS `reembolso_cliente` (
  `id`                bigint(20)    NOT NULL AUTO_INCREMENT,
  `usuario_ref_id`    bigint(20)    DEFAULT NULL,
  `pedido_id_externo` bigint(20)    DEFAULT NULL,
  `motivo`            varchar(200)  DEFAULT NULL,
  `monto`             decimal(18,2) DEFAULT NULL,
  `estado`            enum('pendiente','aprobado','procesado','rechazado') DEFAULT NULL,
  `fecha_solicitud`   datetime      DEFAULT current_timestamp(),
  `fecha_procesado`   datetime      DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reembolso_usuario_ref` (`usuario_ref_id`),
  CONSTRAINT `fk_reembolso_usuario_externo_ref` FOREIGN KEY (`usuario_ref_id`)
    REFERENCES `usuario_externo_ref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

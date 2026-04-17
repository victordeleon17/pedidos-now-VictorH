-- 007_crear_tabla_pagos_agentes.sql
-- Historial de pagos de salario a agentes de soporte

CREATE TABLE IF NOT EXISTS `pagos_agentes` (
  `id`         int(11)       NOT NULL AUTO_INCREMENT,
  `agente_id`  int(11)       NOT NULL,
  `salario`    decimal(10,2) DEFAULT NULL,
  `fecha_pago` datetime      DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

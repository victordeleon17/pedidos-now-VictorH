-- 009_crear_tabla_empleado.sql
-- Empleados internos (repartidores, agentes, admins) vinculados a usuario_externo_ref

CREATE TABLE IF NOT EXISTS `empleado` (
  `id`              bigint(20)    NOT NULL AUTO_INCREMENT,
  `usuario_ref_id`  bigint(20)    DEFAULT NULL,
  `tipo_empleado`   enum('repartidor','agente_servicio_cliente','admin') DEFAULT NULL,
  `salario_base`    decimal(18,2) DEFAULT NULL,
  `activo`          tinyint(1)    DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_empleado_usuario_ref` (`usuario_ref_id`),
  CONSTRAINT `fk_empleado_usuario_ref` FOREIGN KEY (`usuario_ref_id`)
    REFERENCES `usuario_externo_ref` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

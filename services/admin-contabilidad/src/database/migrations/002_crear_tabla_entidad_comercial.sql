-- 002_crear_tabla_entidad_comercial.sql
-- Referencia local de restaurantes, negocios y paqueterías registradas

CREATE TABLE IF NOT EXISTS `entidad_comercial` (
  `id`                  bigint(20)    NOT NULL AUTO_INCREMENT,
  `entidad_id_externo`  bigint(20)    NOT NULL,
  `nombre_comercial`    varchar(150)  DEFAULT NULL,
  `tipo`                enum('restaurante','negocio','paqueteria') NOT NULL,
  `activo`              tinyint(1)    DEFAULT 1,
  `creado_en`           datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_entidad_externo_tipo` (`entidad_id_externo`, `tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

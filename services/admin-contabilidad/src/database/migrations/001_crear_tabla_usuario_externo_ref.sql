-- 001_crear_tabla_usuario_externo_ref.sql
-- Referencia local de usuarios externos gestionados por otros microservicios

CREATE TABLE IF NOT EXISTS `usuario_externo_ref` (
  `id`                bigint(20)    NOT NULL AUTO_INCREMENT,
  `usuario_id_externo` bigint(20)   NOT NULL,
  `nombre`            varchar(150)  DEFAULT NULL,
  `email`             varchar(150)  DEFAULT NULL,
  `tipo_usuario`      enum('cliente','repartidor','negocio','agente','admin') NOT NULL,
  `activo`            tinyint(1)    DEFAULT 1,
  `creado_en`         datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_externo_tipo` (`usuario_id_externo`, `tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 003_crear_tabla_cuenta_fondo.sql
-- Cuentas de fondo internas para gestión de capital operativo

CREATE TABLE IF NOT EXISTS `cuenta_fondo` (
  `id`         bigint(20)    NOT NULL AUTO_INCREMENT,
  `nombre`     varchar(100)  DEFAULT NULL,
  `tipo`       enum('reembolsos','salarios','compensaciones','operativo') DEFAULT NULL,
  `saldo`      decimal(18,2) DEFAULT 0.00,
  `activo`     tinyint(1)    DEFAULT 1,
  `creado_en`  datetime      DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

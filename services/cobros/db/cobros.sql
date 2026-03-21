-- ============================================================
-- PAYMENTS DATABASE (COBROS) - ENGLISH + UUID (CHAR(36))
-- MySQL 8+
-- Snapshot financial orders are kept inside this DB
-- ============================================================

DROP DATABASE IF EXISTS payments_db;

CREATE DATABASE payments_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payments_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1) REFERENCE TABLES
-- ============================================================

CREATE TABLE payment_methods (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code          VARCHAR(20)  NOT NULL UNIQUE,         -- CASH, CARD_CREDIT, CARD_DEBIT, COUPON
  name          VARCHAR(50)  NOT NULL UNIQUE,         -- cash, card_credit, card_debit, coupon (or display names)
  description   VARCHAR(255) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE payment_statuses (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code          VARCHAR(50)  NOT NULL UNIQUE,         -- PENDING, PROCESSING, APPROVED, DENIED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED
  description   VARCHAR(255) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2) COUPONS (LOCAL CATALOG)
-- ============================================================

CREATE TABLE coupons (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code                VARCHAR(50) NOT NULL UNIQUE,
  description         VARCHAR(255) NULL,
  discount_type       ENUM('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL,
  min_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10,2) NULL,
  max_uses            INT UNSIGNED NULL,
  current_uses        INT UNSIGNED NOT NULL DEFAULT 0,
  start_date          DATETIME NOT NULL,
  end_date            DATETIME NOT NULL,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3) FINANCIAL ORDER SNAPSHOT (kept in payments service)
-- ============================================================

CREATE TABLE orders_snapshot (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),

  -- Internal references (UUIDs)
  customer_id           CHAR(36) NOT NULL,
  courier_id            CHAR(36) NULL,
  business_id           CHAR(36) NOT NULL,
  delivery_address_id   CHAR(36) NOT NULL,

  -- External IDs for integration (strings)
  reservation_id        VARCHAR(64) NULL,
  external_business_id  VARCHAR(32) NULL,
  external_customer_id  VARCHAR(32) NULL,
  external_address_id   VARCHAR(32) NULL,

  -- Financial amounts snapshot
  subtotal              DECIMAL(10,2) NOT NULL DEFAULT 0,
  product_discounts     DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_fee           DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount            DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency_code         CHAR(3)       NOT NULL DEFAULT 'GTQ',

  -- Financial status (use payment_statuses for snapshot state)
  status_id             CHAR(36) NOT NULL,

  notes                 TEXT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_orders_snapshot_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_snapshot_reservation_id ON orders_snapshot(reservation_id);
CREATE INDEX idx_orders_snapshot_customer_id ON orders_snapshot(customer_id);
CREATE INDEX idx_orders_snapshot_business_id ON orders_snapshot(business_id);

CREATE TABLE order_items_snapshot (
  id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id          CHAR(36) NOT NULL,

  -- Product reference (UUID internal) + optional external id
  product_id        CHAR(36) NOT NULL,
  external_product_id VARCHAR(32) NULL,

  product_name      VARCHAR(255) NOT NULL,
  quantity          INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price        DECIMAL(10,2) NOT NULL,
  item_discount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  item_subtotal     DECIMAL(10,2) NOT NULL,
  is_combo          TINYINT(1) NOT NULL DEFAULT 0,

  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_items_snapshot_order
    FOREIGN KEY (order_id) REFERENCES orders_snapshot(id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_snapshot_order_id ON order_items_snapshot(order_id);

CREATE TABLE order_status_history (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id     CHAR(36) NOT NULL,
  status_id    CHAR(36) NOT NULL,

  origin       ENUM('SYSTEM','CUSTOMER','COURIER','BUSINESS','ADMIN') NOT NULL DEFAULT 'SYSTEM',
  reason       VARCHAR(255) NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_status_history_order
    FOREIGN KEY (order_id) REFERENCES orders_snapshot(id),
  CONSTRAINT fk_order_status_history_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================
-- 4) PAYMENTS (COBROS)
-- ============================================================

CREATE TABLE payments (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),

  -- Link to snapshot order (1 payment per snapshot order)
  order_snapshot_id CHAR(36) NOT NULL,

  -- Integration IDs (agreement with business service)
  reservation_id    VARCHAR(64) NULL,
  order_id          VARCHAR(64) NULL,         -- order id created/returned in integration
  external_payment_id VARCHAR(64) NULL,       -- payment id returned to other services (optional)

  -- Idempotency
  idempotency_key   VARCHAR(128) NOT NULL UNIQUE,

  -- Method/coupon
  payment_method_id CHAR(36) NOT NULL,
  coupon_id         CHAR(36) NULL,

  -- Amounts
  gross_amount      DECIMAL(10,2) NOT NULL,
  coupon_discount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount        DECIMAL(10,2) NOT NULL,
  service_fee       DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency_code     CHAR(3)       NOT NULL DEFAULT 'GTQ',

  -- Financial status
  status_id         CHAR(36) NOT NULL,

  -- Gateway / bank tracking
  external_reference VARCHAR(255) NULL,
  payment_gateway    VARCHAR(100) NULL,

  -- Cancellation details
  cancelled_by       ENUM('CUSTOMER','COURIER','BUSINESS','SYSTEM') NULL,
  cancellation_reason VARCHAR(255) NULL,

  -- Traceability
  ip_address        VARCHAR(45) NULL,
  request_id        VARCHAR(64) NULL,
  correlation_id    VARCHAR(64) NULL,
  origin_service    VARCHAR(50) NULL,

  -- Payment and refunds tracking
  paid_at           DATETIME NULL,
  total_refunded    DECIMAL(10,2) NOT NULL DEFAULT 0,

  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_order_snapshot
    FOREIGN KEY (order_snapshot_id) REFERENCES orders_snapshot(id),

  CONSTRAINT fk_payments_method
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),

  CONSTRAINT fk_payments_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),

  CONSTRAINT fk_payments_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id),

  UNIQUE KEY uq_payments_order_snapshot (order_snapshot_id),
  UNIQUE KEY uq_payments_order_id (order_id),
  UNIQUE KEY uq_payments_external_payment_id (external_payment_id)
) ENGINE=InnoDB;

CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_status_id ON payments(status_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- ============================================================
-- 5) PAYMENT ATTEMPTS (COBROS_INTENTOS)
-- ============================================================

CREATE TABLE payment_attempts (
  id                 CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id         CHAR(36) NOT NULL,

  result             ENUM('SUCCESS','DENIED','ERROR','TIMEOUT') NOT NULL,
  external_reference VARCHAR(255) NULL,
  response_code      VARCHAR(50) NULL,
  response_message   VARCHAR(500) NULL,

  request_payload    JSON NULL,
  response_payload   JSON NULL,

  request_id         VARCHAR(64) NULL,
  correlation_id     VARCHAR(64) NULL,
  origin_service     VARCHAR(50) NULL,

  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_attempts_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_payment_attempts_payment_id ON payment_attempts(payment_id);

-- ============================================================
-- 6) PAYMENT DISCOUNTS APPLIED (per-transaction log)
-- ============================================================

CREATE TABLE payment_discounts_applied (
  id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id   CHAR(36) NOT NULL,

  type         ENUM('COUPON','PROMO','OTHER') NOT NULL DEFAULT 'COUPON',
  code         VARCHAR(50) NULL,
  description  VARCHAR(255) NULL,
  amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  source       VARCHAR(50) NULL,  -- e.g. DISCOUNTS_SERVICE

  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_discounts_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_payment_discounts_payment_id ON payment_discounts_applied(payment_id);

-- ============================================================
-- 7) REFUNDS (refund_request)
-- ============================================================

CREATE TABLE refunds (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id         CHAR(36) NOT NULL,

  order_id           VARCHAR(64) NULL,
  external_payment_id VARCHAR(64) NULL,

  refund_amount      DECIMAL(10,2) NOT NULL,
  currency_code      CHAR(3) NOT NULL DEFAULT 'GTQ',

  status             ENUM('PENDING','APPROVED','DENIED','ERROR') NOT NULL DEFAULT 'PENDING',
  external_reference VARCHAR(255) NULL,
  reason             VARCHAR(255) NULL,

  request_id         VARCHAR(64) NULL,
  correlation_id     VARCHAR(64) NULL,
  origin_service     VARCHAR(50) NULL,

  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);

-- ============================================================
-- 8) COURIER WALLET + TRANSACTIONS (courier_ledger)
-- ============================================================

CREATE TABLE courier_wallets (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id     CHAR(36) NOT NULL UNIQUE,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE courier_transactions (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id       CHAR(36) NOT NULL,
  payment_id       CHAR(36) NOT NULL,

  type            ENUM('CREDIT','DEBIT') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  previous_balance DECIMAL(12,2) NOT NULL,
  new_balance     DECIMAL(12,2) NOT NULL,
  description     VARCHAR(255) NULL,

  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_courier_tx_wallet
    FOREIGN KEY (courier_id) REFERENCES courier_wallets(courier_id),

  CONSTRAINT fk_courier_tx_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_courier_transactions_courier_id ON courier_transactions(courier_id);
CREATE INDEX idx_courier_transactions_payment_id ON courier_transactions(payment_id);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 9) SEED DATA (METHODS + STATUSES)
-- ============================================================

INSERT INTO payment_methods (code, name, description, is_active) VALUES
  ('CASH',        'cash',        'Cash payment to courier', 1),
  ('CARD_CREDIT', 'card_credit', 'Credit card payment',     1),
  ('CARD_DEBIT',  'card_debit',  'Debit card payment',      1),
  ('COUPON',      'coupon',      'Coupon payment',          1);

INSERT INTO payment_statuses (code, description, is_active) VALUES
  ('PENDING',            'Payment pending', 1),
  ('PROCESSING',         'Payment processing', 1),
  ('APPROVED',           'Payment approved', 1),
  ('DENIED',             'Payment denied', 1),
  ('CANCELLED',          'Payment cancelled', 1),
  ('PARTIALLY_REFUNDED', 'Payment partially refunded', 1),
  ('REFUNDED',           'Payment refunded', 1);

-- ============================================================
-- END
-- ============================================================
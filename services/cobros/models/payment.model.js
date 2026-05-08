module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      order_snapshot_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      courier_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      reservation_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      order_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      external_payment_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      idempotency_key: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      payment_method_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      gross_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      order_total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      coupon_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      service_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      courier_earned_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tip_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      resulting_balance_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_refunded: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "GTQ"
      },
      status_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      settlement_status: {
        type: DataTypes.ENUM("NOT_APPLICABLE", "PENDING", "SETTLED", "OVERDUE"),
        allowNull: false,
        defaultValue: "NOT_APPLICABLE"
      },
      settlement_due_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      settled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      external_reference: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      payment_gateway: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cancellation_reason: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      request_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      correlation_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      origin_service: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "payments",
      underscored: true,
      timestamps: true
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.OrderSnapshot, {
      foreignKey: "order_snapshot_id",
      as: "orderSnapshot"
    });

    Payment.belongsTo(models.PaymentMethod, {
      foreignKey: "payment_method_id",
      as: "paymentMethod"
    });

    Payment.belongsTo(models.PaymentStatus, {
      foreignKey: "status_id",
      as: "status"
    });

    Payment.hasMany(models.PaymentAttempt, {
      foreignKey: "payment_id",
      as: "attempts"
    });

    Payment.hasMany(models.CourierTransaction, {
      foreignKey: "payment_id",
      as: "courierTransactions"
    });
  };

  return Payment;
};
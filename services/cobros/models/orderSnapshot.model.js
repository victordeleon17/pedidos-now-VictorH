module.exports = (sequelize, DataTypes) => {
  const OrderSnapshot = sequelize.define(
    "OrderSnapshot",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      courier_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      delivery_address_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      reservation_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      order_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      product_discounts: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      coupon_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
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
      approved_extra_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tip_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "GTQ"
      },
      final_payment_method_code: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      status_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "orders_snapshot",
      underscored: true,
      timestamps: true
    }
  );

  OrderSnapshot.associate = (models) => {
    OrderSnapshot.belongsTo(models.PaymentStatus, {
      foreignKey: "status_id",
      as: "status"
    });

    OrderSnapshot.hasMany(models.OrderItemSnapshot, {
      foreignKey: "order_id",
      as: "items"
    });

    OrderSnapshot.hasOne(models.Payment, {
      foreignKey: "order_snapshot_id",
      as: "payment"
    });
  };

  return OrderSnapshot;
};
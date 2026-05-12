module.exports = (sequelize, DataTypes) => {
  const OrderItemSnapshot = sequelize.define(
    "OrderItemSnapshot",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      external_product_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      item_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      item_subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      is_combo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: "order_items_snapshot",
      underscored: true,
      timestamps: true,
      updatedAt: false
    }
  );

  OrderItemSnapshot.associate = (models) => {
    OrderItemSnapshot.belongsTo(models.OrderSnapshot, {
      foreignKey: "order_id",
      as: "order"
    });
  };

  return OrderItemSnapshot;
};

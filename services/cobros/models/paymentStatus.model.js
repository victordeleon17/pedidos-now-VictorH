module.exports = (sequelize, DataTypes) => {
  const PaymentStatus = sequelize.define(
    "PaymentStatus",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: "payment_statuses",
      underscored: true,
      timestamps: true
    }
  );

  PaymentStatus.associate = (models) => {
    PaymentStatus.hasMany(models.Payment, {
      foreignKey: "status_id",
      as: "payments"
    });

    PaymentStatus.hasMany(models.OrderSnapshot, {
      foreignKey: "status_id",
      as: "orderSnapshots"
    });
  };

  return PaymentStatus;
};
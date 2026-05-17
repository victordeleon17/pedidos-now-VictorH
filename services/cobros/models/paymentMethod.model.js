module.exports = (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      name: {
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
      tableName: "payment_methods",
      underscored: true,
      timestamps: true
    }
  );

  PaymentMethod.associate = (models) => {
    PaymentMethod.hasMany(models.Payment, {
      foreignKey: "payment_method_id",
      as: "payments"
    });
  };

  return PaymentMethod;
};
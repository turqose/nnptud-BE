const { sequelize } = require("./../config/db");
const { DataTypes } = require("sequelize");

const OrderHistory = sequelize.define(
  "orderHistory",
  {
    order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "order_history",
    timestamps: false,
  },
);

module.exports = OrderHistory;

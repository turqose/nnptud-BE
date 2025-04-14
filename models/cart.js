const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const User = require("./user");

const Cart = sequelize.define(
  "Cart",
  {
    cart_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "carts",
    timestamps: false,
  },
);

module.exports = Cart;

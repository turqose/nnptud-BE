const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Cart = require("./cart");
const Product = require("./product");

const CartItem = sequelize.define(
  "CartItem",
  {
    cart_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      references: {
        model: Cart,
        key: "cart_id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "product_id",
      },
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "cart_items",
    timestamps: false,
  },
);

module.exports = CartItem;

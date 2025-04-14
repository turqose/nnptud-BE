const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Product = require("./product");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    image_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "product_id",
      },
      onDelete: "CASCADE",
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "product_images",
    timestamps: false,
  },
);

module.exports = ProductImage;

const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const User = require("./user");
const Product = require("./product");

const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "user_id",
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
    rating: {
      type: DataTypes.SMALLINT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: false,
  },
);

module.exports = Review;

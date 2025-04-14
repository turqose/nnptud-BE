const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");

const Category = sequelize.define(
  "Category",
  {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
    },
    slug: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  },
);

module.exports = Category;

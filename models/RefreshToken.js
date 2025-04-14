// File: models/RefreshToken.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const User = require("./user");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    token: {
      type: DataTypes.STRING(500),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: false,
  },
);

module.exports = RefreshToken;

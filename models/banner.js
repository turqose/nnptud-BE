const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Banner = sequelize.define("banner", {
  banner_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
});

module.exports = Banner;

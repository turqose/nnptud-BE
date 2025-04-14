const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./user");

const BlogComment = sequelize.define("BlogComment", {
  comment_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: "user_id",
    },
    onDelete: "SET NULL",
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = BlogComment;

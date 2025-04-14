const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Đường dẫn tới cấu hình Sequelize của bạn
const User = require("./user");

const BlogPost = sequelize.define("BlogPost", {
  post_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  author_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: "user_id",
    },
    onDelete: "SET NULL",
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "draft",
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = BlogPost;

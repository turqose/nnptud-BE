const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const bcrypt = require("bcrypt");
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Cho phép null vì người dùng có thể đăng nhập bằng Google
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: "user",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: DataTypes.STRING,
    otpExpires: DataTypes.DATE,
    resetToken: DataTypes.STRING,
    resetExpires: DataTypes.DATE,
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorSecret: DataTypes.STRING,
    twoFactorBackupCodes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    currentToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    googleAccessToken: DataTypes.STRING, // Lưu trữ access token từ Google
    googleRefreshToken: DataTypes.STRING, // Lưu trữ refresh token từ Google
    displayName: DataTypes.STRING, // Tên hiển thị từ Google
    avatar: DataTypes.STRING, // URL ảnh đại diện từ Google
  },
  {
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  },
);
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};
module.exports = User;

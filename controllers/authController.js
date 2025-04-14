const { Op } = require("sequelize");
const { User } = require("../models");
const { generateTokens, verifyToken } = require("../utils/jwt");
const mailer = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
// Đăng ký
const register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await User.create({
      email,
      password,
      phone,
      full_name: full_name,
      otp,
      otpExpires,
    });

    await mailer.sendVerificationEmail(email, otp);

    res
      .status(201)
      .json({ message: "User registered. Please check your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xác thực OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password, googleId } = req.body;
    if (googleId) {
      // Đăng nhập bằng Google
      const user = await User.findOne({ where: { googleId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const { accessToken, refreshToken } = generateTokens(user);
      return res.json({ accessToken, refreshToken });
    } else {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: "Email not verified" });
      }
      if (user.twoFactorEnabled) {
        // Trả về flag yêu cầu 2FA
        return res.json({
          requires2FA: true,
          tempToken: generateTokens(user), // Tạo token tạm
        });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      if (process.env.USE_REDIS === "true") {
        const redisClient = require("../config/redis");
        await redisClient.set(`user:${user.user_id}:token`, accessToken);
      } else {
      }
      user.currentToken = accessToken;
      await user.save();
      res.json({ accessToken, refreshToken });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { userId: user.user_id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    user.resetToken = resetToken;
    user.resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    await user.save();

    await mailer.sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đổi mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = verifyToken(token, process.env.RESET_TOKEN_SECRET);
    if (!decoded) return res.status(400).json({ message: "Invalid token" });

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Đổi mật khẩu (đã đăng nhập)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ message: "Invalid password" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin user
const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findByPk(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (user === null) {
      return res.status(400).json({ message: "Invalid request" });
    }
    // Tạo secret mới
    const secret = speakeasy.generateSecret({
      name: `My App (${user.email})`,
    });

    // Tạo QR code URL
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) throw err;

      // Lưu secret tạm thời (chưa kích hoạt)
      user.twoFactorSecret = secret.base32;
      var listBackupCodes = generateBackupCodes();
      user.twoFactorBackupCodes = listBackupCodes;
      user.save();

      res.json({
        qrCodeUrl: data_url,
        secret: secret.base32,
        backupCodes: listBackupCodes, // Tạo mã dự phòng
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xác minh 2FA
const verify2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) return res.status(400).json({ message: "Invalid request" });

    // Kiểm tra mã dự phòng trước
    console.log(user.twoFactorBackupCodes);

    if (backupCode) {
      if (user.twoFactorBackupCodes.includes(backupCode)) {
        // Xoá mã đã sử dụng
        user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(
          (code) => code !== backupCode,
        );
        console.log("user");

        try {
          await user.save();
        } catch (error) {
          console.log(error);
        }
        const { accessToken, refreshToken } = generateTokens(user, true);
        return res.json({ accessToken, refreshToken });
      }
      return res.status(400).json({ message: "Invalid backup code" });
    } // Kiểm tra mã TOTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) return res.status(400).json({ message: "Invalid token" });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vô hiệu hoá 2FA
const disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = null;
    await user.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mã dự phòng
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(
      Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase(),
    );
  }
  return codes;
};
const logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (process.env.USE_REDIS === "true") {
      const redisClient = require("../config/redis");
      await redisClient.del(`user:${userId}:token`);
    } else {
      const user = await User.findByPk(userId);
      user.currentToken = null;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) return res.sendStatus(403);

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.sendStatus(404);

    // Tạo token mới
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Cập nhật token mới
    if (process.env.USE_REDIS === "true") {
      const redisClient = require("../config/redis");
      await redisClient.set(`user:${user.id}:token`, accessToken);
    } else {
      user.currentToken = accessToken;
      await user.save();
    }

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  refreshToken,
  logout,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  setup2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes,
};

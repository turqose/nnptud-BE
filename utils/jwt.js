const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateTokens = (user, twoFactorVerified = false) => {
  console.log("user", user);

  const accessToken = jwt.sign(
    { userId: user.user_id, role: user.role, twoFactorVerified },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user.user_id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log("lỗi :" + error);
    return null;
  }
};

module.exports = { generateTokens, verifyToken };

// config/jwt.js
module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
};

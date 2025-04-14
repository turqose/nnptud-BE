const { User } = require("../models");
const { verifyToken } = require("../utils/jwt");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) return res.sendStatus(403);

  let storedToken;
  if (process.env.USE_REDIS === "true") {
    const redisClient = require("../config/redis");
    storedToken = await redisClient.get(`user:${decoded.userId}:token`);
  } else {
    const user = await User.findByPk(decoded.userId);
    storedToken = user.currentToken;
  }

  if (storedToken !== token) {
    return res.status(401).json({ message: "Logged in from another device" });
  }

  req.user = decoded;
  next();
};
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
const check2FA = async (req, res, next) => {
  const user = await User.findByPk(req.user.userId);

  if (user.twoFactorEnabled && !req.user.twoFactorVerified) {
    return res.status(403).json({
      message: "2FA verification required",
    });
  }

  next();
};

module.exports = { authenticate, authorize, check2FA };
